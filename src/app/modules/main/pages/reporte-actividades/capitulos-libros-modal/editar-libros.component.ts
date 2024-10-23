import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-editar-libros',
  templateUrl: './editar-libros.component.html',
  styleUrls: ['../estilosModales.component.scss']
})
export class EditarLibrosComponent implements OnInit {
  librosForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EditarLibrosComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.librosForm = this.formBuilder.group({
      idInformeActividades: [this.data.idInformeActividades],
      numero: [this.data.numero, Validators.required],
      titulo: [this.data.titulo, Validators.required],
      autor: [this.data.autor, Validators.required],
      libro: [this.data.libro, Validators.required],
      indice: [this.data.indice, Validators.required],
      usuarioCreacion: [''],
      fechaCreacion: [''],
      usuarioModificacion: [''],
      fechaModificacion: ['']
    });

    this.capitalizeFirstLetter();
  }

  capitalizeFirstLetter() {
    for (const controlName in this.librosForm.controls) {
      if (this.librosForm.controls.hasOwnProperty(controlName)) {
        const control = this.librosForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), { emitEvent: false });
          }
        });
      }
    }
  }

  guardarCambios(): void {
    if (this.librosForm.valid) {
      this.dialogRef.close(this.librosForm.value);
      this.snackBar.open('Actualizado con éxito', 'Cerrar', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Por favor, llene todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
