import { Component, OnInit } from '@angular/core';
import { Annexes } from 'src/app/types/annexes.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import {MatSnackBar} from '@angular/material/snack-bar';
import { DevelopmentPlanService } from 'src/app/core/http/develop-plan-form/develop-plan-form.service';
import { DevelopmentPlanComplete, DevelopmentPlanForms } from 'src/app/types/developPlanForm';
import { FormGroup } from '@angular/forms';
@Component({
    selector: 'app-carga-anexo',
    templateUrl: './planAnual.component.html',
    styleUrls: ['./planAnual.component.scss']
})
export class AnnualPlanComponent implements OnInit {
    currentDate: Date = new Date();
    currentUser: string;
    groupId: number;
    token: string;
    isSelectedPlan: boolean = false;
    isLoading: boolean = true;
    developmentPlan: DevelopmentPlanForms[];
    sinPlan: boolean = false;
    mostrarPlan: boolean = false;
    myForm: FormGroup;
    constructor(
        private annexesService: AnnexesService,
        private router: Router,
        private authService: AuthService,
        private documentService: DocumentsService,
        private invGroupService: InvGroupService,
        private creationReqService: CreationReqService,
        private matSnackBar:MatSnackBar,
        private developmentPlanService:DevelopmentPlanService
    ) { }

    ngOnInit(): void {
        this.groupId = Number(sessionStorage.getItem("invGroup"));
        this.loadDevelopmentPlan();
    }
   loadDevelopmentPlan(){
    this.developmentPlanService.getByIdGroupC(this.groupId).subscribe(
        (response) => {
          this.isLoading = false;
          const fechaActual = new Date();
      
          // Filtrar los planes que están dentro de los últimos 4 años
          this.developmentPlan = response.filter((plan) => {
            const fechaCreacion = new Date(plan.fechaCreacionUsuario);
            const diferenciaAnios = fechaActual.getFullYear() - fechaCreacion.getFullYear();
            return diferenciaAnios <= 4;
          });
      
          if (this.developmentPlan.length === 0) {
            this.sinPlan = true;
          }else{
            this.ObtenerPlanCompleto(this.developmentPlan[0].idGrupoInv);
          }
          
          console.log(this.developmentPlan);
        },
        (error) => {
          console.error('Error al obtener el plan de desarrollo:', error);
          this.isLoading = false;
        }
      );
      
}
RevisarPlan(){
    localStorage.setItem('planDesarrollo', JSON.stringify(this.developmentPlan));
    this.mostrarPlan = true;
}
planDesarrolloCompleto:DevelopmentPlanComplete;
ObtenerPlanCompleto(id:number){
    this.developmentPlanService.getAllByIdGroupStateType(id,this.developmentPlan[0].tipo,this.developmentPlan[0].estado).subscribe((data) => {
        this.planDesarrolloCompleto = data;
        console.log(this.planDesarrolloCompleto);
});
}

HandleSubmit(){

}
}
