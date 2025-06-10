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
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<Modal_ObjEspecifico>,
    private objService: SpecificObjetivesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserName();

    // Puede llegar undefined si es nuevo, así que validamos
    this.objetivoEspecifico = this.data?.objetivoEspecifico?.objetivo || '';
    this.planDesarrollo = this.data?.idPlanActual;

    this.form = this.fb.group({
      objetivo: [this.objetivoEspecifico, Validators.required]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const objetivo: SpecificObjetives = {
      idObjetivo: 0,
      idPlanDesarrollo:this.planDesarrollo,
      objetivo: this.form.value.objetivo,
      usuarioCreacion: this.currentUser,
      fechaCreacion: this.currentDate,
      usuarioModificacion: null,
      fechaModificacion: null,
    };

    this.isLoading = true;
    this.objService.createSpecificObjetive(objetivo).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dialogRef.close(data);
      },
      error: () => {
        this.isLoading = false;
        // Manejo de errores si deseas mostrar algo
      }
    });
  }

  onClickClose(): void {
    this.dialogRef.close();
  }
}
