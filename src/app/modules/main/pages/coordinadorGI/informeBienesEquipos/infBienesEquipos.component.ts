import { DatePipe } from "@angular/common";
import { Component, Inject, Injectable, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/core/auth/services/auth.service";
import { AssetsReportService } from "src/app/core/http/assets-report/assets-report.service";
import { AssetsReport } from "src/app/types/assetsReport.types";
import { ActivatedRoute, Router } from "@angular/router";
import { error } from "console";

@Component({
    selector: 'vex-creation-form',
    templateUrl: './infBienesEquipos.component.html',
    styleUrls: ['./creation-form.component.scss'],
})

@Injectable({
    providedIn: 'root'
})
export class infBienesEquiposComponent implements OnInit{
    idGrupoInvestigacion: number;
    isLinear = true;
    myForm: FormGroup;
    currentUser: string;
    currentData: any;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private assetsReportService: AssetsReportService,
        private datePipe: DatePipe,
    ){
        this.myForm = this.fb.group({
            form1: this.fb.group({
                objetivoReporte: ['',Validators.required],
                contextoReporte: ['',Validators.required]
            }),
            form2: this.fb.group({
                usoEstado:['',Validators.required],
                condicionesGenerales:['',Validators.required],
                relevancia:['',Validators.required],
            }),
            form3: this.fb.group({
                conclusiones:['',Validators.required]
            })
        })

    }

    ngOnInit(): void {
        this.idGrupoInvestigacion = Number(sessionStorage.getItem("invGroup"))
        this.currentUser = this.authService.getUserName();
        this.currentData = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    }

    get form1(){
        return this.myForm.get('form1') as FormGroup;
    }
    get form2(){
        return this.myForm.get('form2') as FormGroup;
    }
    get form3(){
        return this.myForm.get('form3') as FormGroup;
    }

    guardarInforme(){
        const assetsReport: AssetsReport = {
            idReporteActivos: 0,
            idGrupoInvestigacion: this.idGrupoInvestigacion,
            objetivoReporte: this.myForm.value.form1.objetivoReporte,
            contextoReporte: this.myForm.value.form1.contextoReporte,
            usoEstado: this.myForm.value.fomr2.usoEstado,
            condicionesGenerales: this.myForm.value.fomr2.condicionesGenerales,
            relevancia: this.myForm.value.form2.relevancia,
            conclusiones: this.myForm.value.form3.conclusiones
        }
        this.assetsReportService.createAssetsReport(assetsReport).subscribe(
            (response) => {
                setTimeout(() => {
                    this.router.navigateByUrl('main/dashboard');
                }, 8000);
                console.log('Informe creado:',response);
            },
            (error) => {
                console.error('Error al crear el informe: ', error)
            }
        )
    }

    HandleSubmit(){
        if(this.myForm.valid){
            this.guardarInforme();
            this.snackBar.open('Solicitudes enviadas correctamete', 'Cerrar',{
                duration: 3000,
            });
        }else {
            this.snackBar.open('Por favor, complete todos los campos requieridos', 'Cerrar',{
                duration: 3000,
            });
        }
    }

}