import { NgOptimizedImage } from "@angular/common";
import { Component, OnInit, Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/core/auth/services/auth.service";
import { RelevanceReportService } from "src/app/core/http/relevance-report/relevance-report.service";
import { DatePipe } from "@angular/common";
import { RelevanceReport } from "src/app/types/relevancereport.types";
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { CreationReqForm } from 'src/app/types/creationReq.types';
@Component({
  selector: 'vex-creation-form',
  templateUrl: './infPertinencia.component.html',
  styleUrls: ['./creation-form.component.scss'],
})
@Injectable({
  providedIn: 'root'
})
export class InfPertinenciaComponent implements OnInit {
  loading: boolean = true;
  idGroup: number;
  isLinear = true;
  myForm: FormGroup;
  currentUser: string;
  currentDate: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private route: ActivatedRoute,
    private relevaceReportService: RelevanceReportService,
    private datePipe: DatePipe,
    private invGroupService: InvGroupService,
    private creationReqService: CreationReqService,
  ) {

  }

  ngOnInit() {
    this.iniciarForm();
    this.idGroup = Number(localStorage.getItem("GI"));
    this.currentUser = this.authService.getUserName();
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
  }

  iniciarForm() {
    this.myForm = this.fb.group({
      form1: this.fb.group({
        numeroMemo: ['', Validators.required],
        formularioCreacion: [true, Validators.requiredTrue],
        planDesarrollo: [true, Validators.requiredTrue],
        documentosAdicionales: [true, Validators.requiredTrue],
      }),
      form2: this.fb.group({
        objetivos: ['', Validators.required],
      }),
      form3: this.fb.group({
        planEstrategico: [true, Validators.requiredTrue],
        pertenenciaAcademicaAporte: [false, Validators.requiredTrue],
        coordinador: [false, Validators.requiredTrue],
        miembros: [false, Validators.requiredTrue],
        objetivosPlanDesarrollo: [false, Validators.requiredTrue],
      }),
      form4: this.fb.group({
        conclusiones: ['', Validators.required],
        recomendaciones: ['', Validators.required],
      }),
    });
    this.loading = false;
  }
  get form1() {
    return this.myForm.get('form1') as FormGroup;
  }

  get form2() {
    return this.myForm.get('form2') as FormGroup;
  }

  get form3() {
    return this.myForm.get('form3') as FormGroup;
  }

  get form4() {
    return this.myForm.get('form4') as FormGroup;
  }

  guardarReporte() {
    const relevanceReport: RelevanceReport = {
      idInformePertinencia: 0,
      idGrupo: this.idGroup,
      numeroMemo: this.myForm.value.form1.numeroMemo,
      formularioCreacion: this.myForm.value.form1.formularioCreacion ? 1 : 0,
      planDesarrollo: this.myForm.value.form1.planDesarrollo ? 1 : 0,
      documentosAdicionales: this.myForm.value.form1.documentosAdicionales ? 1 : 0,
      objetivos: this.myForm.value.form2.objetivos,
      planEstrategico: this.myForm.value.form3.planEstrategico ? 1 : 0,
      pertinenciaAcademicaAporte: this.myForm.value.form3.pertenenciaAcademicaAporte ? 1 : 0,
      coordinador: this.myForm.value.form3.coordinador ? 1 : 0,
      miembros: this.myForm.value.form3.miembros ? 1 : 0,
      objetivosPlanDesarrollo: this.myForm.value.form3.objetivosPlanDesarrollo ? 1 : 0,
      conclusiones: this.myForm.value.form4.conclusiones,
      recomendaciones: this.myForm.value.form4.recomendaciones,
      usuarioCreacion: this.currentUser,
      fechaCreacion: this.currentDate,
      usuarioModificacion: undefined,
      fechaModificacion: undefined
    };

    this.actualizarEstados();
    this.relevaceReportService.createRelevanceReport(relevanceReport).subscribe(
      (response) => {
        this.actualizarEstados();
      },
      (error) => {
        this.snackBar.open('Ocurrió un error inesperado al crear el informe de pertinencia. Por favor, inténtelo de nuevo.', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      }
    );
  }
  actualizarEstados() {

    this.invGroupService.getById(this.idGroup).subscribe(data => {
      const invGroup: InvGroupForm = {
        idGrupoInv: this.idGroup,
        idCoordinador: data.idCoordinador,
        nombreGrupoInv: data.nombreGrupoInv,
        estadoGrupoInv: data.estadoGrupoInv,
        acronimoGrupoinv: data.acronimoGrupoinv,
        usuarioCreacion: data.usuarioCreacion,
        fechaCreacion: data.fechaCreacion,
        usuarioModificacion: this.currentUser,
        fechaModificacion: this.currentDate,
        proceso: '5',

      }
      this.invGroupService.update(this.idGroup, invGroup).subscribe(
        (response) => {

          this.snackBar.open('Reporte de relevancia creado correctamente.', 'Cerrar', {
            duration: 3000,
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigateByUrl('main/solicitudes');
          }, 1000);
        });
    })
  }


  HandleSubmit() {
    this.loading = true;
    if (this.myForm.valid) {
      this.guardarReporte();

    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
      });
    }
  }
}
