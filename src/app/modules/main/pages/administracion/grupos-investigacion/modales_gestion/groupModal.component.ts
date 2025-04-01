import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { forkJoin } from 'rxjs';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { Usuario } from 'src/app/types/usuario.types';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-members',
  templateUrl: './groupModal.component.html',
  styleUrls: ['../../../../styles/modales.scss']
})
export class GroupModalEdit implements OnInit {
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
  grupo: InvGroupForm;
  usuario: Usuario;
  mostrar: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UsuarioService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<GroupModalEdit>,
    private invGroupService: InvGroupService,
    private invMemberService: InvMemberService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.groupId = Number(sessionStorage.getItem('selectedId'));
    this.currentUser = this.authService.getUserName();
    this.currentDate = new Date();
    this.get(this.groupId);
    this.cargarFormularios();
  }

  get(id: number): void {
    forkJoin({
      grupo: this.invGroupService.getById(id),
      invGroup: this.invGroupService.getByIdAll(id)
    }).subscribe(
      ({ grupo, invGroup }) => {
        this.grupo = grupo;
        if (this.grupo.idCoordinador) {
          this.loadCoordinatorName(this.grupo.idCoordinador);
        }
        this.invGroup = invGroup;
        this.cargarFormularios(); // Carga el formulario solo cuando los datos estén listos
        this.isLoading = false; // Indica que ya no estás cargando datos
      },
      (error) => {
        console.error('Error al obtener los datos del grupo:', error);
        this.isLoading = false; // Asegúrate de no dejar la interfaz en estado de carga
      }
    );
  }

  loadCoordinatorName(coordinatorId: number): void {
    this.userService.getById(coordinatorId).subscribe(
      (data) => {
        this.coordinatorName = data.nombre; // Ajusta la propiedad según la respuesta del servicio
      },
      (error) => {
        console.error('Error al cargar el nombre del coordinador:', error);
        this.coordinatorName = 'Coordinador no encontrado';
      }
    );
  }

  cargarFormularios(): void {
    this.userForm = this.fb.group({
      usuario: ['']
    });
    if (this.grupo) {
      this.myForm = this.fb.group({
        idGrupoInv: [this.groupId, Validators.required],
        idCoordinador: [this.grupo.idCoordinador, Validators.required],
        nombreGrupoInv: [this.grupo.nombreGrupoInv, Validators.required],
        estadoGrupoInv: [this.grupo.estadoGrupoInv, Validators.required],
        acronimoGrupoinv: [this.grupo.acronimoGrupoinv, Validators.required],
        mision: [this.grupo.mision],
        vision: [this.grupo.vision],
        departamento: [this.grupo.departamento, Validators.required],
        usuarioCreacion: [this.grupo.usuarioCreacion, Validators.required],
        fechaCreacion: [this.grupo.fechaCreacion, Validators.required],
        usuarioModificacion: [this.currentUser],
        fechaModificacion: [this.currentDate],
      });
    } else {
      console.warn('El grupo no está definido al intentar cargar el formulario.');
    }
  }
  onSubmit() {
    this.invGroupService.update(this.groupId, this.myForm.value).subscribe(
      (response) => {
        console.log(response);
        this.get(this.groupId);
        this.dialogRef.close(true);

      },
      (error) => {
        console.error('Error al actualizar el grupo', error);
        this.dialogRef.close(true);

      }
    );

  }
  addUser() {
    this.mostrar = true;
  }
  cancelar() {
    this.mostrar = false;
  }
  coordinatorName: string = 'Cargando...';
  userForm: FormGroup;


  buscarMiembro(): void {
    const user = this.userForm.get('usuario').value;
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
    this.userForm.reset();
  }
  crearUsuario(user): void {
    this.isLoading = true;
    const currentUser = this.authService.getUserName();
    const currentDate = new Date();
    const token = sessionStorage.getItem('access_token');
    const userName = this.userForm.get('usuario').value;
    this.userService.getUserApp(userName, token).subscribe((data) => {
      this.userService.getByUserName(userName).subscribe((userData) => {
        if (userData.id != null) {
          this.user.idBd = userData.id;
          this.ActualizarCoord(userData.id);
          this.userForm.reset();
        } else {
          let nacionalidad:string;
          if(data.nacionalidad === 'E'){
            nacionalidad = 'ECUADOR';
          }else{
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
            sede:sede,
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
              this.ActualizarCoord(response);
              this.userForm.reset();
            }
          );
        }
      });
    });
  }
  ActualizarCoord(id: number) {
    this.isLoading = true;
    const dataGrupo = this.grupo;
    dataGrupo.idCoordinador = id;
    dataGrupo.usuarioModificacion = this.currentUser;
    dataGrupo.fechaModificacion = this.currentDate;
    this.invGroupService.update(this.groupId, dataGrupo).subscribe(
      (response) => {
        console.log(response);
        this.get(this.groupId); // Actualiza el nombre del coordinador
        this.cancelar();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al actualizar el grupo', error);
        this.isLoading = false;
      }
    );
    this.get(this.groupId);
  }

}
