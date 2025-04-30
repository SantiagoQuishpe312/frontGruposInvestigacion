import { DatePipe } from '@angular/common';
import { Component, OnInit,Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { SolCreaGiService } from 'src/app/core/http/sol-crea-gi/sol-crea-gi.service';
import { LinkService } from 'src/app/core/http/link/link.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { Link} from 'src/app/types/link.types';
import { Usuario } from 'src/app/types/usuario.types';
import { MatDialog } from '@angular/material/dialog';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';

@Component({
  selector: 'vex-desvinculacion-form',
  templateUrl: './desvinculacion.component.html',
  styleUrls: ['../vinculacion-form.component.scss']
})

export class DesvinculacionFormComponent implements OnInit {

  savedMessage: string;
  link: FormGroup;
  grupos: any;
  coordinadores: any;
  investigadores: any[];
  linkForms: any[]=[];
  isLinear = false;
  coordinadorNombre: string = '';
  user:any;
  miembros:any[]
  members: any[];
  //Para el anexo
  selectedFile: File | undefined;
  fileName: string = '';
  fileUploaded: boolean = false; 
  username:string;
  groupId:number;
  constructor(
    private fb: FormBuilder,
    private linkService: LinkService,
    private invGroupService:SolCreaGiService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private dialog: MatDialog,
    private invMemberService: InvMemberService,
    private annexesService:AnnexesService

  ) { this.user=null;}

  
  ngOnInit(): void {
    this.loadData();
    const currentUser = this.authService.getUserName();
    const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.groupId=Number(sessionStorage.getItem("invGroup"));
    this.link = this.fb.group({
      idGrupoInv: [this.groupId, Validators.required],
      idUser: [1, Validators.required],
      justificacion: ['', Validators.required],
      observaciones: ['', Validators.required],
      estado: ['e', Validators.required],
      tipo:['desv', Validators.required],

      usuarioCreacion: [currentUser,Validators.required],
      fechaCreacion: [currentDate],
      usuarioModificacion: [''],
      fechaModificacion: [''],
    });
  }
  
  
  loadCoordinator(groupId: number) {
    this.usuarioService.getById(groupId).subscribe(coordinator => {
        this.link.get('coordinatorName').setValue(`${coordinator.nombre} `);
    });
   
}
  
selectMember(userId: number) {
    this.user = this.miembros.find(m => m.idUsuario === userId);
    console.log(this.user);
  }
  
  loadData(): void {
    const idGroup=Number(sessionStorage.getItem('invGroup'));
    this.invGroupService.getById(idGroup).subscribe((data)=>{
      this.grupos=data;
      console.log(data)
    })
    const idUser=Number(sessionStorage.getItem('userId'))
    this.usuarioService.getById(idUser).subscribe((data)=>{
      this.coordinadores=data;
    })
    
 
    this.invMemberService.getByGroup(idGroup).subscribe((data)=>{
        this.members=data;
        this.loadMembers();
    })

  }
  loadMembers() {
    this.miembros = []; // Inicializa el array miembros aquí
  
    this.members.forEach((m) => {
      this.usuarioService.getById(m.idUsuario).subscribe((data) => {
        this.miembros.push(data);
      });
    });
  }
  

  createLink() {

    if (this.link.valid) {
      const linkData: Link = this.link.value;
      this.linkService.createLinkForm(linkData).subscribe(
        () => {
          this.onSubmit();
          setTimeout(() => {
            this.router.navigateByUrl('main/principal');
          }, 2000); 
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
      this.setFileName(file.name);
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
    this.setFileName(this.selectedFile.name);
  }

  setFileName(name: string) {
    this.fileName = name;
  }

  onSubmit() {
    console.log("onSubmit");
    if (this.selectedFile) {
      const fileToUpload = this.selectedFile;
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
      const day = ('0' + currentDate.getDate()).slice(-2);
      const hours = ('0' + currentDate.getHours()).slice(-2);
      const minutes = ('0' + currentDate.getMinutes()).slice(-2);
      const seconds = ('0' + currentDate.getSeconds()).slice(-2);
      const groupId = sessionStorage.getItem('invGroup');
      const customFileName =  `doc_desvinculacion_Grupo_${groupId}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.pdf`;
      const currentUser = this.authService.getUserName();
      const annexesData: any = {
        idAnexo: 0, 
        usuarioCreacionAnexo: currentUser, 
        fechaCreacionAnexo: currentDate, 
        usuarioModificacionAnexo: '', 
        fechaModificacionAnexo: currentDate, 
        idGrupo: parseInt(groupId || '0'),
        nombreAnexo: customFileName,
        rutaAnexo: `https://www.repositorio.espe.edu.ec/creacionGrupos/${customFileName}`
      };

      this.annexesService.createAnnexesForm(annexesData).subscribe(
        () => {
          console.log('Archivo subido con éxito.');
          this.fileUploaded = true; // Establecer la bandera a verdadero cuando el archivo se haya cargado correctamente
          setTimeout(() => {
            this.router.navigateByUrl('main/seguimiento');
          }, 1000); 
        },
        (error) => {
          console.error('Error al subir el archivo:', error);
        }
      );

      console.log('Archivo seleccionado:', fileToUpload);
      console.log('Nombre personalizado:', customFileName);
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
 