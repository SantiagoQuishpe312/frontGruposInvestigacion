import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { error } from "console";
import { AuthService } from "src/app/core/auth/services/auth.service";
import { ControlPanelService } from "src/app/core/http/control-panel/control-panel.service";
import { ControlPanelForm } from "src/app/types/controlPanel.types";
import { InvMemberService } from "src/app/core/http/inv-member/inv-member.service";
import { Usuario } from "src/app/types/usuario.types";
import { InvGroupService } from "src/app/core/http/inv-group/inv-group.service";
import { UsuarioService } from "src/app/core/http/usuario/usuario.service";
@Component({
    selector: 'app-area',
    templateUrl: './modal_cuadro_actividades.component.html',
    styleUrls: ['../../../styles/modales.scss']
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
    objetivos: any[] = [];
    groupId: number;
    coordId: number;
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ActControl>,
        private controlPanelService: ControlPanelService,
        private invMemberService: InvMemberService,
        private invGroupService: InvGroupService,
        private usuarioService: UsuarioService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.objetivos = data.objetivos;
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getUserName();
        this.groupId = Number(sessionStorage.getItem("invGroup"));
        this.loadData();
        console.log(this.data.objetivos)
        this.controlPanelForm = this.fb.group({
            idPlanDesarrollo: [1, Validators.required],
            idObjetivoEspecifico: [null, Validators.required],
            idResponsable: [null, Validators.required],
            actividad: ['', Validators.required],
            indicadorNombre: ['', Validators.required],
            indicadorTipo: ['', Validators.required],
            indicadorForma: ['', Validators.required],
            indicadorCondicional: ['', Validators.required],
            indicadorAcumulativo: ['', Validators.required],
            meta1: [null, Validators.required],
            meta2: [null, Validators.required],
            meta3: [null, Validators.required],
            meta4: [null, Validators.required],
            financiamiento: [null, Validators.required],
            observacion: ['', Validators.required]
        });

    }


    loadData(): void {
        this.invMemberService.getAllByGroupId(this.groupId).subscribe((data) => {
            this.members = data;
            console.log(this.members)
        })
        this.invGroupService.getById(this.groupId).subscribe((data) => {
            this.usuarioService.getById(data.idCoordinador).subscribe((data) => {
                this.members.push(data)
            })
        })
        console.log(this.members)

    }


    saveControlPanel(): void {
        if (this.controlPanelForm.valid) {
            console.log(this.controlPanelForm.value)
          this.dialogRef.close(this.controlPanelForm.value); // Devuelve los valores del formulario al componente padre
        }else{
            console.log("Formulario no válido")
            console.log(this.controlPanelForm.value)
        }
      }

    onClickClose(): void {
        this.dialogRef.close();
    }


}