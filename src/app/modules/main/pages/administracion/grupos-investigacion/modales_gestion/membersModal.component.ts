import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupCompleteForm } from 'src/app/types/invGroup.types';
import { forkJoin } from 'rxjs';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { Usuario } from 'src/app/types/usuario.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
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
  loadingData: boolean = true;
  myForm: FormGroup;
  groupId: number;
  currentUser: string;
  currentDate: Date;
  showInternalForm = false;
  showExternalForm = false;
  internalForm: FormGroup;
  externalForm: FormGroup;
  miembro: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UsuarioService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<MembersModalEdit>,
    private invGroupService: InvGroupService,
    private invMemberService: InvMemberService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.groupId = Number(sessionStorage.getItem('selectedId'));
    this.currentUser = this.authService.getUserName();
    this.currentDate = new Date();
    this.get(this.groupId);
    this.cargarFormularios();
  }

  get(id: number): void {
    this.invGroupService.getByIdAll(id).subscribe((data) => {
      this.invGroup = data;
    });
    this.loadingData = false;
  }

  cargarFormularios(): void {
    this.myForm = this.fb.group({
        usuario: ['']
      });
  
      this.miembro = this.fb.group({
        nombre: ['', Validators.required],
        telefono: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        cedula: ['', Validators.required],
        institucion: ['', Validators.required],
        nacionalidad: ['', Validators.required],
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

   crearUsuario(user): void {
      const currentUser = this.authService.getUserName();
      const currentDate = new Date();
      const token = sessionStorage.getItem('access_token');
      const userName = this.myForm.get('usuario').value;
      this.userService.getUserApp(userName, token).subscribe((data) => {
        this.userService.getByUserName(userName).subscribe((userData) => {
          if (userData.id != null) {
            console.log("El usuario ya existe en la bd");
            this.user.idBd = userData.id;
            this.AgregarMiembro(userData.id);
            this.myForm.reset();
                this.toggleForm(null);
          } else {
  
            const usuario: Usuario = {
              id: null,
              usuario: userName,
              nombre: data.nombres,
              idInstitucional: data.id,
              correo: data.correoInstitucional,
              departamento: data.ubicacion,
              cedula: data.cedula,
              fechaCreacion: currentDate,
              fechaModificacion: null,
              usuarioCreacion: currentUser,
              usuarioModificacion: null,
              institucion: 'UNIVERSIDAD DE LAS FUERZAS ARMADAS – ESPE',
              cargo: data.escalafon,
            };
            this.userService.createUser(usuario).subscribe(
              (response) => {
                this.user.idBd = response;
                console.log("usuario", response);
                this.AgregarMiembro(response);
                this.myForm.reset();
                this.toggleForm(null);
              }
            );
            console.log("user", userData);
          }
        });
      });
    }

  deleteMember(id: number): void {
    forkJoin([
      this.invMemberService.deleteUserGroup(id,this.groupId),
    ]).subscribe({
      next: () => {
        this.get(this.groupId); // Se ejecuta solo después de que ambas eliminaciones terminen
      },
      error: (err) => {
        console.error('Error al eliminar el área y sus líneas asociadas:', err);
      }
    });
  }
      @ViewChild('apellidoInput') apellidoInput: ElementRef;  // Referencia al campo de apellido
  
  
  guardarmiembro(): void {
    const apellido = this.apellidoInput.nativeElement.value;
    const nombreCompleto = `${apellido}, ${this.miembro.get('nombre').value}`;
    this.miembro.patchValue({ nombre: nombreCompleto });
    const userData: Usuario = this.miembro.value;
    userData.fechaCreacion = this.currentDate;
    userData.usuarioCreacion = this.currentUser;
    this.userService.createUser(userData).subscribe(
        (response) => {
            userData.id=response;
            this.AgregarMiembro(userData.id);
            this.miembro.reset();
            this.toggleForm(null);
        },
        (error) => {
            console.error('Error al crear el usuario', error);
        }
    );
}
AgregarMiembro(id: number){
    const data:InvMemberForm={
        idGrupoInv:this.groupId,
        idUsuario:id,
        fechaVinculacion:null,
        tipo:'Externo',
        usuarioCreacion:this.currentUser,
        fechaCreacion:this.currentDate,
        //imagen:
        usuarioModificacion:null,
        fechaModificacion:null
    }
    this.invMemberService.createInvMemberFormForm(data).subscribe(
        (response) => {
            console.log(response);
        },
        (error) => {
            console.error('Error al crear el usuario', error);
        }
    );
    this.get(this.groupId);
}
}
