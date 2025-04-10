import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupCompleteForm } from 'src/app/types/invGroup.types';
import { forkJoin, map, Observable, startWith, switchMap } from 'rxjs';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { Usuario } from 'src/app/types/usuario.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { DislinkMembersService } from 'src/app/core/http/dislink-members/dislink-members.service.spec';
import { DislinkMembers } from 'src/app/types/dislinkMembers.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-members',
  templateUrl: './membersModal.component.html',
  styleUrls: ['../../../../styles/modales.scss']
})
export class MembersModalEdit implements OnInit {
  user: any;
  usuarios: any[] = [];
  isSearchClicked = false;
  userNotFound = false;
  invGroup: InvGroupCompleteForm;
  isLoading: boolean = true;
  myForm: FormGroup;
  groupId: number;
  currentUser: string;
  currentDate: Date;
  showInternalForm = false;
  showExternalForm = false;
  internalForm: FormGroup;
  externalForm: FormGroup;
  miembro: FormGroup;
  miembroForm: FormGroup;
  userDataForm: FormGroup;
  isEdit: boolean = false;
  nacionalidades: string[] = [];
  nacionalidadesFiltradas: Observable<string[]>;
  rolExterno: string;
  constructor(
    private fb: FormBuilder,
    private userService: UsuarioService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<MembersModalEdit>,
    private invGroupService: InvGroupService,
    private invMemberService: InvMemberService,
    private dislinkService: DislinkMembersService,
    private snackBar: MatSnackBar,
    private http: HttpClient,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.groupId = Number(sessionStorage.getItem('selectedId'));
    this.currentUser = this.authService.getUserName();
    this.currentDate = new Date();
    this.get(this.groupId);
    this.cargarFormularios();
  }

  cancelar() {
    this.toggleForm(null);
    this.isEdit = false;
    this.showExternalForm = false;
    this.showInternalForm = false;
  }
  get(id: number): void {
    this.invGroupService.getByIdAll(id).subscribe((data) => {
      this.invGroup = data;
      this.isLoading = false;

    });
  }

  cargarFormularios(): void {
    this.myForm = this.fb.group({
      usuario: ['']
    });

    this.miembro = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', Validators.email],
      cedula: [''],
      institucion: ['', Validators.required],
      grado: [''],
      nacionalidad: ['', Validators.required],
      genero: ['', Validators.required],
    });
  }

  toggleForm(isInternal: boolean): void {
    this.showInternalForm = isInternal;
    this.showExternalForm = !isInternal;
  }
  buscarMiembro(): void {
    const user = this.myForm.get('usuario').value;
    const token = sessionStorage.getItem('access_token');
    this.userService.getUserApp(user, token).subscribe(
      (data) => {
        if (data) {
          this.user = data;
          this.isSearchClicked = true; // Activar la bandera después de la búsqueda exitosa
          this.userNotFound = false; // Usuario encontrado, no mostrar mensaje de error
        } else {
          this.userNotFound = true; // Usuario no encontrado, mostrar mensaje de error
          this.user = null;
          this.isSearchClicked = false; // No mostrar el botón "Añadir"
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
        this.userNotFound = true; // Error al buscar usuario, mostrar mensaje de error
        this.user = null;
        this.isSearchClicked = false; // No mostrar el botón "Añadir"
      }
    );
  }

  limpiarUsuario(): void {
    this.user = null;
    this.isSearchClicked = false; // Resetear la bandera al limpiar
    this.userNotFound = false; // Resetear la bandera de error al limpiar
    this.myForm.reset();
  }
  onTipoUsuarioChange(event: any) {
    // Aquí puedes manejar lo que suceda cuando cambie el tipo de usuario
    if (this.user) {
      this.user.rolInvestigador = event.value;

    }
    this.rolExterno = event.value;
  }
  crearUsuario(user): void {
    this.isLoading = true;

    const currentUser = this.authService.getUserName();
    const currentDate = new Date();
    const token = sessionStorage.getItem('access_token');
    const userName = this.myForm.get('usuario').value;
    this.userService.getUserApp(userName, token).subscribe((data) => {
      this.userService.getByUserName(userName).subscribe((userData) => {
        if (userData.id != null) {
          this.user.idBd = userData.id;
          this.AgregarMiembro(userData.id, 'INTERNO');
          this.myForm.reset();
          this.showExternalForm = false;
          this.showInternalForm = false;
        } else {
          let nacionalidad: string;
          if (data.nacionalidad === 'E') {
            nacionalidad = 'ECUADOR';
          } else {
            nacionalidad = data.nacionalidad;
          }
          const partes = data.ubicacion.split(" - ");
          const departamento = partes[1].trim();
          const sede = partes[0].trim();
          const usuario: Usuario = {
            id: null,
            usuario: userName,
            nombre: data.nombres,
            idInstitucional: data.id,
            correo: data.correoInstitucional,
            departamento: departamento,
            sede: sede,
            cedula: data.cedula,
            fechaCreacion: currentDate,
            fechaModificacion: null,
            usuarioCreacion: currentUser,
            usuarioModificacion: null,
            institucion: 'UNIVERSIDAD DE LAS FUERZAS ARMADAS – ESPE',
            cargo: data.escalafon,
            nacionalidad: nacionalidad,
            foto: data.urlFoto,
            genero: data.sexo,
            grado: data.grado,
          };
          this.userService.createUser(usuario).subscribe(
            (response) => {
              this.user.idBd = response;
              this.AgregarMiembro(response, 'INTERNO');
              this.myForm.reset();
              this.showExternalForm = false;
              this.showInternalForm = false;
            }
          );
        }
      });
    });
  }

  deleteMember(user: InvMemberForm, id: number): void {
    this.isLoading = true;
    const userData: DislinkMembers = {
      idGrupoInv: this.groupId,
      idUsuario: id,
      fechaVinculacion: user.fechaVinculacion,
      tipo: user.tipo,
      status: user.status,
      usuarioCreacion: this.currentUser,
      fechaCreacion: this.currentDate,
      usuarioModificacion: null,
      fechaModificacion: null
    };
    this.dislinkService.createDislinkMember(userData).pipe(
      switchMap(() => this.invMemberService.deleteUserGroup(id, this.groupId))
    ).subscribe({
      next: () => {
        this.get(this.groupId);
        this.snackBar.open('El Investigador ha sido desvinculado del GI', 'Cerrar', {
          duration: 3000,          // Duración en milisegundos
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Ocurrió un error al eliminar al Investigador.', 'Cerrar', {
          duration: 3000,          // Duración en milisegundos
        });
        this.isLoading = false;
      }
    });
  }

  @ViewChild('apellidoInput') apellidoInput: ElementRef;  // Referencia al campo de apellido

  editMemberInfo(user: InvMemberForm): void {
    this.cargarFormulariosInfoUser(user);
    this.isEdit = true;

  }
  onlyRead;
  cargarFormulariosInfoUser(user: InvMemberForm): void {

    this.miembroForm = this.fb.group({
      idGrupoInv: [user.idGrupoInv, Validators.required],
      idUsuario: [user.idUsuario, Validators.required],
      fechaVinculacion: [user.fechaVinculacion, Validators.required],
      tipo: [user.tipo, Validators.required],
      status: [user.status, Validators.required],
      usuarioCreacion: [user.usuarioCreacion, Validators.required],
      fechaCreacion: [user.fechaCreacion, Validators.required],
      usuarioModificacion: [user.usuarioModificacion, Validators.required],
      fechaModificacion: [user.fechaModificacion, Validators.required],
    });
    this.onlyRead = !!user.user.usuario; // Si existe un valor, el campo será readonly

    this.userDataForm = this.fb.group({
      id: [user.user.id, Validators.required],
      usuario: [user.user.usuario ?? 'EXTERNO'],
      nombre: [user.user.nombre, Validators.required],
      idInstitucional: [user.user.idInstitucional],
      correo: [user.user.correo],
      departamento: [user.user.departamento ?? 'EXTERNO'],
      cedula: [user.user.cedula],
            institucion: [user.user.institucion],
      cargo: [user.user.cargo],
      nacionalidad: [user.user.nacionalidad, Validators.required],
      foto: [user.user.foto],
      genero: [user.user.genero, Validators.required],
      grado: [user.user.grado, Validators.required],
      sede: [user.user.sede],
      fechaCreacion: [user.user.fechaCreacion, Validators.required],
      fechaModificacion: [user.user.fechaModificacion, Validators.required],
      usuarioCreacion: [user.user.usuarioCreacion],
      usuarioModificacion: [user.user.usuarioModificacion],
    })
    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe(data => {
      this.nacionalidades = data.map(country => country.translations.spa.common); // Extraer nombres en español
      this.nacionalidadesFiltradas = this.userDataForm.get('nacionalidad')!.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrarNacionalidades(value || ''))
      );
    });

  }


actualizarInfoMiembro(): void {
  this.isLoading = true;
  console.log('actualizarInfoMiembro');
  const miembroData = this.miembroForm.value;
  const usuarioData = this.userDataForm.value;
  console.log(this.userDataForm.valid);
  console.log(this.userDataForm.value);
  // Llamada concurrente para actualizar miembro y usuario
  forkJoin([
    this.invMemberService.update(miembroData.idUsuario, miembroData.idGrupoInv, miembroData),
    this.userService.update(usuarioData.id, usuarioData)
  ]).subscribe({
    next: ([miembroResponse, usuarioResponse]) => {
      this.get(this.groupId);         // Recargar datos del grupo
      this.isEdit = false;
      this.isLoading = false;
      // Mostrar mensaje de éxito
      this.snackBar.open('Información del usuario actualizada con éxito.', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    },
    error: (err) => {
      this.isLoading = false;
  
      // Mostrar mensaje de error
      this.snackBar.open('Error al actualizar la información del usuario.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  });
  
}


  private filtrarNacionalidades(valor: string): string[] {
    const filtro = valor.toLowerCase();
    return this.nacionalidades.filter(nacionalidad => nacionalidad.toLowerCase().includes(filtro));
  }

  guardarmiembro(): void {
    this.isLoading = true;
    const apellido = this.apellidoInput.nativeElement.value;
    const nombreCompleto = `${apellido}, ${this.miembro.get('nombre').value}`;
    this.miembro.patchValue({ nombre: nombreCompleto });
    const userData: Usuario = this.miembro.value;
    userData.fechaCreacion = this.currentDate;
    userData.usuarioCreacion = this.currentUser;
    this.userService.createUser(userData).subscribe(
      (response) => {
        this.isLoading = false;
        userData.id = response;
        this.AgregarMiembro(userData.id, 'EXTERNO');
        this.miembro.reset();
        this.cancelar();
      },
      (error) => {
        console.error('Error al crear el usuario', error);
      }
    );
  }
  AgregarMiembro(id: number, status: string) {
    let tipo: string;
    if (this.user) {
      tipo = this.user.rolInvestigador;
    } else {
      tipo = this.rolExterno;
    }
    const data: InvMemberForm = {
      idGrupoInv: this.groupId,
      idUsuario: id,
      fechaVinculacion: this.currentDate,
      tipo: tipo,
      status: status,
      usuarioCreacion: this.currentUser,
      fechaCreacion: this.currentDate,
      //imagen:
      usuarioModificacion: null,
      fechaModificacion: null
    }
    this.invMemberService.createInvMemberFormForm(data).subscribe(
      (response) => {
        this.get(this.groupId);
        this.isLoading = false;
      },
      (error) => {
        this.get(this.groupId);
        this.isLoading = false;
      }
    );
  }
}
