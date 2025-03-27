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
@Component({
  selector: 'vex-creation-form',
  templateUrl: './crearGI.component.html',
  styleUrls: ['../../coordinadorGI/sol-creacion/sol-creacion.component.scss'],
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
    private solCreaGIFormService: SolCreaGiService,
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
    this.cargarFormularios();
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

  openDialog(): void {
    const dialogRef = this.dialog.open(MembersGroup, {
      width: '60%',
      height: '90%',
      data: { usuarios: this.usuarios }
    });

    dialogRef.componentInstance.usuarioExternoCreado.subscribe((usuarioCreado: Usuario) => {
      console.log('Usuario creado recibido en openDialog:', usuarioCreado);
      this.selectedUsersExterns.push(usuarioCreado); // Agregar el usuario a la lista de usuarios en el componente padre
      this.snackBar.open('Investigador agregado exitosamente', 'Cerrar', {
        duration: 3000,          // Duración en milisegundos
        horizontalPosition: 'right',
        verticalPosition: 'top', // Posición del toast
      });
    });

    dialogRef.afterClosed().subscribe((data: { user: any, usuarioValue: any }) => {
      if (data?.usuarioValue) {
        this.userIdSelect.push(data.usuarioValue);
      }
      if (data?.user) {
        this.selectedUsers.push({ user: data.user, userId: data.usuarioValue });
      }
    });
  }

  openDialogCoord(): void {
    const dialogRef = this.dialog.open(MembersGroup, {
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
      console.log("1",this.selectedUserCoord);
      }
    });
  }
  


  borrarInvestigador(index: number) {
    this.selectedUsers.splice(index, 1);
    this.investigadores.splice(index, 1);
    this.userIdSelect.splice(index, 1);
    console.log(this.userIdSelect);
  }
  borrarInvestigadorExtern(index: number) {
    this.selectedUsersExterns.splice(index, 1);
    this.investigadoresExterns.splice(index, 1);
    this.userIdSelect.splice(index, 1);
    console.log(this.userIdSelect);

  }
  agregarInvestigador() {
    (this.myForm.get('grupoInv3').get('investigadores') as FormArray).push(
      this.crearFormGroupInvestigador()
    );
    this.investigadores.push(this.investigadores.length + 1);
  }
  agregarInvestigadorExtern() {
    (this.myForm.get('grupoInv3').get('investigadoresExterns') as FormArray).push(
      this.crearFormGroupInvestigadorExtern()
    );
    this.investigadoresExterns.push(this.investigadoresExterns.length + 1);
  }

  eliminarInvestigadorExtern() {
    const index = this.investigadoresExterns.length - 1; // Obtener el índice del último investigador
    (this.myForm.get('grupoInv3').get('investigadoresExterns') as FormArray).removeAt(index); // Eliminar el investigador en el índice
    this.investigadoresExterns.pop(); // Eliminar el último índice
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
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      const file = files[0];
  
      // Verificar si el archivo es una imagen válida
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (allowedTypes.includes(file.type)) {
        // Crear nombre personalizado para el archivo
        const year = this.currentDate.getFullYear();
        const month = ('0' + (this.currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + this.currentDate.getDate()).slice(-2);
        const customFileName = `imagen_GI_${year}-${month}-${day}`;
  
        // Renombrar archivo
        const archivoRenombrado = new File([file], customFileName, { type: file.type });
        this.selectedFile = archivoRenombrado;
  
        console.log('Archivo seleccionado y renombrado:', archivoRenombrado);
      } else {
        alert('Por favor, seleccione un archivo de imagen válido (PNG, JPEG, JPG, GIF).');
        input.value = ''; // Limpiar el input en caso de error
      }
    } else {
      alert('No se seleccionó ningún archivo.');
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

  
  //Envio del Formulario
  HandleSubmit() {
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
        proceso:"12",
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null,
        sede:sede,
      }
      console.log("datos antes de enviar", grupoInvData)
      this.solCreaGIFormService.createInvGroup(grupoInvData).subscribe(
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
    if (this.selectedFile) {
      //this.loading = true;
      const fileToUpload = this.selectedFile;
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
            this.matSnackBar.open('Solicitudes Enviados correctamente.', 'Cerrar', {
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
    console.log(this.selectedUsersExterns);

    if (this.userIdSelect && this.userIdSelect.length > 0) {
      this.userIdSelect.forEach((user: string) => {
        this.usuarioService.getByUserName(user).subscribe((data) => {
          const member: InvMemberForm = {
            idGrupoInv: idGrupo,
            idUsuario: data.id,
            fechaVinculacion: null, tipo: 'Externo',
            usuarioCreacion: this.currentUser,
            fechaCreacion: this.currentDate,
            usuarioModificacion: null,
            fechaModificacion: null
          }
          this.apiInvMemberService.createInvMemberFormForm(member).subscribe(
            (response) => {
            }, (error) => {
              console.log(error);
            }
          )
          const userRol: UserRoles = {
            idUsuario: data.id,
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
      })
    }


    if (this.selectedUsersExterns && this.selectedUsersExterns.length > 0) {
      this.selectedUsersExterns.forEach((user: { id: number }) => {
        const member: InvMemberForm = {
          idGrupoInv: idGrupo,
          idUsuario: user.id,
          fechaVinculacion: null, 
          tipo: 'Externo',
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

  revisadoPor(user: string): void {
    this.usuarioService.getByUserName(user).subscribe(data => {
      this.revisado = data
    })
  }


}