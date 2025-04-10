import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-evaluaciones-modal',
  templateUrl: './evaluaciones-modal.component.html',
  styleUrls: ['../estilosModales.component.scss']
})
export class EvaluacionesModalComponent implements OnInit {

  evaluacionForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<EvaluacionesModalComponent>,
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.evaluacionForm = this.formBuilder.group({
      idCierre: [''],
                  registro: ['', Validators.required],
                  criteriosNoSatisfactorio: ['', Validators.required],
                  accionesNoSatisfactorio: ['', Validators.required],
                  usuarioCreacion: [''],
                  fechaCreacion: [''],
                  usuarioModificacion: [''],
                  fechaModificacion: ['']
    })
    this.capitalizeFirstLetter();

  }

  capitalizeFirstLetter() {
    for (const controlName in this.evaluacionForm.controls) {
      if (this.evaluacionForm.controls.hasOwnProperty(controlName)) {
        const control = this.evaluacionForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), { emitEvent: false });
          }
        });
      }
    }
  }

  save() {
    if (this.evaluacionForm.valid) {
      this.dialogRef.close(this.evaluacionForm.value);
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
