import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agregar-objetivos',
  templateUrl: './agregar-objetivos.component.html',
  styleUrls: ['../estilosModales.component.scss']
})
export class AgregarObjetivosComponent {
  objStrategiesForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AgregarObjetivosComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.objStrategiesForm = this.formBuilder.group({
      idInformeActividades: [this.data.idInformeActividades],
      objetivo: ['', Validators.required],
      estrategia: ['', Validators.required],
      verificable: ['', Validators.required],
      cumplimiento: ['', [Validators.required, this.validarPorcentaje]],

      usuarioCreacion: [''],
      fechaCreacion: [''],
      usuarioModificacion: [''],
      fechaModificacion: ['']
    });
    document.addEventListener('keydown', (event) => {
      const element = event.target as HTMLInputElement;
      if (element.tagName === 'INPUT' && element.selectionStart === 0 && event.key === ' ') {
        event.preventDefault();
      }
    });
    this.capitalizeFirstLetter();
  }

  capitalizeFirstLetter() {
    for (const controlName in this.objStrategiesForm.controls) {
      if (this.objStrategiesForm.controls.hasOwnProperty(controlName)) {
        const control = this.objStrategiesForm.controls[controlName];
        control.valueChanges.subscribe((value: string) => {
          if (value && typeof value === 'string' && value.length > 0) {
            control.setValue(value.charAt(0).toUpperCase() + value.slice(1), { emitEvent: false });
          }
        });
      }
    }
  }

  save() {
    if (this.objStrategiesForm.valid) {
      this.dialogRef.close(this.objStrategiesForm.value);
      this.snackBar.open('Se ha guardado con éxito', 'Cerrar', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Por favor, llene todos los campos requeridos', 'Cerrar', {
        duration: 2000,
      });
    }
  }

  validarPorcentaje(control) {
    const cumplimiento = control.value;
    if (cumplimiento < 0 || cumplimiento > 100) {
      return { 'rangoInvalido': true };
    }
    return null;
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
