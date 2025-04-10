import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agregar-proyectos',
  templateUrl: './agregar-proyectos.component.html',
  styleUrls: ['./estilosProyectos.scss']
})
export class AgregarProyectosComponent implements OnInit {
  projectsForm: FormGroup;
  tipoOpciones = ['Interno', 'Externo', 'Investigación', 'Vinculación'];
  estadoOpciones = ['En ejecución', 'Finalizado'];

  constructor(
    private dialogRef: MatDialogRef<AgregarProyectosComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.projectsForm = this.formBuilder.group({
      idInformeActividades: [this.data.idInformeActividades],
      titulo: ['', Validators.required],
      entidadFinanciera: ['', Validators.required],
      institucionColaboradora: ['', Validators.required],
      horas: ['', [Validators.required, Validators.min(0)]],
      minutos: ['', [Validators.required, Validators.min(0), Validators.max(60)]],
      presupuesto: ['', [Validators.required, Validators.min(0)]],
      responsable: ['', Validators.required],
      participantes: ['', Validators.required],
      tipo: ['', Validators.required],
      estado: ['', Validators.required],
      usuarioCreacion: [''],
      fechaCreacion: [''],
      usuarioModificacion: [''],
      fechaModificacion: ['']
    });

    this.capitalizeFirstLetter();
  }

  capitalizeFirstLetter() {
    for (const controlName in this.projectsForm.controls) {
      if (this.projectsForm.controls.hasOwnProperty(controlName)) {
        const control = this.projectsForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), { emitEvent: false });
          }
        });
      }
    }
  }

  save() {
    if (this.projectsForm.valid) {
      const minutos = this.projectsForm.get('minutos').value;
      if (minutos < 0 || minutos > 60) {
        this.snackBar.open('Los minutos deben estar entre 0 y 60', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      this.dialogRef.close(this.projectsForm.value);
      this.snackBar.open('Se ha guardado con éxito', 'Cerrar', {
        duration: 3000,
      });
    } else {
      this.showValidationErrors();
    }
  }

  private showValidationErrors() {
    const form = this.projectsForm;
    for (const controlName in form.controls) {
      if (form.controls.hasOwnProperty(controlName)) {
        const control = form.get(controlName);
        if (control.invalid) {
          let errorMessage = '';
          
          if (control.hasError('required')) {
            errorMessage = `El campo ${controlName} es requerido`;
          } else if (control.hasError('min')) {
            errorMessage = `El valor debe ser mayor o igual a ${control.errors.min.min}`;
          } else if (control.hasError('max')) {
            errorMessage = `Los minutos no pueden ser mayores a 60`;
          }

          if (errorMessage) {
            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 3000,
            });
            return;
          }
        }
      }
    }
    
    this.snackBar.open('Por favor, llene todos los campos requeridos', 'Cerrar', {
      duration: 2000,
    });
  }
  numericOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }
  
  numericDecimalOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode === 46) {
      return true;
    }
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  cancel() {
    this.dialogRef.close(null);
  }
}