import { Component, OnInit, Inject, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { UserApp } from 'src/app/types/userApp.types';
import { Usuario } from 'src/app/types/usuario.types';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, startWith, map } from 'rxjs';

@Component({
    selector: 'app-members',
    templateUrl: './externMemberForm.component.html',
    styleUrls: ['../../coordinadorGI/sol-creacion/sol-creacion.component.scss']
})
export class ExternMembersGroup implements OnInit {
    @ViewChild('apellidoInput') apellidoInput: ElementRef;  
    @Output() memberCreated: EventEmitter<Usuario> = new EventEmitter(); 
    user: UserApp;
    usuarios: Usuario[] = [];
    miembro: FormGroup;
    isSearchClicked = false;
    userNotFound = false;
    currentUser: string;
    currentDate: Date = new Date();
    isSaved: boolean = false;
    isLoading: boolean = false;
    nacionalidades: string[] = [];
    nacionalidadesFiltradas: Observable<string[]>;

    constructor(
        private fb: FormBuilder,
        private userService: UsuarioService,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ExternMembersGroup>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpClient
    ) {
        this.usuarios = data.usuarios;
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.miembro = this.fb.group({
            nombre: ['', Validators.required],
            correo: ['', Validators.email],
            cedula: [''],
            institucion: ['', Validators.required],
            grado: [''],
            nacionalidad: ['', Validators.required],
            genero: ['', Validators.required],
        });

        // Cargar nacionalidades desde la API
        this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe(data => {
            this.nacionalidades = data.map(country => country.translations.spa.common); // Extraer nombres en español
            this.nacionalidadesFiltradas = this.miembro.get('nacionalidad')!.valueChanges.pipe(
                startWith(''),
                map(value => this.filtrarNacionalidades(value || ''))
            );
        });

    }

    private filtrarNacionalidades(valor: string): string[] {
        const filtro = valor.toLowerCase();
        return this.nacionalidades.filter(nacionalidad => nacionalidad.toLowerCase().includes(filtro));
    }

    convertirAMayusculas(event: Event) {
        const inputElement = event.target as HTMLInputElement; // ✅ Cast seguro
        this.miembro.get('institucion')?.setValue(inputElement.value.toUpperCase(), { emitEvent: false });
      }
      
    onClickNo(): void {
        this.dialogRef.close();
    }

    guardarmiembro(): void {
        this.isLoading = true;

        // Convertir valores a mayúsculas antes de guardar
        const apellido = this.apellidoInput.nativeElement.value.toUpperCase();
        const nombre = this.miembro.get('nombre')?.value.toUpperCase();
        const nombreCompleto = `${apellido}, ${nombre}`;
        this.miembro.patchValue({ nombre: nombreCompleto });

        // Crear el objeto usuario
        const userData: Usuario = this.miembro.value;
        userData.fechaCreacion = this.currentDate;
        userData.usuarioCreacion = this.currentUser;

        this.userService.createUser(userData).subscribe(
            (response) => {
                this.isSaved = true;
                this.isLoading = false;
                userData.id = response;
                this.memberCreated.emit(userData);
                this.dialogRef.close();
            },
            (error) => {
                this.isLoading = false;
            }
        );
    }
}
