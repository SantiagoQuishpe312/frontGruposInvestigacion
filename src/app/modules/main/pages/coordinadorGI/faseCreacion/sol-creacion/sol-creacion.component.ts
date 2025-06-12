import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { AcademicDomainService } from 'src/app/core/http/academic-domain/academic-domain.service';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { AreaService } from 'src/app/core/http/area/area.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { InvGroup_academicDomainService } from 'src/app/core/http/invGroup_academicDomain/invGroup_academicDomain.service';
import { InvGroup_areaService } from 'src/app/core/http/invGroup_area/crea-area.service';
import { InvGroup_linesService } from 'src/app/core/http/InvGroup_line/invGroup_linesService.service';
import { LineService } from 'src/app/core/http/line/line.service';
import { SolCreaGiService } from 'src/app/core/http/sol-crea-gi/sol-crea-gi.service';
import { UserRolService } from 'src/app/core/http/userRol/userRol.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { Usuario } from 'src/app/types/usuario.types';
import { MembersGroup } from '../../../creation-form/creation-form/membersGroup.component';
import { SeleccionRolDialogComponent } from '../../../creation-form/SeleccionRolDialogComponent';
import { Annexes } from 'src/app/types/annexes.types';
import { UserRoles } from 'src/app/types/userRol.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { InvGroup_area } from 'src/app/types/invGroup_area.types';
import { InvGroup_line } from 'src/app/types/invGroup_line';
import { InvGroup_academicDomain } from 'src/app/types/invGroup_academicDomain';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'vex-sol-creacion',
  templateUrl: './sol-creacion.component.html',
  styleUrls: ['./sol-creacion.component.scss']
})
export class SolCreacionComponent implements OnInit {
  selectedUsers: any[] = [];
  documentosCargados = {};
  selectedUsersExterns: any[] = [];
  selectedFiles: File[] = [];
  userIdSelect: any[] = [];
  dominiosControl = new FormControl();
  areasControl = new FormControl();
  lineasControl = new FormControl();
  isLinear = true;
  //myForm: FormGroup;
  myForm: FormGroup = new FormGroup({});
  reqFormResponse: any;
  usuarios: any[] = [];
  dominios: any[];
  areas: any[];
  lineas: any[];
  investigadores: number[] = [1];
  investigadoresExterns: number[] = [1];
  invGroupExists: boolean = false;
  checkList: any;
  revisado: any;
  check: boolean = false;
  grupo: InvGroupForm;
  loadingData: boolean = true;
  currentUser: string;
  currentDate: any;
  currentUserId: number;
  isSaved: boolean = false;
  idGrupo: number;
  pdfUrl: SafeResourceUrl | undefined;
  CvNameOriginal: string;
  userCoordinador: Usuario;
  token: string;
  selectedFileByUser: { [index: number]: File } = {};
  selectedFileByUserExtern: { [index: number]: File } = {};
  documentosCompletosCargados = false;
  selectedImage: File | undefined;
  selectedCv: File | undefined;
  selectedImg: File | undefined;
  filePreview: string | null = null;
  fileIcon: string = 'far fa-file'; 
  isImageFile: boolean = false;
  imageNameOriginal: string = '';
  savedMessage: string;
  cvsSavedInDatabase: { [userId: number]: boolean } = {};
  existingCvsInfo: { [userId: number]: any } = {};
  imageAlreadySaved: boolean = false;



  constructor(
    private builder: FormBuilder,
    private snackBar: MatSnackBar,
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
    private annexesServices: AnnexesService,
    private documentService: DocumentsService,
    private creationReqService: CreationReqService,
  ) {
    this.usuarios = [];
  }
  ngOnInit(): void {
    //this.loadExistingMembers(this.idGrupo);
    this.currentUser = this.authService.getUserName();
    this.currentDate = new Date();
    this.currentUserId = Number(sessionStorage.getItem("userId"));
    this.idGrupo = Number(sessionStorage.getItem("invGroup"));
    this.checkInvGroupInSessionStorage();
    this.areasControl.valueChanges.subscribe((selectedAreas: any[]) => {
      this.updateLineasByAreas(selectedAreas);
    });
    this.dominiosControl.valueChanges.subscribe((selectedDominios: any[]) => {
      this.updateAreasByDominios(selectedDominios);
    })
    if (this.idGrupo) {
    this.loadExistingDocuments(this.idGrupo);
    
  }


  }

  updateAreasByDominios(selectedDominios: any[]) {
    this.areas = []; // Limpia las areas actuales
    if (selectedDominios && selectedDominios.length > 0) {
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
  //Verificamos si existe un grupo de investigación o se ha empezado algun proceso respecto a la creacion del mismo
  checkInvGroupInSessionStorage() {
    const invGroup = Number(sessionStorage.getItem('invGroup'));
    if (invGroup && !isNaN(invGroup)) {
      this.invGroupExists = true;
      this.idGrupo = invGroup; 
      this.loadGroup(invGroup);
      this.loadExistingMembers(invGroup);
    } else {
      this.invGroupExists = false;
      this.idGrupo = null; 
      this.grupo = {} as InvGroupForm;
      this.cargarFormularios(this.grupo);
    }
    this.loadCoordinador();
  }
  loadGroup(id: number) {
    this.apiInvGroupService.getById(id).subscribe((data) => {
      this.grupo = data;
      
      this.loadingData = false;
      this.cargarFormularios(data);
      

    },)

  }
  loadCoordinador() {
    this.usuarioService.getByUserName(this.currentUser).subscribe((data: Usuario) => {
      this.userCoordinador = data;
      this.loadingData = false;
    }, error => {
    });
  }

  cargarFormularios(invGroup: InvGroupForm) {
    this.loadDominios();
    this.loadAreas();
    //nuevo//
     if (invGroup && invGroup.idGrupoInv) {
      this.loadSegmentationData(invGroup);
    } else {
      // Si es nuevo, inicializar vacío
      this.dominiosControl.patchValue([]);
      this.areasControl.patchValue([]);
      this.lineasControl.patchValue([]);
    }
    //////
    this.dominiosControl.patchValue(this.dominios);
    this.areasControl.patchValue(this.areas);
    this.lineasControl.patchValue(this.lineas);
    this.myForm = this.builder.group({
      grupoInv1: this.builder.group({
        idUser: sessionStorage.getItem('idUser'),
        nombreGrupoInv: [invGroup.nombreGrupoInv||  '', Validators.required],
        acronimoGrupoinv: [invGroup.acronimoGrupoinv||  '', Validators.required],
      }),
      grupoInv2: this.builder.group({
        dominios: this.dominiosControl,
        areas: this.areasControl,
        lineas: this.lineasControl,
      }),
      /*grupoInv2_1: this.builder.group({
        alineacionEstrategica: ['', Validators.required]
      }),*/
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
        resumenGrupo: new FormControl(''),
        planDesarrolloGrupo: new FormControl(''),
      }),
      grupoInv4: this.builder.group({

      }),
      grupoInv5: this.builder.group({

      })
    });
    this.myForm.get('grupoInv1.nombreGrupoInv')?.valueChanges.subscribe(valor => {
      if (valor) {
        this.myForm.get('grupoInv1.nombreGrupoInv')?.setValue(valor.toUpperCase(), { emitEvent: false });
      }
    });
    this.myForm.get('grupoInv1.acronimoGrupoinv')?.valueChanges.subscribe(valor => {
      if (valor) {
        this.myForm.get('grupoInv1.acronimoGrupoinv')?.setValue(valor.toUpperCase(), { emitEvent: false });
      }
    });
  }
  get grupoInvform() {
    return this.myForm.get('grupoInv1') as FormGroup;
  }
  get grupoInv2() {
    return this.myForm.get('grupoInv2') as FormGroup;
  }
  get grupoInv2_1() {
    return this.myForm.get('grupoInv2_1') as FormGroup;
  }
  get grupoInv3() {
    return this.myForm.get('grupoInv3') as FormGroup;
  }
  get grupoInv4() {
    return this.myForm.get('grupoInv4') as FormGroup;
  }
  get grupoInv5() {
    return this.myForm.get('grupoInv5') as FormGroup;
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
  totalMiembrosInternos: number = 0; // Contador de miembros agregados
  totalMiembrosExternos: number = 0;

  loadAreas(): void {
    this.areaService.getAll().subscribe(data => {
      this.areas = data.filter(area => area.estado === true);
    });
  }

  miembrosInternos: any[] = []; // Lista para almacenar solo los miembros
  selectedMember: any | null = null; // Miembro seleccionado

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
        this.verificarDocumentosCargados();

        dialogRef.close();
        if (rolSeleccionado) {
          usuarioCreado.rol = rolSeleccionado; // Agregar el rol seleccionado al usuario
          this.selectedUsersExterns.push(usuarioCreado);
        if (this.idGrupo) {
          this.saveSingleExternalMember(usuarioCreado, rolSeleccionado);
        }

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
        this.verificarDocumentosCargados();
        const idUsuarioSeleccionado = data.usuarioValue;
        if (idUsuarioSeleccionado === this.currentUser) {
          this.snackBar.open('No puedes agregarte a ti mismo', 'Cerrar', { duration: 3000 });
          this.verificarDocumentosCargados();
          return;
        }

        const usuarioYaExiste = this.selectedUsers.some(user => user.userId === idUsuarioSeleccionado);
        if (usuarioYaExiste) {
          this.snackBar.open('El usuario ya ha sido agregado', 'Cerrar', { duration: 3000 });
          this.verificarDocumentosCargados();
          return;
        }

        // if (data.user.tipo === 'SERVIDOR PUBLICO' || data.user.tipo === 'ESTUDIANTE') {
        //   this.snackBar.open(`El usuario seleccionado es ${data.user.tipo}. Se agregará como Colaborador del GI`, 'Cerrar', { duration: 3000 });
        //   this.selectedUsers.push({
        //     user: data.user,
        //     userId: idUsuarioSeleccionado,
        //     rol: 'COLABORADOR'  // Almacenar el rol junto con el usuario
        //   });

        //NUEVO
        if (data.user.tipo === 'SERVIDOR PUBLICO' || data.user.tipo === 'ESTUDIANTE') {
          const nuevoUsuario = {
            user: data.user,
            userId: idUsuarioSeleccionado,
            rol: 'COLABORADOR'
          };
          this.selectedUsers.push(nuevoUsuario);
          this.saveSingleInternalMember(nuevoUsuario);
          ///FIN
          this.verificarDocumentosCargados();
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
            //NUEVO
            if (this.idGrupo) {
              this.saveSingleInternalMember(nuevoUsuario);
            }
            //
            this.snackBar.open(`Usuario agregado como ${rolSeleccionado}`, 'Cerrar', { duration: 3000 });
            if (rolSeleccionado === 'MIEMBRO') {
              this.totalMiembrosInternos++;
              this.miembrosInternos.push(nuevoUsuario); // Guardamos solo los miembros
            }
            this.verificarDocumentosCargados();
          }

        });
      }

    });
  }

  cambiarRol(): void {
    if (this.selectedMember && this.idGrupo) {
      const index = this.selectedUsers.findIndex(user => user.userId === this.selectedMember.userId);
      if (index !== -1) {
        this.selectedUsers[index].rol = 'SECRETARIO'; // Cambiar el rol a "Miembro-Secretario"

         // Actualizar en la base de datos
         const memberData: InvMemberForm = {
          idGrupoInv: this.idGrupo,
          idUsuario: this.selectedMember.user.idBd || this.selectedMember.user.id,
          fechaVinculacion: null,
          tipo: 'SECRETARIO',
          status: "INTERNO",
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: this.currentUser,
          fechaModificacion: new Date()
        };

        this.apiInvMemberService.update(
          this.selectedMember.user.idBd || this.selectedMember.user.id,
          this.idGrupo,
          memberData
        ).subscribe(
          (response) => {

            const miembroIndex = this.miembrosInternos.findIndex(m =>
              m.userId === this.selectedMember.userId
            );
            if (miembroIndex !== -1) {
              this.miembrosInternos[miembroIndex].rol = 'SECRETARIO';
            }
          },
          (error) => {
            console.error('Error al actualizar rol de secretario:', error);
            this.snackBar.open('Error al asignar secretario', 'Cerrar', { duration: 3000 });
          }
        );
      }
    }
  }


  borrarInvestigador(index: number, idBD: number) {
    if (this.selectedUsers[index].rol === 'MIEMBRO') {
      this.totalMiembrosInternos--;
    }
    this.investigadores.splice(index, 1);
    this.userIdSelect.splice(index, 1);
    delete this.selectedFileByUser[index];
    const id=this.selectedUsers[index].user.id

    this.selectedUsers.splice(index, 1);
    this.apiInvMemberService.deleteUserGroup(id,Number(sessionStorage.getItem("invGroup"))).subscribe((response=>{
      //console.log(response);
    }));

  }
  borrarInvestigadorExtern(index: number, idBD: number) {
    const id = this.selectedUsersExterns[index]?.id || this.selectedUsersExterns[index]?.idBd;
    
    this.apiInvMemberService.deleteUserGroup(id, Number(sessionStorage.getItem("invGroup")))
      .subscribe({
        next: (response) => {
          
          this.selectedUsersExterns.splice(index, 1);
          
          if (this.investigadoresExterns && this.investigadoresExterns.length > index) {
            this.investigadoresExterns.splice(index, 1);
          }
          
          if (this.userIdSelect && this.userIdSelect.length > index) {
            this.userIdSelect.splice(index, 1);
          }
          
          if (this.selectedFileByUserExtern && this.selectedFileByUserExtern[index]) {
            delete this.selectedFileByUserExtern[index];
          }
          
          if (this.documentosCargados && this.documentosCargados[id]) {
            delete this.documentosCargados[id];
          }
        },
        error: (err) => {
          console.error('Error al eliminar del backend:', err);
        }
      });
  }
  contadorDocumentos = 0;
  onFileSelected(event: Event, index: number, userId: number) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (input?.files?.length) {
      this.contadorDocumentos++;
      this.documentosCargados[userId] = true;
      this.verificarDocumentosCargados();
    } else {
      this.documentosCargados[userId] = false;
    }

    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        const nombreUsuario = userId;
        const nuevoNombre = `hojaDeVida_${nombreUsuario}.${file.name.split('.').pop()}`;
        const archivoRenombrado = new File([file], nuevoNombre, { type: file.type });
        this.selectedFileByUser[index] = archivoRenombrado;
// Guardar automáticamente si el grupo existe
if (this.idGrupo) {
  this.saveSingleCV(archivoRenombrado, userId, 'INTERNO');
}

this.contadorDocumentos++;
this.documentosCargados[userId] = true;
this.verificarDocumentosCargados();
      } else {
        alert('Por favor, seleccione un archivo PDF.');
        input.value = '';
      }
    }
  }

 // 3. Mejorar el método verificarDocumentosCargados
verificarDocumentosCargados(): void {
  // Verificar usuarios internos
  const usuariosInternosCompletos = this.selectedUsers.length === 0 || 
    this.selectedUsers.every(user => {
      const userId = user.user.idBd || user.user.id;
      const isLoaded = this.documentosCargados[userId] === true;
      
      
      return isLoaded;
    });

  // Verificar usuarios externos
  const usuariosExternosCompletos = this.selectedUsersExterns.length === 0 || 
    this.selectedUsersExterns.every(user => {
      const isLoaded = this.documentosCargados[user.id] === true;
      return isLoaded;
    });

  this.documentosCompletosCargados = usuariosInternosCompletos && usuariosExternosCompletos;
}
  onFileSelectedExtern(event: Event, index: number, userId: number) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (input?.files?.length) {
      this.contadorDocumentos++;

      this.documentosCargados[userId] = true;
      this.verificarDocumentosCargados();
    } else {
      this.documentosCargados[userId] = false;
    }

    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        const nombreUsuario = userId;
        const nuevoNombre = `hojaDeVida_${nombreUsuario}.${file.name.split('.').pop()}`;
        const archivoRenombrado = new File([file], nuevoNombre, { type: file.type });
        this.selectedFileByUserExtern[index] = archivoRenombrado;
 if (this.idGrupo) {
  this.saveSingleCV(archivoRenombrado, userId, 'EXTERNO');
}

this.contadorDocumentos++;
this.documentosCargados[userId] = true;
this.verificarDocumentosCargados();
      } else {
        alert('Por favor, seleccione un archivo PDF.');
        input.value = '';
      }
    }
  }

  //Envio del Formulario
  HandleSubmit() {
    //this.cambiarRol();
    this.loadingData = true;
//NUEVO
if (this.myForm.valid) {
  // Si ya existe un grupo, usar ese ID, de lo contrario crear uno nuevo
  if (this.idGrupo) {
    // Actualizar el grupo existente con proceso "1" (completo)
    const grupoInvData: InvGroupForm = {
      idGrupoInv: this.idGrupo,
      idCoordinador: this.currentUserId,
      nombreGrupoInv: this.myForm.value.grupoInv1.nombreGrupoInv,
      estadoGrupoInv: "pendiente",
      acronimoGrupoinv: this.myForm.value.grupoInv1.acronimoGrupoinv,
      departamento: this.userCoordinador.departamento,
      proceso: "1", // Cambiar a proceso completo
      sede: this.userCoordinador.sede,
      usuarioCreacion: this.currentUser,
      fechaCreacion: this.currentDate,
      usuarioModificacion: this.currentUser,
      fechaModificacion: this.currentDate
    };

    this.apiInvGroupService.update(this.idGrupo, grupoInvData).subscribe(
      (response) => {
        // Continuar con el guardado de los demás datos usando el ID existente
        this.saveCurriculums(this.idGrupo, this.currentUser, this.currentDate);
        this.saveAcademicDomain(this.idGrupo);
        this.saveArea(this.idGrupo);
        this.saveLine(this.idGrupo);
        this.saveMember(this.idGrupo);
        //this.router.navigateByUrl('main/principal');

        this.loadingData = false;
        this.snackBar.open('Grupo creado con éxito', 'Cerrar', { duration: 3000 });


         // Esperar 2 segundos antes de redirigir
         setTimeout(() => {
          this.router.navigateByUrl('main/principal');
        }, 3000);

        // Actualizar la petición de creación si existe
        //this.updateCreationRequest(this.idGrupo);

      },
      (error) => {
        this.savedMessage = 'Error al actualizar el formulario';
        this.loadingData = false;
        console.error('Error al actualizar grupo:', error);
      }
    );
  } else {
//FIN NUEVO
    //if (this.myForm.valid) {
      //const partes = this.userCoordinador.departamento.split(" - ");
      //const departamento = partes[1].trim();
      //const sede = partes[0].trim();
      const grupoInvData: InvGroupForm = {
        idGrupoInv: null,
        idCoordinador: this.currentUserId,
        nombreGrupoInv: this.myForm.value.grupoInv1.nombreGrupoInv,
        estadoGrupoInv: "pendiente",
        acronimoGrupoinv: this.myForm.value.grupoInv1.acronimoGrupoinv,
        departamento: this.userCoordinador.departamento,
        proceso: "1",
        sede: this.userCoordinador.sede,
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null
      }
      this.apiInvGroupService.createInvGroupForm(grupoInvData).subscribe(
        (response) => {
          this.reqFormResponse = response;
          const idGrupoCreado = this.reqFormResponse;
          this.saveCurriculums(idGrupoCreado, this.currentUser, this.currentDate);
          this.saveAcademicDomain(idGrupoCreado);
          this.saveArea(idGrupoCreado);
          this.saveLine(idGrupoCreado);
          this.saveMember(idGrupoCreado);
          sessionStorage.setItem('invGroup', idGrupoCreado.toString());

          const reqFormData: CreationReqForm = {
            idPeticionCreacion: null,
            idGrupoInv: idGrupoCreado,
            alineacionEstrategica: null,
            estado: "p",
            usuarioCreacionPeticion: this.currentUser,
            fechaCreacionPeticion: this.currentDate,
            usuarioModificacionPeticion: null,
            fechaModificacionPeticion: null,
          };
          this.creationReqService.createCreationRequestForm(reqFormData).subscribe(
            (reqFormResponse) => {
              localStorage.setItem('invGroup', idGrupoCreado);

            },
            (reqFormError) => {
            }
          );
        },
        (error) => {
          this.savedMessage = 'Error al guardar el formulario';
          this.loadingData = false;

          this.router.navigateByUrl('/main/principal');

        }
      );
    }
    
  }//solo agrego }
    else {
      this.savedMessage = 'Verifica los campos del formulario';
      this.loadingData = false;

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
      ///console.log('error no se guardo nada')
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
private saveCurriculums(idGrupo: number, user: string, date: Date) {
  const sistema = 'GruposInv';
  const token = sessionStorage.getItem('access_token');

  const cv = this.selectedCv;
  const img = this.selectedImg;
  let observables = [];

  // Guardar imagen si existe
  if (img && !this.imageAlreadySaved) {
    const imgObservable = this.documentService.saveDocument(token, img, sistema).pipe(
      switchMap(response => {
        const annexes: Annexes = {
          idAnexo: null,
          idDocumento: 3,
          idGrupo: idGrupo,
          nombreAnexo: response.fileName,
          rutaAnexo: response.uuid,
          usuarioCreacionAnexo: user,
          fechaCreacionAnexo: date,
          usuarioModificacionAnexo: null,
          fechaModificacionAnexo: null
        };
        this.imageAlreadySaved = true;
        return this.annexesServices.createAnnexesForm(annexes);
      })
    );
    observables.push(imgObservable);
  }

  // Guardar CV del coordinador si existe
  if (cv && !this.cvsSavedInDatabase[this.currentUserId]) {
    const cvObservable = this.documentService.saveDocument(token, cv, sistema).pipe(
      switchMap(response => {
        const annexes: Annexes = {
          idAnexo: null,
          idDocumento: 2,
          idGrupo: idGrupo,
          nombreAnexo: response.fileName,
          rutaAnexo: response.uuid,
          usuarioCreacionAnexo: user,
          fechaCreacionAnexo: date,
          usuarioModificacionAnexo: null,
          fechaModificacionAnexo: null
        };
        return this.annexesServices.createAnnexesForm(annexes);
      })
    );
    observables.push(cvObservable);
  }

  // Solo guardar CVs que no hayan sido guardados automáticamente
  for (let index in this.selectedFileByUser) {
    if (this.selectedFileByUser.hasOwnProperty(index)) {
      const archivo = this.selectedFileByUser[index];
      const match = archivo.name.match(/hojaDeVida_(\d+)\.pdf/);
      const userId = match ? parseInt(match[1]) : null;

      // Solo guardar si no se ha guardado automáticamente
      if (!userId || !this.cvsSavedInDatabase[userId]) {
        const archivoObservable = this.documentService.saveDocument(token, archivo, sistema).pipe(
          switchMap(response => {
            const annexes: Annexes = {
              idAnexo: null,
              idDocumento: 2,
              idGrupo: idGrupo,
              nombreAnexo: response.fileName,
              rutaAnexo: response.uuid,
              usuarioCreacionAnexo: user,
              fechaCreacionAnexo: date,
              usuarioModificacionAnexo: null,
              fechaModificacionAnexo: null
            };
            return this.annexesServices.createAnnexesForm(annexes);
          })
        );
        observables.push(archivoObservable);
      }
    }
  }

  // Solo guardar CVs externos que no hayan sido guardados automáticamente
  for (let index in this.selectedFileByUserExtern) {
    if (this.selectedFileByUserExtern.hasOwnProperty(index)) {
      const archivo = this.selectedFileByUserExtern[index];
      const match = archivo.name.match(/hojaDeVida_(\d+)\.pdf/);
      const userId = match ? parseInt(match[1]) : null;

      // Solo guardar si no se ha guardado automáticamente
      if (!userId || !this.cvsSavedInDatabase[userId]) {
        const archivoObservable = this.documentService.saveDocument(token, archivo, sistema).pipe(
          switchMap(response => {
            const annexes: Annexes = {
              idAnexo: null,
              idDocumento: 1,
              idGrupo: idGrupo,
              nombreAnexo: response.fileName,
              rutaAnexo: response.uuid,
              usuarioCreacionAnexo: user,
              fechaCreacionAnexo: date,
              usuarioModificacionAnexo: null,
              fechaModificacionAnexo: null
            };
            return this.annexesServices.createAnnexesForm(annexes);
          })
        );
        observables.push(archivoObservable);
      }
    }
  }

  // Ejecutar todas las operaciones pendientes
  if (observables.length > 0) {
    forkJoin(observables).subscribe({
      next: (responses) => {
        this.router.navigateByUrl('main/principal');
        this.loadingData = false;
        this.snackBar.open('Enviado con éxito', 'Cerrar', {
          duration: 4000,
        });
      },
      error: (err) => {
        console.log(err);
        this.loadingData = false;
      }
    });
  } else {
    // Si no hay observables, continuar directamente
    this.router.navigateByUrl('main/principal');
    this.loadingData = false;
    this.snackBar.open('Enviado con éxito', 'Cerrar', {
      duration: 4000,
    });
  }

  this.loadingData = true;
}

  onDrop(event: any, t: string) {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (t === 'i') {
      this.processImageFile(file);
    } 
    if (t === 'h') {
      this.selectedCv=file;
      const customFileName = `Hoja_de_Vida_Coordinador${this.currentUserId}.pdf`;
      this.validateFileType();
      this.setFileName(customFileName);

      if (this.idGrupo) {
        this.saveCvCoordinador(this.idGrupo);
      } else {
        this.savePartialGroupAndCV();
      }
    }


  }

  //nuevo metodo
  private savePartialGroupAndCV(): void {
    const idGrupoFromSession = Number(sessionStorage.getItem('invGroup'));
if (idGrupoFromSession && !isNaN(idGrupoFromSession)) {
  this.idGrupo = idGrupoFromSession;
  return; // Ya existe, evitar duplicado
}

    if (!this.myForm.get('grupoInv1.nombreGrupoInv')?.value || 
        !this.myForm.get('grupoInv1.acronimoGrupoinv')?.value) {
      this.snackBar.open('Complete el nombre y acrónimo del grupo antes de subir el CV', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      return;
    }
  
    const grupoInvData: InvGroupForm = {
      idGrupoInv: null,
      idCoordinador: this.currentUserId,
      nombreGrupoInv: this.myForm.value.grupoInv1.nombreGrupoInv,
      estadoGrupoInv: "pendiente",
      acronimoGrupoinv: this.myForm.value.grupoInv1.acronimoGrupoinv,
      departamento: this.userCoordinador.departamento,
      proceso: "0", 
      sede: this.userCoordinador.sede,
      usuarioCreacion: this.currentUser,
      fechaCreacion: this.currentDate,
      usuarioModificacion: null,
      fechaModificacion: null
    };
  
    this.apiInvGroupService.createInvGroupForm(grupoInvData).subscribe(
      (response) => {
        this.reqFormResponse = response;
        const idGrupoCreado = this.reqFormResponse;
        this.idGrupo = idGrupoCreado;
        
        sessionStorage.setItem('invGroup', idGrupoCreado.toString());
        
        if (this.selectedCv) {
          this.saveCvCoordinador(idGrupoCreado);
        }
  
        const reqFormData: CreationReqForm = {
          idPeticionCreacion: null,
          idGrupoInv: idGrupoCreado,
          alineacionEstrategica: null,
          estado: "p",
          usuarioCreacionPeticion: this.currentUser,
          fechaCreacionPeticion: this.currentDate,
          usuarioModificacionPeticion: null,
          fechaModificacionPeticion: null,
        };
        
        this.creationReqService.createCreationRequestForm(reqFormData).subscribe(
          (reqFormResponse) => {
            localStorage.setItem('invGroup', idGrupoCreado);
          },
          (reqFormError) => {
            console.error('Error al crear petición:', reqFormError);
          }
        );
      },
      (error) => {
        console.error('Error al crear grupo parcial:', error);
        this.snackBar.open('Error al crear el grupo', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    );
  }

  onImgSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
  }

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
    this.setImageName(customFileName);

    this.previewImage(file);
    if (this.idGrupo) {
      this.saveImgGrupo(this.idGrupo);
    }
  }
//nuevo metodo
private saveImgGrupo(idGrupo: number): void {
  const token = sessionStorage.getItem('access_token');
  const sistema = 'GruposInv';

  if (!this.selectedImg || this.imageAlreadySaved) return;

  this.documentService.saveDocument(token, this.selectedImg, sistema).pipe(
    switchMap(response => {
      const annex: Annexes = {
        idAnexo: null,
        idDocumento: 3, 
        idGrupo,
        nombreAnexo: response.fileName,
        rutaAnexo: response.uuid,
        usuarioCreacionAnexo: this.currentUser,
        fechaCreacionAnexo: this.currentDate,
        usuarioModificacionAnexo: null,
        fechaModificacionAnexo: null,
      };
      this.imageAlreadySaved = true; 
      return this.annexesServices.createAnnexesForm(annex);
    })
  ).subscribe({
    next: () => {
      this.snackBar.open('Imagen guardada automáticamente', 'Cerrar', { duration: 3000 });
    },
    error: (err) => {
      console.error('Error al guardar imagen:', err);
    }
  });
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

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.add('drag-over');

  }
  fileNameOriginal: string;
  setFileName(name: string) {
    if (!this.selectedCv) {
      console.error("Error: No hay archivo seleccionado.");
      return;
    }
    this.CvNameOriginal = this.selectedCv.name;
    const modifiedFile = new File([this.selectedCv], name, { type: this.selectedCv.type });
    this.selectedCv = modifiedFile;
  }
  setImageName(name: string) {
    if (!this.selectedImg) {
      return;
    }
    this.imageNameOriginal = this.selectedImg.name;
    const modifiedFile = new File([this.selectedImg], name, { type: this.selectedImg.type });
    this.selectedImg = modifiedFile;
  }

  onCVCoordSelected(event: any) {
    this.selectedCv = event.target.files[0];
    const customFileName = `Hoja_de_Vida_Coordinador${this.currentUserId}.pdf`;
    this.validateFileType();
    this.setFileName(customFileName);
    if (this.idGrupo) {
      this.saveCvCoordinador(this.idGrupo);
    } else {
      this.savePartialGroupAndCV();
    }

  }
 


  validateFileType() {
    if (this.selectedCv) {
      const fileExtension = this.selectedCv.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'pdf') {
        alert('Solo se permiten archivos PDF.');
        this.clearFileInput();
      }
    }
  }

  validateImageType() {
    if (this.selectedImg) {
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'];
      const fileExtension = this.selectedImg.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert('Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF, SVG).');
        this.clearImageInput();
      }
    }
  }

  clearFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
  enlace(url: string) {
    this.router.navigateByUrl(`main/${url}`);

  }

  savePartialGroup(){
    const grupoInvData: InvGroupForm = {
        idGrupoInv: null,
        idCoordinador: this.currentUserId,
        nombreGrupoInv: this.myForm.value.grupoInv1.nombreGrupoInv,
        estadoGrupoInv: "pendiente",
        acronimoGrupoinv: this.myForm.value.grupoInv1.acronimoGrupoinv,
        departamento: this.userCoordinador.departamento,
        proceso: "1a",
        sede: this.userCoordinador.sede,
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null
      }
   // if(!sessionStorage.getItem('invGroup')){
    if (!this.idGrupo) {
this.apiInvGroupService.createInvGroupForm(grupoInvData).subscribe(
        (response) => {
          this.reqFormResponse = response;
          const idGrupoCreado = this.reqFormResponse;
          sessionStorage.setItem('invGroup', idGrupoCreado.toString());
          if (this.selectedCv && !this.cvsSavedInDatabase[this.currentUserId]) {
            this.saveCvCoordinador(idGrupoCreado);
          }
          const reqFormData: CreationReqForm = {
            idPeticionCreacion: null,
            idGrupoInv: idGrupoCreado,
            alineacionEstrategica: null,
            estado: "p",
            usuarioCreacionPeticion: this.currentUser,
            fechaCreacionPeticion: this.currentDate,
            usuarioModificacionPeticion: null,
            fechaModificacionPeticion: null,
          };
          this.creationReqService.createCreationRequestForm(reqFormData).subscribe(
            (reqFormResponse) => {
              localStorage.setItem('invGroup', idGrupoCreado);
            },
            (reqFormError) => {
            }
          );
        },
        (error) => {
          this.savedMessage = 'Error al guardar el formulario';
          this.loadingData = false;
          console.error('Error al crear grupo:', error);


        }
      );

    }
    else{
      grupoInvData.idGrupoInv = this.idGrupo;
      this.apiInvGroupService.update(this.idGrupo, grupoInvData).subscribe(
        (response) => {
          if (this.selectedCv && !this.cvsSavedInDatabase[this.currentUserId]) {
            this.saveCvCoordinador(this.idGrupo);
          }
          this.snackBar.open('Guardado con éxito', 'Cerrar', { duration: 3000 });

        },(error) => {
          console.error('Error al actualizar grupo:', error);
        }
      );

    }
    
          } 

           // método para verificar si el CV del coordinador está guardado
  isCoordinatorCVSaved(): boolean {
    return this.cvsSavedInDatabase[this.currentUserId] === true;
  }
  
  //Método para mostrar el estado del CV del coordinador en la interfaz
  getCoordinatorCVStatus(): string {
    if (this.cvsSavedInDatabase[this.currentUserId]) {
      return 'Guardado en base de datos';
    } else if (this.selectedCv) {
      return 'Seleccionado - Se guardará automáticamente';
    }
    return 'No seleccionado';
  }


          ///nuevos metodos
          private saveSingleInternalMember(user: any): void {
            const member: InvMemberForm = {
              idGrupoInv: this.idGrupo,
              idUsuario: user.user.idBd,
              fechaVinculacion: null,
              tipo: user.rol,
              status: "INTERNO",
              usuarioCreacion: this.currentUser,
              fechaCreacion: this.currentDate,
              usuarioModificacion: null,
              fechaModificacion: null
            };
          
            this.apiInvMemberService.createInvMemberFormForm(member).subscribe(
              (response) => {
              },
              (error) => {
                console.error('Error al guardar miembro interno:', error);
              }
            );
          
            const userRol: UserRoles = {
              idUsuario: user.user.idBd,
              idRoles: 8,
              usuarioCreacion: this.currentUser,
              fechaCreacion: this.currentDate,
              usuarioModificacion: null,
              fechaModificacion: null
            };
          
            this.userRolService.createUserRol(userRol).subscribe(
              (response) => {
                //console.log('Rol de usuario asignado:', response);
              },
              (error) => {
                console.error('El usuario ya tiene el rol:', error);
              }
            );
          }
          
          private saveSingleExternalMember(user: any, rol: string): void {
            const member: InvMemberForm = {
              idGrupoInv: this.idGrupo,
              idUsuario: user.id,
              fechaVinculacion: null,
              tipo: rol,
              status: "EXTERNO",
              usuarioCreacion: this.currentUser,
              fechaCreacion: this.currentDate,
              usuarioModificacion: null,
              fechaModificacion: null
            };
          
            this.apiInvMemberService.createInvMemberFormForm(member).subscribe(
              (response) => {
                //console.log('Miembro externo guardado:', response);
              },
              (error) => {
                console.error('Error al guardar miembro externo:', error);
              }
            );
          
            const userRol: UserRoles = {
              idUsuario: user.id,
              idRoles: 8,
              usuarioCreacion: this.currentUser,
              fechaCreacion: this.currentDate,
              usuarioModificacion: null,
              fechaModificacion: null
            };
          
            this.userRolService.createUserRol(userRol).subscribe(
              (response) => {
                //console.log('Rol de usuario externo asignado:', response);
              },
              (error) => {
                console.error('El usuario externo ya tiene el rol:', error);
              }
            );
          }

          // 1. Modificar el método loadExistingMembers para contar correctamente
private loadExistingMembers(idGrupo: number): void {
  this.apiInvMemberService.getByGroup(idGrupo).subscribe(
    (members) => {
      //console.log('Miembros recibidos:', members.length, members);

      // Limpiar arrays antes de cargar
      this.selectedUsers = [];
      this.selectedUsersExterns = [];
      this.miembrosInternos = [];
      this.totalMiembrosInternos = 0;


      members.forEach((member) => {
        if (member.status === 'INTERNO') {
          this.usuarioService.getById(member.idUsuario).subscribe(
            (userData) => {
              const userObj = {
                user: userData,
                userId: userData.usuario,
                rol: member.tipo,
              };
              this.selectedUsers.push(userObj);

              // Contar correctamente los miembros internos
              if (member.tipo === 'MIEMBRO' || member.tipo === 'SECRETARIO') {
                this.totalMiembrosInternos++;
                this.miembrosInternos.push(userObj);
                if (member.tipo === 'SECRETARIO') {
                  this.selectedMember = userObj;
                }
              }

              
              this.verificarDocumentosCargados();
            },
            (error) => {
              console.error('Error al cargar datos del miembro interno:', error);
            }
          );
        } else if (member.status === 'EXTERNO') {
          this.usuarioService.getById(member.idUsuario).subscribe(
            (externalUserData) => {
              const externalUser = {
                id: member.idUsuario,
                rol: member.tipo,
                nombres: externalUserData.nombre,
                institucion: externalUserData.institucion,
              };
              this.selectedUsersExterns.push(externalUser);

              
              this.verificarDocumentosCargados();
            },
            (error) => {
              console.error('Error al cargar datos del investigador externo:', error);
            }
          );
        }
      });

      // Cargar CVs después de cargar todos los miembros
      setTimeout(() => {
        this.loadExistingCVs(idGrupo);
        //console.log(`Total miembros internos cargados: ${this.totalMiembrosInternos}`);
      }, 500);
    },
    (error) => {
      console.error('Error al cargar miembros existentes:', error);
    }
  );
}

//nuevo 11/06/2025
onSecretarySelectionChange(): void {
  if (this.selectedMember && this.idGrupo) {
    const previousSecretary = this.selectedUsers.find(user => user.rol === 'SECRETARIO');
    if (previousSecretary && previousSecretary.userId !== this.selectedMember.userId) {
      previousSecretary.rol = 'MIEMBRO';

      const previousMemberData: InvMemberForm = {
        idGrupoInv: this.idGrupo,
        idUsuario: previousSecretary.user.idBd || previousSecretary.user.id,
        fechaVinculacion: null,
        tipo: 'MIEMBRO',
        status: "INTERNO",
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: this.currentUser,
        fechaModificacion: new Date()
      };

      this.apiInvMemberService.update(
        previousSecretary.user.idBd || previousSecretary.user.id,
        this.idGrupo,
        previousMemberData
      ).subscribe();
    }

    this.cambiarRol();
  }
}

// 2. Corregir el método loadExistingCVs
loadExistingCVs(idGrupo: number) {
  this.annexesServices.getByGroupType(idGrupo, '2').subscribe(
    (cvs: any[]) => {
      
      cvs.forEach(cv => {
        // Extraer el ID del usuario del nombre del archivo
        const match = cv.nombreAnexo.match(/hojaDeVida_(\d+)\.pdf/);
        if (match) {
          const userId = parseInt(match[1]);
          this.cvsSavedInDatabase[userId] = true;
          this.existingCvsInfo[userId] = cv;
          this.documentosCargados[userId] = true;          
        }
      });
      
      // Verificar documentos después de cargar CVs
      this.verificarDocumentosCargados();
      
    },
    (error) => {
      console.error('Error al cargar CVs existentes:', error);
    }
  );
}

          private updateCreationRequest(idGrupo: number): void {
            this.creationReqService.getByGroup(idGrupo).subscribe(
              (existingRequest) => {
                if (existingRequest) {
                  const updatedRequest: CreationReqForm = {
                    ...existingRequest,
                    estado: "p", 
                    usuarioModificacionPeticion: this.currentUser,
                    fechaModificacionPeticion: this.currentDate
                  };
                  
                  this.creationReqService.update(existingRequest.idPeticionCreacion, updatedRequest).subscribe(
                    (response) => {
                    },
                    (error) => {
                      console.error('Error al actualizar petición:', error);
                    }
                  );
                } else {
                  const reqFormData: CreationReqForm = {
                    idPeticionCreacion: null,
                    idGrupoInv: idGrupo,
                    alineacionEstrategica: null,
                    estado: "p",
                    usuarioCreacionPeticion: this.currentUser,
                    fechaCreacionPeticion: this.currentDate,
                    usuarioModificacionPeticion: null,
                    fechaModificacionPeticion: null,
                  };
                  
                  this.creationReqService.createCreationRequestForm(reqFormData).subscribe(
                    (response) => {
                    },
                    (error) => {
                      console.error('Error al crear petición:', error);
                    }
                  );
                }
              },
              (error) => {
                console.error('Error al buscar petición existente:', error);
              }
            );
          }

          savePartialSegmentation() {
            const idGrupo = Number(sessionStorage.getItem('invGroup'));
            
            if (!idGrupo) {
              this.snackBar.open('Error: No se encontró el grupo de investigación en sesión', 'Cerrar', { duration: 3000 });
              return;
            }
          
            // Actualizar el proceso a "1b" para indicar que se completó la segmentación
            const grupoInvData: InvGroupForm = {
              idGrupoInv: idGrupo,
              idCoordinador: this.currentUserId,
              nombreGrupoInv: this.myForm.value.grupoInv1.nombreGrupoInv,
              estadoGrupoInv: "pendiente",
              acronimoGrupoinv: this.myForm.value.grupoInv1.acronimoGrupoinv,
              departamento: this.userCoordinador.departamento,
              proceso: "1a", // Actualizar proceso
              sede: this.userCoordinador.sede,
              usuarioCreacion: this.currentUser,
              fechaCreacion: this.currentDate,
              usuarioModificacion: this.currentUser,
              fechaModificacion: this.currentDate
            };
          
            this.loadingData = true;
          
            // Actualizar el grupo
            this.apiInvGroupService.update(idGrupo, grupoInvData).subscribe(
              (response) => {
                // Guardar dominios, áreas y líneas
                this.saveAcademicDomain(idGrupo);
                this.saveArea(idGrupo);
                this.saveLine(idGrupo);
                
                this.loadingData = false;
                this.snackBar.open('Información Guardada exitosamente', 'Cerrar', { duration: 3000 });

              },
              (error) => {
                this.loadingData = false;
                this.snackBar.open('Error al guardar la segmentación', 'Cerrar', { duration: 3000 });
                console.error('Error:', error);
              }
            );
          }

          loadSegmentationData(invGroup: InvGroupForm) {
            const idGrupo = invGroup.idGrupoInv;
            
            if (!idGrupo) return;
          
            // Cargar dominios académicos guardados
            this.invGroup_academicDomainService.getByGroup(idGrupo).subscribe(
              (dominios) => {
                const dominiosIds = dominios.map(d => d.idDomimioAcademico);
                this.dominiosControl.patchValue(dominiosIds);
                
                // Actualizar áreas basadas en dominios cargados
                this.updateAreasByDominios(dominiosIds);
              },
              (error) => console.error('Error cargando dominios:', error)
            );
          
            // Cargar áreas guardadas
            this.invGroup_areaService.getByGroup(idGrupo).subscribe(
              (areas) => {
                const areasIds = areas.map(a => a.idArea);
                this.areasControl.patchValue(areasIds);
                
                // Actualizar líneas basadas en áreas cargadas
                this.updateLineasByAreas(areasIds);
              },
              (error) => console.error('Error cargando áreas:', error)
            );
          
            // Cargar líneas guardadas
            this.invGroup_linesService.getByGroup(idGrupo).subscribe(
              (lineas) => {
                const lineasIds = lineas.map(l => l.idLinea);
                this.lineasControl.patchValue(lineasIds);
              },
              (error) => console.error('Error cargando líneas:', error)
            );
          }


        // 1. Agregar método para guardar CV del coordinador individualmente
        private saveCvCoordinador(idGrupo: number): void {
          if (!this.selectedCv) {
            console.warn('No hay CV seleccionado para guardar');
            return;
          }
          if (this.cvsSavedInDatabase[this.currentUserId]) {
            //console.log('CV ya guardado previamente. Se evita duplicado.');
            return;
          }
        
          if (!idGrupo || idGrupo <= 0) {
            console.error('ID de grupo inválido:', idGrupo);
            this.snackBar.open('Error: ID de grupo no válido', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            return;
          }
        
  

  const sistema = 'GruposInv';
  const token = sessionStorage.getItem('access_token');

  if (!token) {
    this.snackBar.open('Error: Token de acceso no encontrado', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    return;
  }

  this.loadingData = true;

  
  this.documentService.saveDocument(token, this.selectedCv, sistema).pipe(
    switchMap(response => {
      const annexes: Annexes = {
        idAnexo: null,
        idDocumento: 2, // Tipo documento para CV coordinador
        idGrupo: idGrupo,
        nombreAnexo: response.fileName,
        rutaAnexo: response.uuid,
        usuarioCreacionAnexo: this.currentUser,
        fechaCreacionAnexo: this.currentDate,
        usuarioModificacionAnexo: null,
        fechaModificacionAnexo: null
      };
      return this.annexesServices.createAnnexesForm(annexes);
    })
  ).subscribe(
    (response) => {
      this.loadingData = false;
      //console.log('CV del coordinador guardado exitosamente');
      this.cvsSavedInDatabase[this.currentUserId] = true;
      this.existingCvsInfo[this.currentUserId] = response;
      this.snackBar.open('CV del coordinador cargado', 'Cerrar', { duration: 3000 });



    
    },
    (error) => {
      this.loadingData = false;
      console.error('Error al guardar CV del coordinador:', error);
      sessionStorage.removeItem('cvCoordinadorNombre');
      sessionStorage.removeItem('cvCoordinadorBase64');
    }
  );
}

// 2. Método para manejar el click en "Siguiente" en el step del CV
onCvStepNext(): void {
  if (this.selectedCv && this.idGrupo) {
    this.saveCvCoordinador(this.idGrupo);
  }
}  
// 4. Método para cargar documentos existentes
private loadExistingDocuments(idGrupo: number): void {
  // Cargar CV del coordinador
  this.annexesServices.getByGroupType(idGrupo, '2').subscribe(
    (annexes: Annexes[]) => {
      if (annexes && annexes.length > 0) {
        const cvCoordinador = annexes.find(a => a.idDocumento === 2);
        if (cvCoordinador) {
          this.CvNameOriginal = cvCoordinador.nombreAnexo;
          // Crear un archivo "dummy" para mostrar que ya está cargado
          this.selectedCv = new File([''], cvCoordinador.nombreAnexo, { type: 'application/pdf' });
        }
      }
    },
    (error) => {
      console.error('Error al cargar documentos existentes:', error);
    }
  );

  this.annexesServices.getByGroupType(idGrupo, '3').subscribe((annexes: Annexes[]) => {
    const imgLogo = annexes.find(a => a.idDocumento === 3);
    if (imgLogo) {
      this.imageAlreadySaved = true;
      this.imageNameOriginal = imgLogo.nombreAnexo;
      this.selectedImg = new File([''], imgLogo.nombreAnexo, { type: 'image/png' });
      this.isImageFile = true;
      this.fileIcon = this.getFileIcon('image/png');
    }
  });

}
 // 6. Nuevo método para guardar un CV individual
 private saveSingleCV(file: File, userId: number, tipoMiembro: string) {
  const sistema = 'GruposInv';
  const token = sessionStorage.getItem('access_token');

  // Si ya existe un CV para este usuario, actualizarlo
  if (this.cvsSavedInDatabase[userId] && this.existingCvsInfo[userId]) {
    this.updateExistingCV(file, userId, tipoMiembro);
    return;
  }

  this.documentService.saveDocument(token, file, sistema).subscribe(
    (response) => {
      const annexes: Annexes = {
        idAnexo: null,
        idDocumento: tipoMiembro === 'INTERNO' ? 2 : 1,
        idGrupo: this.idGrupo,
        nombreAnexo: response.fileName,
        rutaAnexo: response.uuid,
        usuarioCreacionAnexo: this.currentUser,
        fechaCreacionAnexo: this.currentDate,
        usuarioModificacionAnexo: null,
        fechaModificacionAnexo: null
      };

      this.annexesServices.createAnnexesForm(annexes).subscribe(
        (annexeResponse) => {
          this.cvsSavedInDatabase[userId] = true;
          this.existingCvsInfo[userId] = annexeResponse;
          this.snackBar.open('CV guardado automáticamente', 'Cerrar', {duration: 3000});
        },
        (error) => {
          console.error('Error al guardar anexo del CV:', error);
          this.snackBar.open('Error al guardar CV', 'Cerrar', {duration: 3000});
        }
      );
    },
    (error) => {
      console.error('Error al subir CV:', error);
      this.snackBar.open('Error al subir CV', 'Cerrar', {duration: 3000});
    }
  );
}

// 7. Nuevo método para actualizar un CV existente
private updateExistingCV(file: File, userId: number, tipoMiembro: string) {
  const sistema = 'GruposInv';
  const token = sessionStorage.getItem('access_token');

  this.documentService.saveDocument(token, file, sistema).subscribe(
    (response) => {
      const existingCV = this.existingCvsInfo[userId];
      const updatedAnnexes: Annexes = {
        ...existingCV,
        nombreAnexo: response.fileName,
        rutaAnexo: response.uuid,
        usuarioModificacionAnexo: this.currentUser,
        fechaModificacionAnexo: this.currentDate
      };

      this.annexesServices.update(existingCV.idAnexo, updatedAnnexes).subscribe(
        (updateResponse) => {
          this.existingCvsInfo[userId] = updateResponse;
          this.snackBar.open('CV actualizado automáticamente', 'Cerrar', { duration: 3000});
        },
        (error) => {
          console.error('Error al actualizar anexo del CV:', error);
        }
      );
    },
    (error) => {
      console.error('Error al subir CV actualizado:', error);
    }
  );
}

// 9. Método para mostrar estado del CV en la interfaz
getCVStatus(userId: number): string {
  if (this.cvsSavedInDatabase[userId]) {
    return 'Guardado';
  } else if (this.documentosCargados[userId]) {
    return 'Seleccionado';
  }
  return 'Pendiente';
}

// 10. Método para verificar si un CV está guardado
isCVSaved(userId: number): boolean {
  return this.cvsSavedInDatabase[userId] === true;
}

}
