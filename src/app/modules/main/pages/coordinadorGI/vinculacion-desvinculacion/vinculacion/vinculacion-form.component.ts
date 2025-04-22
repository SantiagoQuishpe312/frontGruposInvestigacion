import { DatePipe } from '@angular/common';
import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { SolCreaGiService } from 'src/app/core/http/sol-crea-gi/sol-crea-gi.service';
import { LinkService } from 'src/app/core/http/link/link.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { Link } from 'src/app/types/link.types';
import { MatDialog } from '@angular/material/dialog';
import { MembersGroup } from '../../../creation-form/creation-form/membersGroup.component';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';

@Component({
  selector: 'vex-vinculacion-form',
  templateUrl: './vinculacion-form.component.html',
  styleUrls: ['../vinculacion-form.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class VinculacionFormComponent implements OnInit {
  savedMessage: string;
  link: FormGroup;
  grupos: any;
  coordinadores: any;
  investigadores: any[];
  linkForms: any[] = [];
  isLinear = false;
  coordinadorNombre: string = '';
  user: any;
  //Para el anexo
  selectedFile: File | undefined;
  fileName: string = '';
  fileUploaded: boolean = false;
  username: string;
  currentDate: Date = new Date();
  currentUser: string;
  groupId: number;
  originalFileName: string;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private linkService: LinkService,
    private invGroupService: InvGroupService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private dialog: MatDialog,
    private annexesService: AnnexesService,
    private documentService: DocumentsService,
    private matSnackBar: MatSnackBar
  ) { this.user = null; }

  ngOnInit(): void {
    this.groupId = Number(sessionStorage.getItem('invGroup'));
    this.loadData();
    this.currentUser = this.authService.getUserName();
    this.link = this.fb.group({
      idGrupoInv: [this.groupId, Validators.required],
      idUser: [1, Validators.required],
      justificacion: ['', Validators.required],
      observaciones: ['', Validators.required],
      estado: ['e', Validators.required],
      tipo: ['v', Validators.required],
      usuarioCreacion: [this.currentUser, Validators.required],
      fechaCreacion: [this.currentDate],
      usuarioModificacion: ['0'],
      fechaModificacion: [this.currentDate],
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MembersGroup, {
      width: '60%',
      height: '90%',
      data: { usuarios: this.user }

    });

    dialogRef.afterClosed().subscribe((data: { user: any, usuarioValue: any }) => {
      console.log(data);
      this.usuarioService.getByUserName(data.usuarioValue).subscribe((data) => {
        this.user = data;
      })
      this.username = data.usuarioValue;
    });
  }


  loadCoordinator(groupId: number) {
    this.usuarioService.getById(groupId).subscribe(coordinator => {
      this.link.get('coordinatorName').setValue(`${coordinator.nombre}}`);
    });
  }

  loadData(): void {
    const idGroup = Number(sessionStorage.getItem('invGroup'));
    this.invGroupService.getById(idGroup).subscribe((data) => {
      this.grupos = data;
    })
    const idUser = Number(sessionStorage.getItem('userId'))
    this.usuarioService.getById(idUser).subscribe((data) => {
      this.coordinadores = data;
    })

    this.usuarioService.getAll().subscribe(usuario => {
      this.investigadores = usuario.map(u => ({ nombre: u.nombre, id: u.id }));
    });
  }

  createLink() {
    this.link.get('idUser').setValue(this.user.id);
    if (this.link.valid) {
      const linkData: Link = this.link.value;
      this.linkService.createLinkForm(linkData).subscribe(
        () => {
          this.onSubmit();
        },
        (error) => {
          console.error('Error al crear la linea', error);
        }
      );
    } else {
      console.error('El formulario no es válido. Verifica los campos.');
      console.log(this.link.value);
      this.savedMessage = 'Verifica los campos del formulario';
      Object.values(this.link.controls).forEach(control => {
        control.markAsTouched();
      });
    }
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
    this.originalFileName = this.selectedFile.name;
    const name = `solicitud_vinculacion_GI_${this.groupId}_${this.currentDate.getFullYear()}-${this.currentDate.getMonth() + 1}-${this.currentDate.getDate()}.pdf`;
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
      const fileToUpload = this.selectedFile;
      const sistema = 'GruposInv';
      const token = sessionStorage.getItem('access_token');
      this.documentService.saveDocument(token, fileToUpload, sistema).subscribe(response => {
        const annexesData: any = {
          idAnexo: 0,
          usuarioCreacionAnexo: this.currentUser,
          fechaCreacionAnexo: this.currentDate,
          usuarioModificacionAnexo: '',
          fechaModificacionAnexo: null,
          idGrupo: this.groupId,
          nombreAnexo: response.fileName,
          rutaAnexo: response.uuid
        };
        this.annexesService.createAnnexesForm(annexesData).subscribe(
          () => {
            this.loading = false;
            this.actualizarEstados();
          },
          (error) => {
            this.matSnackBar.open('Error al enviar resolución.', 'Cerrar', {
              duration: 3000,
            });
          }
        );
      })
    }
  }
  getFileIcon(fileType: string | undefined): string {
    if (!fileType) return 'far fa-file'; // Ícono genérico si no hay tipo de archivo
    const fileIcons: { [key: string]: string } = {
      'application/pdf': 'far fa-file-pdf', // Ícono para PDF
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
        proceso: '38',
        usuarioCreacion: data.usuarioCreacion,
        fechaCreacion: data.fechaCreacion,
        usuarioModificacion: this.currentUser,
        fechaModificacion: this.currentDate

      }
      this.invGroupService.update(this.groupId, invGroup).subscribe(
        (response) => {
          localStorage.removeItem('GI');
          this.router.navigate(["main/dashboard"]);
        });
    })


  }

}
