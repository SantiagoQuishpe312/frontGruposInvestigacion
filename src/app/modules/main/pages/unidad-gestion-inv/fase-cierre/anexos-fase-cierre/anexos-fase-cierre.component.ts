import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Annexes } from 'src/app/types/annexes.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';

@Component({
  selector: 'vex-anexos-fase-cierre',
  templateUrl: './anexos-fase-cierre.component.html',
  styleUrls: ['./anexos-fase-cierre.component.scss']
})
export class AnexosFaseCierreComponent implements OnInit {
  selectedFile: File | undefined;
  fileName: string = '';
  fileUploaded: boolean = false;
  currentDate: Date = new Date();
  currentUser: string;
  groupId: number;
  idDocumento: number;
  token: string;
  loading: boolean = false;
  originalFileName: string;
  storeLocally: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AnexosFaseCierreComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      grupoId: number,
      annexType: string,
      idDocumento: number,
      storeLocally: boolean
    },
    private annexesService: AnnexesService,
    private router: Router,
    private authService: AuthService,
    private documentService: DocumentsService,
    private matSnackBar: MatSnackBar,
    private invGroupService: InvGroupService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUserName();
    this.groupId = this.data.grupoId || Number(localStorage.getItem('GI'));
    this.idDocumento = this.data.idDocumento || 1;
    this.token = sessionStorage.getItem('access_token');
    this.storeLocally = this.data.storeLocally || false;
  }

  onDrop(event: any) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'pdf') {
        alert('Solo se permiten archivos PDF.');
        this.clearFileInput();
        return;
      }
      this.selectedFile = file;
      this.setFileName();
    }
  }

  setFileName() {
    if (!this.selectedFile) {
      console.error("Error: No hay archivo seleccionado.");
      return;
    }

    const annexType = this.data.annexType.toLowerCase();
    const formattedDate = `${this.currentDate.getFullYear()}-${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}-${this.currentDate.getDate().toString().padStart(2, '0')}`;
    const name = `${annexType}_anexo_fase_cierre_GI_${this.groupId}_${formattedDate}.pdf`;
    const modifiedFile = new File([this.selectedFile], name, { type: this.selectedFile.type });
    this.selectedFile = modifiedFile;
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.add('drag-over');
  }

  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('drag-over');
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.validateFileType();
  }

  validateFileType() {
    if (this.selectedFile) {
      const fileExtension = this.selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'pdf') {
        alert('Solo se permiten archivos PDF.');
        this.clearFileInput();
        this.selectedFile = undefined;
      } else {
        this.setFileName();
      }
    }
  }

  clearFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }



  onSubmit() {
    this.loading = true;
    if (this.selectedFile) {
      if (this.storeLocally) {
        const fileToUpload = this.selectedFile;
        const sistema = 'GruposInv';

        const tempUuid = 'temp-' + Math.random().toString(36).substring(2, 15);

        const annexData = {
          idAnexo: null,
          idDocumento: this.idDocumento,
          idGrupo: this.groupId,
          nombreAnexo: this.selectedFile.name,
          rutaAnexo: tempUuid,
          usuarioCreacionAnexo: this.currentUser,
          fechaCreacionAnexo: this.currentDate,
          usuarioModificacionAnexo: '',
          fechaModificacionAnexo: null,
          file: this.selectedFile,
          isLocalOnly: true
        };

        this.matSnackBar.open('Anexo agregado correctamente (pendiente de envío).', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
        this.dialogRef.close(annexData);
        return;
      }

      const fileToUpload = this.selectedFile;
      const sistema = 'GruposInv';

      this.documentService.saveDocument(this.token, fileToUpload, sistema).subscribe({
        next: (response) => {
          const annexes: Annexes = {
            idAnexo: null,
            idDocumento: this.idDocumento,
            idGrupo: this.groupId,
            nombreAnexo: response.fileName,
            rutaAnexo: response.uuid,
            usuarioCreacionAnexo: this.currentUser,
            fechaCreacionAnexo: this.currentDate,
            usuarioModificacionAnexo: '',
            fechaModificacionAnexo: null
          };

          this.annexesService.createAnnexesForm(annexes).subscribe({
            next: () => {
              this.actualizarEstados();
              this.matSnackBar.open('Anexo enviado correctamente.', 'Cerrar', {
                duration: 3000,
              });
              this.loading = false;
              this.dialogRef.close(annexes);
            },
            error: (err) => {
              console.error('Error al guardar anexos:', err);
              this.loading = false;
              this.matSnackBar.open('Error al enviar el anexo.', 'Cerrar', {
                duration: 3000,
              });
            }
          });
        },
        error: (err) => {
          console.error('Error al guardar documento:', err);
          this.loading = false;
          this.matSnackBar.open('Error al guardar el documento.', 'Cerrar', {
            duration: 3000,
          });
        }
      });
    }
  }

  getFileIcon(fileType: string | undefined): string {
    if (!fileType) return 'far fa-file';
    const fileIcons: { [key: string]: string } = {
      'application/pdf': 'far fa-file-pdf',
      'image/png': 'far fa-file-image',
      'image/jpeg': 'far fa-file-image',
      'image/jpg': 'far fa-file-image',
      'image/gif': 'far fa-file-image',
      'image/bmp': 'far fa-file-image',
      'image/webp': 'far fa-file-image',
      'image/tiff': 'far fa-file-image',
      'image/svg+xml': 'far fa-file-image',
    };

    return fileIcons[fileType] || 'far fa-file';
  }

  actualizarEstados() {
    this.invGroupService.getById(this.groupId).subscribe(data => {
      const invGroup: InvGroupForm = {
        idGrupoInv: this.groupId,
        idCoordinador: data.idCoordinador,
        nombreGrupoInv: data.nombreGrupoInv,
        estadoGrupoInv: data.estadoGrupoInv,
        acronimoGrupoinv: data.acronimoGrupoinv,
        usuarioCreacion: data.usuarioCreacion,
        fechaCreacion: data.fechaCreacion,
        usuarioModificacion: this.currentUser,
        fechaModificacion: this.currentDate,
        proceso: '16'
      }
      this.invGroupService.update(this.groupId, invGroup).subscribe(
        (response) => {
          localStorage.removeItem('GI');
          this.router.navigate(['main/fase-cierre']);
        });
    })
  }
}