import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { SolCreaGiService } from 'src/app/core/http/sol-crea-gi/sol-crea-gi.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { AcademicDomainService } from 'src/app/core/http/academic-domain/academic-domain.service';
import { AreaService } from 'src/app/core/http/area/area.service';
import { LineService } from 'src/app/core/http/line/line.service';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { MatDialog } from '@angular/material/dialog';
import { MembersGroup } from '../../creation-form/creation-form/membersGroup.component';
import { SelectCoordinadorGroup } from './modales_gestion/selectCoordinador.component';
import { InvGroup_academicDomainService } from 'src/app/core/http/invGroup_academicDomain/invGroup_academicDomain.service';
import { InvGroup_linesService } from 'src/app/core/http/InvGroup_line/invGroup_linesService.service';
import { InvGroup_areaService } from 'src/app/core/http/invGroup_area/crea-area.service';
import { InvGroup_academicDomain } from 'src/app/types/invGroup_academicDomain';
import { InvGroup_line } from 'src/app/types/invGroup_line';
import { InvGroup_area } from 'src/app/types/invGroup_area.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { UserRolService } from 'src/app/core/http/userRol/userRol.service';
import { UserRoles } from 'src/app/types/userRol.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { Annexes } from 'src/app/types/annexes.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { Usuario } from 'src/app/types/usuario.types';
import { SeleccionRolDialogComponent } from '../../creation-form/SeleccionRolDialogComponent';
@Component({
  selector: 'vex-creation-form',
  templateUrl: './crearGI.component.html',
  styleUrls: ['../../coordinadorGI/faseCreacion/sol-creacion/sol-creacion.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class CrearGIComponent implements OnInit {
  selectedUsers: any[] = [];
  documentosCargados = {};
  token: string;
  selectedUserCoord: any;
  userIdSelectCoord: number;
  selectedUsersExterns: any[] = [];
  selectedFiles: File[] = [];
  userIdSelect: any[] = [];
  dominiosControl = new FormControl();
  areasControl = new FormControl();
  lineasControl = new FormControl();
  isLinear = true;
  savedMessage: string;
  myForm: FormGroup;
  reqFormResponse: any;
  usuarios: any[] = [];
  dominios: any[];
  areas: any[];
  lineas: any[];
  investigadores: number[] = [1];
  investigadoresExterns: number[] = [1];
  invGroupExists: boolean = false;
  checklistForm: FormGroup;
  checkList: any;
  revisado: any;
  check: boolean = false;
  grupo: InvGroupForm;
  loadingData: boolean = true;
  currentUser: string;
  currentDate: any;
  currentUserId: number;
  isSaved: boolean = false;
  public isLoading: boolean = true; // Inicializar como true para que el spinner aparezca al inicio
  idGrupo: number;
  constructor(
    private builder: FormBuilder,
    private snackBar: MatSnackBar,
    private invGroupService: InvGroupService,
    private authService: AuthService,
    private apiInvGroupService: InvGroupService,
    private academicDomainService: AcademicDomainService,
    private areaService: AreaService,
    private lineService: LineService,
    private apiInvMemberService: InvMemberService,
    private router: Router,
    private dialog: MatDialog,
    private usuarioService: UsuarioService,
    private invGroup_areaService: InvGroup_areaService,
    private invGroup_academicDomainService: InvGroup_academicDomainService,
    private invGroup_linesService: InvGroup_linesService,
    private userRolService: UserRolService,
    private documentService: DocumentsService,
    private annexesService: AnnexesService,
    private matSnackBar: MatSnackBar
  ) { this.usuarios = []; }

  ngOnInit(): void {
    this.currentUser = this.authService.getUserName();
    this.currentDate = new Date();
    this.currentUserId = Number(sessionStorage.getItem("userId"));
    this.areasControl.valueChanges.subscribe((selectedAreas: any[]) => {
      this.updateLineasByAreas(selectedAreas);

    });
    this.dominiosControl.valueChanges.subscribe((selectedDominios: any[]) => {
      this.updateAreasByDominios(selectedDominios);
    })
    this.cargarFormularios();
  }
  updateAreasByDominios(selectedDominios: any[]) {
    this.areas = []; // Limpia las areas actuales
    if (selectedDominios.length > 0) {
      selectedDominios.forEach((idDomimioAcademico) => {
        this.areaService.getAreasByDominio(idDomimioAcademico).subscribe((areasDominio: any[]) => {
          this.areas = [
            ...this.areas,
            ...areasDominio.filter(
              (area) => !this.areas.some((a) => a.idArea === area.idArea)
            ),
          ];
        });
      });
    }
  }
  updateLineasByAreas(selectedAreas: any[]) {
    this.lineas = []; // Limpia las líneas actuales

    if (selectedAreas.length > 0) {
      selectedAreas.forEach((idArea) => {
        this.lineService.getLineByArea(idArea).subscribe((lineasArea: any[]) => {
          this.lineas = [
            ...this.lineas,
            ...lineasArea.filter(
              (linea) => !this.lineas.some((l) => l.idLinea === linea.idLinea)
            ),
          ];
        });
      });
    }

  }


  cargarFormularios() {
    this.loadDominios();
    this.loadAreas();
    this.dominiosControl.patchValue(this.dominios);
    this.areasControl.patchValue(this.areas);
    this.lineasControl.patchValue(this.lineas);
    const token = sessionStorage.getItem('acces_token');
    this.myForm = this.builder.group({
      grupoInv1: this.builder.group({
        idUser: sessionStorage.getItem('idUser'),
        nombreGrupoInv: ['', Validators.required],
        acronimoGrupoinv: ['', Validators.required],
        //coordinador:['', Validators.required]
      }),
      grupoInv2: this.builder.group({
        dominios: this.dominiosControl,
        areas: this.areasControl,
        lineas: this.lineasControl,
      }),
     
      grupoInv3: this.builder.group({
        cvsCoordinador: new FormControl(''),
        meritosCoordinador: new FormControl(''),
        certificadosCoordinador: new FormControl(''),
        investigadores: new FormArray([
          this.crearFormGroupInvestigador(),
        ]),
        investigadoresExterns: new FormArray([
          this.crearFormGroupInvestigadorExtern(),
        ]),

      }),
      grupoInv4: this.builder.group({

      })
    });
  }


  get grupoInv1() {
    return this.myForm.get('grupoInv1') as FormGroup;
  }
  get grupoInv2() {
    return this.myForm.get('grupoInv2') as FormGroup;
  }

  get grupoInv3() {
    return this.myForm.get('grupoInv3') as FormGroup;
  }
  get grupoInv4() {
    return this.myForm.get('grupoInv4') as FormGroup;
  }
  private crearFormGroupInvestigador() {
    return new FormGroup({
      idUsuario: new FormControl(''),
      cvsInvestigador: new FormControl(''),
      meritosInvestigador: new FormControl(''),
      certificadosInvestigador: new FormControl(''),
    });
  }

  private crearFormGroupInvestigadorExtern() {
    return new FormGroup({
      idUsuario: new FormControl(''),
      cvsInvestigador: new FormControl(''),
      meritosInvestigador: new FormControl(''),
      certificadosInvestigador: new FormControl(''),
    });
  }


  loadDominios(): void {
    this.academicDomainService.getAll().subscribe(data => {
      this.dominios = data.filter(dominio => dominio.estado === true);
    });
  }

  loadAreas(): void {
    this.areaService.getAll().subscribe(data => {
      this.areas = data.filter(area => area.estado === true);
    });
    this.loadingData=false;
  }
  miembrosInternos: any[] = []; // Lista para almacenar solo los miembros

totalMiembrosInternos: number = 0; // Contador de miembros agregados
 openDialog(): void {
     const dialogRef = this.dialog.open(MembersGroup, {
       width: '60%',
       height: '90%',
       data: { usuarios: this.usuarios }
     });
     dialogRef.componentInstance.usuarioExternoCreado.subscribe((usuarioCreado: Usuario) => {
       const dialogRefRol = this.dialog.open(SeleccionRolDialogComponent, {
         width: '30%',
       });
 
       dialogRefRol.afterClosed().subscribe((rolSeleccionado: string) => {
 
         dialogRef.close();
         if (rolSeleccionado) {
           usuarioCreado.rol = rolSeleccionado; // Agregar el rol seleccionado al usuario
           this.selectedUsersExterns.push(usuarioCreado);
           console.log(this.usuarios);
 
           this.snackBar.open(
             `Investigador agregado exitosamente como ${rolSeleccionado}`,
             'Cerrar',
             {
               duration: 3000,
               horizontalPosition: 'right',
               verticalPosition: 'top',
             }
           );
         }
       });
     });
 
 
     dialogRef.afterClosed().subscribe((data: { user: any, usuarioValue: any }) => {
       let numeroDeGruposVinculados = 0;
       /*this.apiInvMemberService.getByUsername(data.usuarioValue).subscribe((response) => {
         numeroDeGruposVinculados = response.length;
       })*/
       if (data?.usuarioValue) {
         if (numeroDeGruposVinculados >= 2) {
           this.snackBar.open('No puedes agregar a este miembro, ya pertenece a dos grupos de investigación de la Universidad.', 'Cerrar', { duration: 3000 });
           return;
         }
         const idUsuarioSeleccionado = data.usuarioValue;
         if (idUsuarioSeleccionado === this.currentUser) {
           this.snackBar.open('No puedes agregarte a ti mismo', 'Cerrar', { duration: 3000 });
           return;
         }
 
         const usuarioYaExiste = this.selectedUsers.some(user => user.userId === idUsuarioSeleccionado);
         if (usuarioYaExiste) {
           this.snackBar.open('El usuario ya ha sido agregado', 'Cerrar', { duration: 3000 });
           return;
         }
 
         if (data.user.tipo === 'SERVIDOR PUBLICO' || data.user.tipo === 'ESTUDIANTE') {
           this.snackBar.open(`El usuario seleccionado es ${data.user.tipo}. Se agregará como Colaborador del GI`, 'Cerrar', { duration: 3000 });
           this.selectedUsers.push({
             user: data.user,
             userId: idUsuarioSeleccionado,
             rol: 'COLABORADOR'  // Almacenar el rol junto con el usuario
           });
           return;
         }
 
         // **Abrir diálogo para seleccionar el rol antes de agregar el usuario**
         const dialogRolRef = this.dialog.open(SeleccionRolDialogComponent, {
           width: '300px',
           data: { user: data.user }
         });
 
         dialogRolRef.afterClosed().subscribe(rolSeleccionado => {
           if (rolSeleccionado) {
             const nuevoUsuario = {
               user: data.user,
               userId: idUsuarioSeleccionado,
               rol: rolSeleccionado
             };
 
             this.selectedUsers.push(nuevoUsuario);
             this.snackBar.open(`Usuario agregado como ${rolSeleccionado}`, 'Cerrar', { duration: 3000 });
 
             if (rolSeleccionado === 'MIEMBRO') {
               this.totalMiembrosInternos++;
               this.miembrosInternos.push(nuevoUsuario); // Guardamos solo los miembros
             }
           }
 
         });
       }
 
     });
   }
   selectedMember: any | null = null; // Miembro seleccionado

   cambiarRol(): void {
    if (this.selectedMember) {
      // Actualizar el rol en la lista de selectedUsers
      const index = this.selectedUsers.findIndex(user => user.userId === this.selectedMember.userId);
      if (index !== -1) {
        this.selectedUsers[index].rol = 'SECRETARIO'; // Cambiar el rol a "Miembro-Secretario"
      }
    }
  }

  openDialogCoord(): void {
    const dialogRef = this.dialog.open(SelectCoordinadorGroup, {
      width: '60%',
      height: '90%',
      data: { usuarios: this.usuarios }
    });
  
    dialogRef.afterClosed().subscribe((data: { user?: any; usuarioValue?: any } | null) => {
      if (data) {
        if (data.usuarioValue) {
          this.userIdSelectCoord = data.usuarioValue;
        }
        if (data.user) {
          this.selectedUserCoord =  data.user,data.usuarioValue;
        }
      }
    });
  }
  


  borrarInvestigador(index: number) {
    console.log(this.selectedUsers)
    if (this.selectedUsers[index].rol === 'MIEMBRO') {
      this.totalMiembrosInternos--;
    }
    this.investigadores.splice(index, 1);
    this.userIdSelect.splice(index, 1);
    this.selectedUsers.splice(index, 1);
  }
  borrarInvestigadorExtern(index: number) {
    this.selectedUsersExterns.splice(index, 1);
    this.investigadoresExterns.splice(index, 1);
    this.userIdSelect.splice(index, 1);
  }
  
  selectedFile: File | undefined;

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


  groupId:number;
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
    
  }
  isImageFile: boolean = false;
  imageNameOriginal: string = '';
  selectedImg: File | undefined;
  selectedImage: File | undefined;
  filePreview: string | null = null;
  
  processImageFile(file: File) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF, SVG).');
      this.clearImageInput();
      return;
    }

    this.isImageFile = true;
    this.selectedImg = file;
    this.imageNameOriginal = file.name;

    const customFileName = `imagen_GI_${this.currentUserId}.png`;
    const renamedFile = new File([file], customFileName, { type: file.type });
    this.selectedImg = renamedFile;

    this.previewImage(file);
  }
  previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.filePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
  clearImageInput() {
    this.selectedImg = undefined;
    this.imageNameOriginal = '';
    this.filePreview = null;
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  validateFileType() {
    if (this.selectedFile) {
      const fileExtension = this.selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'png') {
        alert('Solo se permiten archivos PNG.');
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

  setImageName(name: string) {
    if (!this.selectedImg) {
      return;
    }
    this.imageNameOriginal = this.selectedImg.name;
    const modifiedFile = new File([this.selectedImg], name, { type: this.selectedImg.type });
    this.selectedImg = modifiedFile;
  }

  //Envio del Formulario
  HandleSubmit() {
    this.cambiarRol();
    if (this.myForm.valid) {
      this.loadingData = true;
      const partes = this.selectedUserCoord.ubicacion.split(" - ");
      const departamento = partes[1].trim();
      const sede=partes[0].trim();
      const grupoInvData: InvGroupForm = {
        idGrupoInv: null,
        idCoordinador: this.selectedUserCoord.idBd,
        nombreGrupoInv: this.myForm.value.grupoInv1.nombreGrupoInv,
        estadoGrupoInv: "activo",
        acronimoGrupoinv: this.myForm.value.grupoInv1.acronimoGrupoinv,
        departamento: departamento,
        proceso:"0",
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null,
        sede:sede,
      }
      console.log("datos antes de enviar", grupoInvData)
      this.invGroupService.createInvGroupForm(grupoInvData).subscribe(
        (response) => {
          this.idGrupo=response;
            this.saveAcademicDomain(response);
              this.saveArea(response);
              this.saveLine(response);
              this.saveMember(response);
              this.saveImage(response);
        });

  }}
  fileUploaded: boolean = false; 

  saveImage(id: number) {
    if (this.selectedImg) {
      //this.loading = true;
      const fileToUpload = this.selectedImg;
      const sistema = 'GruposInv'
      this.documentService.saveDocument(this.token, fileToUpload, sistema).subscribe(response => {
      const annexesData: Annexes = {
        idAnexo: 0, 
        idDocumento:1,
        usuarioCreacionAnexo: this.currentUser, 
        fechaCreacionAnexo: this.currentDate, 
        usuarioModificacionAnexo: '', 
        fechaModificacionAnexo: null, 
        idGrupo: id,
        nombreAnexo: response.fileName,
        rutaAnexo: response.uuid
      };

      this.annexesService.createAnnexesForm(annexesData).subscribe(
        (response) => {
          this.fileUploaded = true; // Establecer la bandera a verdadero cuando el archivo se haya cargado correctamente
          setTimeout(() => {
            this.matSnackBar.open('Grupo Creado correctamente.', 'Cerrar', {
                duration: 3000,
              });
            this.router.navigateByUrl('main/grupos-investigacion');
          }, 1000);
        })
      }), 
        (error) => {
          console.error('Error al subir el archivo:', error);
        }
      }


  }

  //Guardamos los dominios academicos,lineas y areas relacionadas al la solicitud de creacion y al grupo de Investigacion
  private saveAcademicDomain(id: number) {
    const dominiosSeleccionados = this.dominiosControl.value;
    if (dominiosSeleccionados && dominiosSeleccionados.length > 0) {
      dominiosSeleccionados.forEach((dominioId: number) => {
        const acadCreaForm: InvGroup_academicDomain = {
          idGrupo: id,
          idDomAcad: dominioId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.invGroup_academicDomainService.createAcadCreaForm(acadCreaForm).subscribe(
          (response) => {
          }
        );
      });
    } else {
    }
  }

  private saveLine(id: number) {
    const lineasSeleccionadas = this.lineasControl.value;
    if (lineasSeleccionadas && lineasSeleccionadas.length > 0) {
      lineasSeleccionadas.forEach((lineasId: number) => {
        const lineCreaForm: InvGroup_line = {
          idGrupo: id,
          idLinea: lineasId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.invGroup_linesService.createInvGroup_lineForm(lineCreaForm).subscribe(
          (response) => {
          }
        )
      });
    } else {
    }
  }

  private saveArea(id: number) {
    const areasSeleccionadas = this.areasControl.value;
    if (areasSeleccionadas && areasSeleccionadas.length > 0) {
      areasSeleccionadas.forEach((areasId: number) => {
        const areaForm: InvGroup_area = {
          idGrupo: id,
          idArea: areasId,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.invGroup_areaService.createAreaCreaForm(areaForm).subscribe(
          (response) => {
          }
        )
      });
    } else {
    }
  }

  //Guarda información de los miembros del grupo y se les asiga al rol de miembro
  private saveMember(idGrupo: number) {
    if (this.selectedUsers && this.selectedUsers.length > 0) {
      this.selectedUsers.forEach((user: any) => {
        const member: InvMemberForm = {
          idGrupoInv: idGrupo,
          idUsuario: user.user.idBd,
          fechaVinculacion: null,
          tipo: user.rol,
          status: "INTERNO",
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.apiInvMemberService.createInvMemberFormForm(member).subscribe(
          (response) => {
            console.log(response);
          }, (error) => {
          }
        )
        const userRol: UserRoles = {
          idUsuario: user.user.idBd,
          idRoles: 8,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.userRolService.createUserRol(userRol).subscribe((response) => {

        },
          (error) => {
            console.error('El usuario ya tiene el rol:', error);
          }
        )

      })
    } else {
      console.log('error no se guardo nada')
    }


    if (this.selectedUsersExterns && this.selectedUsersExterns.length > 0) {
      this.selectedUsersExterns.forEach((user: { id: number, rol: string }) => {
        const member: InvMemberForm = {
          idGrupoInv: idGrupo,
          idUsuario: user.id,
          fechaVinculacion: null,
          tipo: user.rol,
          status: "EXTERNO",
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.apiInvMemberService.createInvMemberFormForm(member).subscribe(
          (response) => {
            console.log(response);
          }, (error) => {
            console.log(error);
          }
        )
        const userRol: UserRoles = {
          idUsuario: user.id,
          idRoles: 8,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.userRolService.createUserRol(userRol).subscribe((response) => {
        },
          (error) => {
            console.error('El usuario ya tiene el rol:', error);
          }
        )

      })
    }
    
  }
  onImgSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
  }
  fileIcon: string = 'far fa-file'; // Ícono predeterminado

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
}