import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-editar-congreso',
  templateUrl: './editar-congreso.component.html',
  styleUrls: ['../estilosModales.component.scss']
})
export class EditarCongresoComponent implements OnInit {
  congresoForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EditarCongresoComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.congresoForm = this.formBuilder.group({
      idInformeActividad: [this.data.idInformeActividades],
      numero: [this.data.numero],
      titulo: [this.data.titulo, Validators.required],
      autores: [this.data.autores, Validators.required],
      congreso: [this.data.congreso, Validators.required],
      doi: [this.data.doi, Validators.required],
      ifSjr: [this.data.ifSjr, Validators.required],
      cuartil: [this.data.cuartil, Validators.required],
      usuarioCreacion: [''],
      fechaCreacion: [''],
      usuarioModificacion: [''],
      fechaModificacion: ['']
    });

    this.capitalizeFirstLetter();
  }

  capitalizeFirstLetter() {
    for (const controlName in this.congresoForm.controls) {
      if (this.congresoForm.controls.hasOwnProperty(controlName)) {
        const control = this.congresoForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), {
              emitEvent: false
            });
          }
        });
      }
    }
  }

  guardarCambios(): void {
    if (this.congresoForm.valid) {
      this.dialogRef.close(this.congresoForm.value);
      this.snackBar.open('Actualizado con éxito', 'Cerrar', {
        duration: 3000
      });
    } else {
      this.snackBar.open(
        'Por favor, llene todos los campos requeridos',
        'Cerrar',
        {
          duration: 2000
        }
      );
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
