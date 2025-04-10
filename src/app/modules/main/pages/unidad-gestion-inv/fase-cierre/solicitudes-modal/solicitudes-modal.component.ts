import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-solicitudes-modal',
  templateUrl: './solicitudes-modal.component.html',
  styleUrls: ['../estilosModales.component.scss']
})
export class SolicitudesModalComponent implements OnInit {

  solicitudForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<SolicitudesModalComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.solicitudForm = this.formBuilder.group({
      idCierre: [''],
      motivacion: ['', Validators.required],
      justificacion: ['', Validators.required],
      usuarioCreacion: [''],
      fechaCreacion: [''],
      usuarioModificacion: [''],
      fechaModificacion: ['']
    })
    this.capitalizeFirstLetter();
  }

  capitalizeFirstLetter() {
    for (const controlName in this.solicitudForm.controls) {
      if (this.solicitudForm.controls.hasOwnProperty(controlName)) {
        const control = this.solicitudForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), { emitEvent: false });
          }
        });
      }
    }
  }

  save() {
    if (this.solicitudForm.valid) {
      this.dialogRef.close(this.solicitudForm.value);
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
