
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { error } from "console";
import { AuthService } from "src/app/core/auth/services/auth.service";
import { SpecificObjetives } from "src/app/types/specificObjetives.types";
import { ObjStrategiesODSService } from "src/app/core/http/obj_strategies_ods/obj_strategies_ods.service";
import { Strategies } from "src/app/types/strategies.types";
import { ODS } from "src/app/types/ods.types";
import { forkJoin } from 'rxjs';
import { ControlPanelComplete, ControlPanelForm } from "src/app/types/controlPanel.types";
import { UsuarioService } from "src/app/core/http/usuario/usuario.service";

@Component({
    selector: 'app-modalCuadroOp',
    templateUrl: './modalCuadro.component.html',
    styleUrls: ['../../../../styles/modales.scss']
})
export class ModalCuadroOp implements OnInit {
    currentUser: string;
    currentDate: Date = new Date();
    objetivo: SpecificObjetives;
    panelControl: ControlPanelComplete;
    isSaved: boolean = false;
    isLoading: boolean = false;
    isEditing: boolean = false;
    myForm: FormGroup;
    ods: ODS[] = [];
    estrategias: Strategies[] = [];
    encargadoNombre: string;
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ModalCuadroOp>,
        private objStrategiesODSService: ObjStrategiesODSService,
        private usuarioService: UsuarioService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.objetivo = data.objetivoEspecifico;
        this.panelControl = data.panelControl;
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.myForm = this.fb.group({
            idPlanAnual: [null, ],
            idPanelControl: [this.panelControl.panelControl.idPanelControl, Validators.required],
            idOds: [null, Validators.required],
            idEstrategia: [null, Validators.required],
            objetivoAnual: ['', Validators.required],
            producto: ['', Validators.required],
            financiamiento: ['', Validators.required],
            monto: [null, Validators.required],
            presupuesto: ['', Validators.required],
            periodicidad: ['', Validators.required],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            mediosVerificacion: ['', Validators.required],
            usuarioCreacion: [this.currentUser, Validators.required],
            fechaCreacion: [this.currentDate, Validators.required],
        });
        this.getData(this.objetivo.idObjetivo);
    }

getData(id: number) {
  this.objStrategiesODSService.getCompleteByObj(id).subscribe(objData => {
    this.estrategias = objData.strategies;
    this.ods = objData.ods;
  });
    this.encargadoNombre = this.panelControl.responsable.nombre;

  }


    saveAnualControl(): void {
        if (this.myForm.valid) {
            console.log(this.myForm.value)
            this.dialogRef.close(this.myForm.value); // Devuelve los valores del formulario al componente padre
        } else {
            console.log("Formulario no válido")
            console.log(this.myForm.value)
        }
    }

    onClickClose(): void {
        this.dialogRef.close();
    }


}