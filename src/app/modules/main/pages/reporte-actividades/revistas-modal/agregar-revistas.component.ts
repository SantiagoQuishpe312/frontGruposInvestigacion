import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agregar-revista',
  templateUrl: './agregar-revistas.component.html',
  styleUrls: ['../estilosModales.component.scss']
})
export class AgregarRevistaComponent implements OnInit {
  revistaForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AgregarRevistaComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.revistaForm = this.formBuilder.group({
      idInformeActividades: [this.data.idInformeActividades],
      //numero: ['', Validators.required],
      titulo: ['', Validators.required],
      autores: ['', Validators.required],
      revista: ['', Validators.required],
      indice: ['', Validators.required],
      //ifjrc: ['', Validators.required],
      doi: ['', Validators.required],
      ifsjr: ['', Validators.required],
      usuarioCreacion: [''],
      fechaCreacion: [''],
      usuarioModificacion: [''],
      fechaModificacion: ['']
    });

    this.capitalizeFirstLetter();
  }

  capitalizeFirstLetter() {
    for (const controlName in this.revistaForm.controls) {
      if (this.revistaForm.controls.hasOwnProperty(controlName)) {
        const control = this.revistaForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), { emitEvent: false });
          }
        });
      }
    }
  }

  save() {
    if (this.revistaForm.valid) {
      this.dialogRef.close(this.revistaForm.value);
      this.snackBar.open('Se ha guardado con éxito', 'Cerrar', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Por favor, llene todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
