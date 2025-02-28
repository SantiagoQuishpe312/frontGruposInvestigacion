import { Component, OnInit } from '@angular/core';
import { Annexes } from 'src/app/types/annexes.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
    selector: 'app-carga-anexo',
    templateUrl: './creation_proposal.html',
    styleUrls: ['./creation_proposal.scss']
})
export class PropuestaGIComponent implements OnInit {
    selectedFile: File | undefined;
    fileName: string = '';
    fileUploaded: boolean = false;
    currentDate: Date = new Date();
    currentUser: string;
    groupId: number;
    token: string
    constructor(
        private annexesService: AnnexesService,
        private router: Router,
        private authService: AuthService,
        private documentService: DocumentsService,
        private invGroupService: InvGroupService,
        private creationReqService: CreationReqService,
        private matSnackBar:MatSnackBar
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.groupId = Number(sessionStorage.getItem('invGroup'));
        this.token = sessionStorage.getItem('access_token');
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

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                const year = this.currentDate.getFullYear();
                const month = ('0' + (this.currentDate.getMonth() + 1)).slice(-2);
                const day = ('0' + this.currentDate.getDate()).slice(-2);
                const hours = ('0' + this.currentDate.getHours()).slice(-2);
                const minutes = ('0' + this.currentDate.getMinutes()).slice(-2);
                const seconds = ('0' + this.currentDate.getSeconds()).slice(-2);
                const groupId = sessionStorage.getItem('invGroup');
                const customFileName = `propuesta_Grupo_${groupId}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.pdf`;

                const archivoRenombrado = new File([file], customFileName, { type: file.type });
                this.selectedFile = archivoRenombrado;
            } else {
                alert('Por favor, seleccione un archivo PDF.');
                input.value = '';
            }
        }
    }



    onSubmit() {
        if (this.selectedFile) {
            const fileToUpload = this.selectedFile;
            const sistema = 'publicaciones'
            this.documentService.saveDocument(this.token, fileToUpload, sistema).subscribe(response => {
                const annexes: Annexes = {
                    idAnexo: null,
                    idDocumento:1,
                    idGrupo: this.groupId,
                    nombreAnexo: response.fileName,
                    rutaAnexo: response.uuid,
                    usuarioCreacionAnexo: this.currentUser,
                    fechaCreacionAnexo: this.currentDate,
                    usuarioModificacionAnexo: '',
                    fechaModificacionAnexo: null
                }
                this.annexesService.createAnnexesForm(annexes).subscribe((response) => {
                    this.actualizarEstados();
                    
                      setTimeout(() => {
                        this.matSnackBar.open('Solicitudes Enviados correctamente.', 'Cerrar', {
                            duration: 3000,
                          });
                        this.router.navigateByUrl('main/dashboard');
                      }, 1000);
                })
            }), (err) => {
                console.log(err);
            }

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
    actualizarEstados(){
    
        this.creationReqService.getByGroup(this.groupId).subscribe(data=>{
          const creationReq:CreationReqForm={
             idPeticionCreacion:data.idPeticionCreacion,
             idGrupoInv:data.idGrupoInv,
             alineacionEstrategica: data.alineacionEstrategica,
              estado:"4", 
              usuarioCreacionPeticion:data.usuarioCreacionPeticion,
              fechaCreacionPeticion:data.fechaCreacionPeticion,
              usuarioModificacionPeticion:this.currentUser,
              fechaModificacionPeticion:this.currentDate
          }
          this.creationReqService.update(data.idPeticionCreacion,creationReq).subscribe(
            (response)=>{console.log("Enviado" + response)
            });
        })
        this.invGroupService.getById(this.groupId).subscribe(data=>{
          const invGroup:InvGroupForm={
            idGrupoInv:this.groupId,
            idCoordinador:data.idCoordinador,
            nombreGrupoInv:data.nombreGrupoInv,
            estadoGrupoInv:"revDirDep",
            acronimoGrupoinv:data.acronimoGrupoinv,
            usuarioCreacion:data.usuarioCreacion,
            fechaCreacion:data.fechaCreacion,
            usuarioModificacion:this.currentUser,
            fechaModificacion:this.currentDate,
            proceso:'3',
    
          }
          this.invGroupService.update(this.groupId,invGroup).subscribe(
            (response)=>{console.log("Enviado grupo" + response)
            });
        })
      }

}
