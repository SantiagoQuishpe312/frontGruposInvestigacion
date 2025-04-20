import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from 'src/app/core/auth/services/auth.service';
@Component({
    selector: 'vex-detalles',
    templateUrl: './modalDetalles.component.html',
    styleUrls: ['../../../../styles/modales.scss']
})
export class DetalleEquiposComponent implements OnInit {
    currentUser: string;
    currentDate: Date = new Date();
    form: FormGroup;
    isSaved: boolean = false;
    isLoading: boolean = false;
    isEditing: boolean = false; // Variable para determinar si se está en modo edición
    
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<DetalleEquiposComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any, // Datos que vienen del componente de la tabla
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        // Inicializar el formulario
        this.form = this.fb.group({
            codigo: [this.data.codigo, Validators.required],
            descripcion: [this.data.descripcionEquipo, Validators.required],
            fechaAdquisicion: [this.data.fechaAdquisicion, Validators.required],
            estadoActual: [this.data.estadoActual, Validators.required],
            ubicacionActual: [this.data.ubicacionActual, Validators.required],
        });

    }
    

      save(): void {
        if(this.form.valid){
            this.dialogRef.close(this.form.value)
        }
     else{
        alert("Complete los campos requeridos")
     }
      
      }
      
          onClickClose(): void {
        this.dialogRef.close();
      }
}