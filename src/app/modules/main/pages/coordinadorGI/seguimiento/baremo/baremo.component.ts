import { Component, OnInit } from '@angular/core';
import { Annexes } from 'src/app/types/annexes.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { DatePipe } from '@angular/common';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvGroupForm } from 'src/app/types/invGroup.types';

@Component({
  selector: 'app-carga-anexo',
  templateUrl: './baremo.component.html',
  styleUrls: ['./baremo.component.scss']
})
export class CargaBaremoComponent implements OnInit {
  selectedFile: File | undefined;
  fileName: string = '';
  fileUploaded: boolean = false;
  currentDate: Date = new Date();
  currentUser: string;
  groupId: number;
  token: string;
  loading: boolean = true;
  originalFileName: string;

  constructor(
    private annexesService: AnnexesService,
    private router: Router,
    private authService: AuthService,
    private documentService: DocumentsService,
    private invGroupService: InvGroupService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUserName();
    this.groupId = Number(sessionStorage.getItem('invGroup'));
    this.token = sessionStorage.getItem('access_token');
    this.loading = false;
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
      return;
  }
  this.originalFileName = this.selectedFile.name;
  const name = `memorando_seguimiento_GI_${this.groupId}_${this.currentDate.getFullYear()}-${this.currentDate.getMonth() + 1}-${this.currentDate.getDate()}.pdf`;
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
onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
  this.validateFileType();

}


  onSubmit() {
    this.loading = true;
    if (this.selectedFile) {
        const fileToUpload = this.selectedFile;
        const sistema = 'GruposInv';

        this.documentService.saveDocument(this.token, fileToUpload, sistema).subscribe({
            next: (response) => {
                const annexes: Annexes = {
                    idAnexo: null,
                    idDocumento: 1,
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
                        this.matSnackBar.open('Memorando enviado correctamente.', 'Cerrar', {
                            duration: 3000,
                        });
                        this.loading = false;

                    },
                    error: (err) => {
                        console.error('Error al guardar anexos:', err);
                        this.loading = false;
                        this.matSnackBar.open('Error al enviar las solicitudes.', 'Cerrar', {
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
    if (!fileType) return ''; // Manejar el caso en que el tipo de archivo no esté definido

    // Convertir el tipo de archivo a minúsculas para manejar casos insensibles a mayúsculas y minúsculas
    const lowerCaseFileType = fileType.toLowerCase();

    // Mapear extensiones de archivo comunes a sus respectivos iconos
    const fileIcons: { [key: string]: string } = {
      'pdf': 'far fa-file-pdf', // Ejemplo de clase de estilo para un archivo PDF usando FontAwesome
      'doc': 'far fa-file-word', // Ejemplo de clase de estilo para un archivo de Word
      'docx': 'far fa-file-word', // Ejemplo de clase de estilo para un archivo de Word
      'txt': 'far fa-file-alt', // Ejemplo de clase de estilo para un archivo de texto
      'default': 'far fa-file' // Icono predeterminado para otros tipos de archivo
    };

    // Obtener el icono del archivo según su extensión
    const iconClass = fileIcons[lowerCaseFileType] || fileIcons['default'];

    return iconClass; // Retornar la clase de estilo del icono
  }
   goBack() {
          this.router.navigateByUrl('main/dashboard');
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
                  proceso: '14',
  
              }
              this.invGroupService.update(this.groupId, invGroup).subscribe(
                  (response) => {
                      this.router.navigateByUrl('main/dashboard');
                  });
          })
      }
  


}
