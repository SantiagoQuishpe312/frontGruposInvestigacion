import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-seleccion-rol-dialog',
  template: `
    <h2 mat-dialog-title>Selecciona el rol</h2>
    <mat-dialog-content>
      <p>¿Este usuario será un "Miembro" o un "Colaborador"?</p>
      <mat-button-toggle-group [(ngModel)]="rolSeleccionado">
        <mat-button-toggle value="MIEMBRO">MIEMBRO</mat-button-toggle>
        <mat-button-toggle value="COLABORADOR">COLABORADOR</mat-button-toggle>
      </mat-button-toggle-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">CANCELAR</button>
      <button mat-button color="primary" [disabled]="!rolSeleccionado" (click)="confirmar()">Aceptar</button>
    </mat-dialog-actions>
  `
})
export class SeleccionRolDialogComponent {
  rolSeleccionado: string;

  constructor(public dialogRef: MatDialogRef<SeleccionRolDialogComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: any) {}

  confirmar() {
    this.dialogRef.close(this.rolSeleccionado);
  }
}
