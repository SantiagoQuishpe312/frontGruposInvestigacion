import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "src/app/core/auth/services/auth.service";
import { ControlPanelComplete, ControlPanelForm } from "src/app/types/controlPanel.types";
import { InvMemberService } from "src/app/core/http/inv-member/inv-member.service";
import { Usuario } from "src/app/types/usuario.types";
import { InvGroupService } from "src/app/core/http/inv-group/inv-group.service";
import { UsuarioService } from "src/app/core/http/usuario/usuario.service";
import { ObjectiveCompleteOds } from "src/app/types/obj_strategies_ods.types";
import { ControlPanelService } from "src/app/core/http/control-panel/control-panel.service";
@Component({
    selector: 'app-area',
    templateUrl: './modal_cuadro_actividades.component.html',
    styleUrls: ['../../../../styles/modales.scss']
})
export class ActControl implements OnInit {
    currentUser: string;
    currentDate: Date = new Date();
    controlPanelForm: FormGroup;
    isSaved: boolean = false;
    isLoading: boolean = false;
    isEditing: boolean = false;
    controlPanel: ControlPanelForm[] = [];
    members: Usuario[] = [];
    objetivos: ObjectiveCompleteOds[] = [];
    groupId: number;
    planId: number;
    coordId: number;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ActControl>,
        private invMemberService: InvMemberService,
        private invGroupService: InvGroupService,
        private usuarioService: UsuarioService,
        private controlPanelService: ControlPanelService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.objetivos = data.objetivos;
        this.planId = data.planId;
    }

    marcoCompleto: ControlPanelComplete;
    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.groupId = Number(sessionStorage.getItem("invGroup"));
        this.loadData();

        this.isEditing = !!this.data?.marco;
        if (this.isEditing) {
            this.marcoCompleto = this.data?.marco;
        }

        this.controlPanelForm = this.fb.group({
            idPlanDesarrollo: [this.planId, Validators.required],
            idObjetivoEspecifico: [this.marcoCompleto?.objetivoEspecifico?.idObjetivo || null, Validators.required],
            idResponsable: [this.marcoCompleto?.responsable?.id || null, Validators.required],
            actividad: [this.marcoCompleto?.panelControl?.actividad || '', Validators.required],
            indicadorNombre: [this.marcoCompleto?.panelControl?.indicadorNombre || '', Validators.required],
            indicadorTipo: [this.marcoCompleto?.panelControl?.indicadorTipo || '', Validators.required],
            indicadorForma: [this.marcoCompleto?.panelControl?.indicadorForma || '', Validators.required],
            indicadorCondicional: [this.marcoCompleto?.panelControl?.indicadorCondicional || '', Validators.required],
            indicadorAcumulativo: [this.marcoCompleto?.panelControl?.indicadorAcumulativo || '', Validators.required],
            meta1: [this.marcoCompleto?.panelControl?.meta1 || null, Validators.required],
            meta2: [this.marcoCompleto?.panelControl?.meta2 || null, Validators.required],
            meta3: [this.marcoCompleto?.panelControl?.meta3 || null, Validators.required],
            meta4: [this.marcoCompleto?.panelControl?.meta4 || null, Validators.required],
            financiamiento: [this.marcoCompleto?.panelControl?.financiamiento || null, Validators.required],
            observacion: [this.marcoCompleto?.panelControl?.observacion || '', Validators.required],
            usuarioCreacion: [this.marcoCompleto?.panelControl?.usuarioCreacion || this.currentUser, Validators.required],
            fechaCreacion: [this.marcoCompleto?.panelControl?.fechaCreacion || this.currentDate, Validators.required],
            usuarioModificacion: [this.currentUser],
            fechaModificacion: [this.currentDate]
        });
    }

    loadData(): void {
        this.invMemberService.getAllByGroupId(this.groupId).subscribe((data) => {
            this.members = [...data];
            this.invGroupService.getById(this.groupId).subscribe((groupData) => {
                this.usuarioService.getById(groupData.idCoordinador).subscribe((coord) => {
                    const exists = this.members.some(m => m.id === coord.id);
                    if (!exists) this.members.push(coord);
                });
            });
        });
    }

    saveControlPanel(): void {
        if (this.controlPanelForm.invalid) {
            console.log("Formulario no válido", this.controlPanelForm.value);
            return;
        }
        this.isLoading = true;
        if (this.isEditing) {
            this.controlPanelService.update(this.marcoCompleto.panelControl.idPanelControl, this.controlPanelForm.value).subscribe(
                (response) => {
                    console.log(response)
                    this.dialogRef.close(response);
                },
                (error) => {
                    console.error('Error al crear el control panel:', error);
                    this.isLoading = false;
                }
            );
        } else {
            this.controlPanelService.createControlPanelForm(this.controlPanelForm.value).subscribe(
                (response) => {
                    console.log(response)
                    this.dialogRef.close(response);
                },
                (error) => {
                    console.error('Error al crear el control panel:', error);
                    this.isLoading = false;
                }
            );
        }
    }

    onClickClose(): void {
        this.dialogRef.close();
    }


}