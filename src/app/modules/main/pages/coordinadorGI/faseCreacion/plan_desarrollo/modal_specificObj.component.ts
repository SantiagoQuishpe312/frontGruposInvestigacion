import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { Objectives } from 'src/app/types/specificobjectives.types';
import { ODS } from 'src/app/types/ods.types';
import { SpecificObjetivesService } from 'src/app/core/http/specific-objetives/specific-objetives.service';
import { SpecificObjetives } from 'src/app/types/specificObjetives.types';
@Component({
    selector: 'app-area',
    templateUrl: './modal_specificObj.component.html',
    styleUrls: ['../../../../styles/modales.scss']
})
export class Modal_ObjEspecifico implements OnInit {
     currentUser: string;
  currentDate: Date = new Date();
  form: FormGroup;
  isSaved: boolean = false;
  isLoading: boolean = false;
  isEditing: boolean = false;

  objetivoEspecifico: string;
planDesarrollo:number;
idObjetivo: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<Modal_ObjEspecifico>,
    private objService: SpecificObjetivesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

ngOnInit(): void {
  this.currentUser = this.authService.getUserName();
  const dataObj = this.data?.objetivoEspecifico;

  this.objetivoEspecifico = dataObj?.objetivo || '';
  this.planDesarrollo = this.data?.idPlanActual;
  this.idObjetivo = dataObj?.idObjetivo || 0;
  this.isEditing = !!dataObj;

  this.form = this.fb.group({
    objetivo: [this.objetivoEspecifico, Validators.required]
  });
}

  save(): void {
  if (this.form.invalid) return;

  const objetivo: SpecificObjetives = {
    idObjetivo: this.idObjetivo,
    idPlanDesarrollo: this.planDesarrollo,
    objetivo: this.form.value.objetivo,
    usuarioCreacion: this.isEditing ? null : this.currentUser,
    fechaCreacion: this.isEditing ? null : this.currentDate,
    usuarioModificacion: this.isEditing ? this.currentUser : null,
    fechaModificacion: this.isEditing ? this.currentDate : null,
  };

  this.isLoading = true;

  const request$ = this.isEditing
    ? this.objService.update(this.idObjetivo,objetivo)
    : this.objService.createSpecificObjetive(objetivo);

  request$.subscribe({
    next: (data) => {
      this.isLoading = false;
      this.dialogRef.close(data);
    },
    error: () => {
      this.isLoading = false;
    }
  });
}


  onClickClose(): void {
    this.dialogRef.close();
  }
}
