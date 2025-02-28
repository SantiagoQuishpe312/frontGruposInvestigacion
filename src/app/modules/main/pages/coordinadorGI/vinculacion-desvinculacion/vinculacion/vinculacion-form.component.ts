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
  constructor(
    private fb: FormBuilder,
    private linkService: LinkService,
    private invGroupService: SolCreaGiService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private dialog: MatDialog,
    private annexesService: AnnexesService,
    private documentService: DocumentsService
  ) { this.user = null; }

  ngOnInit(): void {
    this.loadData();
    const currentUser = this.authService.getUserName();
    const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    const groupId = sessionStorage.getItem("invGroup");
    this.link = this.fb.group({
      idGrupoInv: [groupId, Validators.required],
      idUser: [1, Validators.required],
      justificacion: ['', Validators.required],
      observaciones: ['', Validators.required],
      estado: ['e', Validators.required],
      tipo: ['vinc', Validators.required],
      usuarioCreacion: [currentUser, Validators.required],
      fechaCreacion: [currentDate],
      usuarioModificacion: [''],
      fechaModificacion: [''],
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MembersGroup, {
      width: '60%',
      height: '90%',
      data: { usuarios: this.user }

    });

    dialogRef.afterClosed().subscribe((data: { user: any, usuarioValue: any }) => {
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
    this.link.get('idUser').setValue(this.user.idUsuario);
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
        return;
      }
      this.selectedFile = file;
      const groupId = sessionStorage.getItem('invGroup');
      const customFileName = `doc_vinculacion_Grupo_${groupId}_User_${this.username}.pdf`;
      this.setFileName(customFileName);
    }
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
    const groupId = sessionStorage.getItem('invGroup');
    const customFileName = `doc_vinculacion_Grupo_${groupId}_User_${this.username}.pdf`;
    this.validateFileType();

    this.setFileName(customFileName);

  }
  validateFileType() {
    if (this.selectedFile) {
      const fileExtension = this.selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'pdf') {
        alert('Solo se permiten archivos PDF.');
        this.clearFileInput();
      }
    }
  }
  clearFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  setFileName(name: string) {
    const modifiedFile = new File([this.selectedFile], name, { type: this.selectedFile.type });
    this.selectedFile = modifiedFile;
    console.log(modifiedFile);
  }

  onSubmit() {
    if (this.selectedFile) {
      const fileToUpload = this.selectedFile;
      const groupId = sessionStorage.getItem('invGroup');
      const currentUser = this.authService.getUserName();
      const currentDate = new Date();
      const token = sessionStorage.getItem('access_token');
      const sistema = 'publicaciones'
      this.documentService.saveDocument(token, fileToUpload, sistema).subscribe(response => {
        //console.log(response);
        const annexesData: any = {
          idAnexo: 0,
          usuarioCreacionAnexo: currentUser,
          fechaCreacionAnexo: currentDate,
          usuarioModificacionAnexo: '',
          fechaModificacionAnexo: null,
          idGrupo: parseInt(groupId || '0'),
          nombreAnexo: response.uuid,
          rutaAnexo: response.fileName
        };
        this.annexesService.createAnnexesForm(annexesData).subscribe(
          () => {
            console.log('Archivo subido con éxito.');
            this.fileUploaded = true;
            setTimeout(() => {
              this.router.navigateByUrl('main/dashboard');
            }, 1000);
          },
          (error) => {
            console.error('Error al subir el archivo:', error);
          }
        );
      })
    }
  }
  getFileIcon(fileType: string | undefined): string {
    if (!fileType) return '';
    const lowerCaseFileType = fileType.toLowerCase();
    const fileIcons: { [key: string]: string } = {
      'pdf': 'far fa-file-pdf'
    };
    const iconClass = fileIcons[lowerCaseFileType] || fileIcons['default'];
    return iconClass;
  }
}
