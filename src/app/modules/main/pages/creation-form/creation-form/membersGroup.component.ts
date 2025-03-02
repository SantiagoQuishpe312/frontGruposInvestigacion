import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { UserApp } from 'src/app/types/userApp.types';
import { Usuario } from 'src/app/types/usuario.types';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { ExternMembersGroup } from './externMemberForm.component';
import { Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-members',
  templateUrl: './membersGroup.component.html',
  styleUrls: ['../../coordinadorGI/sol-creacion/sol-creacion.component.scss']
})
export class MembersGroup implements OnInit {
  user: UserApp;
  @Output() usuarioExternoCreado: EventEmitter<Usuario> = new EventEmitter<Usuario>();
  private readonly URLImage = environment.imageApiUrl;
  usuarios: any[];
  miembro: FormGroup;
  isSearchClicked = false;
  userNotFound = false;

  constructor(
    private fb: FormBuilder,
    private userService: UsuarioService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<MembersGroup>,
    private dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.usuarios = data.usuarios;
  }

  ngOnInit(): void {
    this.miembro = this.fb.group({
      usuario: ['', Validators.required],
      tipo: ['', Validators.required]
    });
  }

  onClickNo(user): void {
    this.dialogRef.close(user);
  }

  buscarMiembro(): void {
    const user = this.miembro.get('usuario').value;
    const token = sessionStorage.getItem('access_token');
    this.userService.getUserApp(user, token).subscribe(
      (data) => {
        if (data) {
          this.user = data;
          this.isSearchClicked = true;
          this.userNotFound = false;
        } else {
          this.userNotFound = true;
          this.user = null;
          this.isSearchClicked = false;
        }
      },
      (error) => {
        this.userNotFound = true;
        this.user = null;
        this.isSearchClicked = false;
      }
    );
  }

  limpiarUsuario(): void {
    this.user = null;
    this.isSearchClicked = false;
    this.userNotFound = false;
    this.miembro.reset();
  }

  crearUsuario(user): void {
    const currentUser = this.authService.getUserName();
    const currentDate = new Date();
    const token = sessionStorage.getItem('access_token');
    const userName = this.miembro.get('usuario').value;

    this.userService.getUserApp(userName, token).subscribe((data) => {
      this.userService.getByUserName(userName).subscribe((userData) => {
        if (userData.id != null) {
          console.log("El usuario ya existe en la bd");
          this.user.idBd = userData.id;
        } else {
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
            cedula: data.cedula,
            fechaCreacion: currentDate,
            fechaModificacion: null,
            usuarioCreacion: currentUser,
            usuarioModificacion: null,
            institucion: 'UNIVERSIDAD DE LAS FUERZAS ARMADAS – ESPE',
            cargo: data.escalafon || "Administrativo",
            nacionalidad: data.nacionalidad,
            genero: data.sexo,
            grado: data.grado,
            sede: sede,
            foto: data.urlFoto,
          };
          this.userService.createUser(usuario).subscribe(
            (response) => {
              this.user.idBd = response;
            }
          );
        }
      });
    });
  }
  crearUsuarioExterno(): void {
    const dialogRef = this.dialog.open(ExternMembersGroup, {
      width: '60%',
      height: '90%',
      data: { usuarios: this.usuarios }
    });
    dialogRef.componentInstance.memberCreated.subscribe((usuarioCreado: Usuario) => {
      this.usuarios.push(usuarioCreado); // Agregar el usuario a la lista de usuarios
      this.usuarioExternoCreado.emit(usuarioCreado); // Emitir el usuario al componente padre
    });

  }
}
