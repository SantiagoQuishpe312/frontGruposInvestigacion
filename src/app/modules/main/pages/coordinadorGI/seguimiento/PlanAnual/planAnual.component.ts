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
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpecificObjetives } from 'src/app/types/specificObjetives.types';
import { MatDialog } from '@angular/material/dialog';
import { ModalCuadroOp } from './modalCuadro.component';
import { AnualControlService } from 'src/app/core/http/anual-control/anual-control.service';
import { AnnualOperativePlanService } from 'src/app/core/http/annual-operative-plan/annual-operative-plan.service';
import { AnualControl } from 'src/app/types/anualControl.types';
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
  isSelectedPlan = false;
  isLoading = true;
  developmentPlan: DevelopmentPlanForms[];
  sinPlan = false;
  mostrarPlan = false;

  myForm: FormGroup;
  form: FormGroup;
  objetivosEspecificos: any[] = [];
  planDesarrolloCompleto: DevelopmentPlanComplete;

  constructor(
    private annexesService: AnnexesService,
    private router: Router,
    private authService: AuthService,
    private documentService: DocumentsService,
    private invGroupService: InvGroupService,
 
    private matSnackBar: MatSnackBar,
    private developmentPlanService: DevelopmentPlanService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private anualControlService: AnualControlService,
    private annualOperativePlanService: AnnualOperativePlanService
  ) {}

  ngOnInit(): void {
    this.groupId = Number(sessionStorage.getItem("invGroup"));

    this.myForm = this.fb.group({
      objetivoGeneral: ['', Validators.required],
      idGrupoInvestigacion: [this.groupId, Validators.required],
      anualControles: this.fb.array([]),
      idObjetivoEspecifico: [null, Validators.required],
      usuarioCreado: [this.currentUser, Validators.required],
      fechaCreacion: [this.currentDate, Validators.required],
      usuarioModificacion: [null, Validators.required], 
      fechaModificacion: [null, Validators.required]
    });


    this.loadDevelopmentPlan();
   
    
  }

  loadDevelopmentPlan(): void {
    this.developmentPlanService.getByIdGroupC(this.groupId).subscribe(
      (response) => {
        this.isLoading = false;
        const fechaActual = new Date();

        this.developmentPlan = response.filter(plan => {
          const fechaCreacion = new Date(plan.fechaCreacionUsuario);
          return fechaActual.getFullYear() - fechaCreacion.getFullYear() <= 4;
        });

        this.sinPlan = this.developmentPlan.length === 0;

        if (!this.sinPlan) {
          this.ObtenerPlanCompleto(this.developmentPlan[0].idGrupoInv);
        }
      },
      (error) => {
        console.error('Error al obtener el plan de desarrollo:', error);
        this.isLoading = false;
      }
    );
  }

  RevisarPlan(): void {
    localStorage.setItem('planDesarrollo', JSON.stringify(this.developmentPlan));
    this.mostrarPlan = true;
  }

  ObtenerPlanCompleto(id: number): void {
    const { tipo, estado } = this.developmentPlan[0];
    this.developmentPlanService.getAllByIdGroupStateType(id, tipo, estado).subscribe(data => {
      this.planDesarrolloCompleto = data;
      this.obtenerObjetivosEspecificos();
    });
  }

  obtenerObjetivosEspecificos(): void {
    this.objetivosEspecificos = this.planDesarrolloCompleto.panelControl.map(panel => ({
      panelControl: panel,
      objetivoEspecifico: panel.objetivoEspecífico
    }));
  }

  agregarAnualControl(): void {
    const seleccionado = this.myForm.get('idObjetivoEspecifico')?.value;  
    const dialogRef = this.dialog.open(ModalCuadroOp, {
      width: '600px',
      data: {
        panelControl: seleccionado.panelControl,
        objetivoEspecifico: seleccionado.objetivoEspecifico
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nuevoControl = this.crearAnualControl();
        nuevoControl.patchValue(result);
        this.anualControles.push(nuevoControl);
      }
      console.log(this.anualControles);
    });
  }

  get anualControles(): FormArray<FormGroup> {
    return this.myForm.get('anualControles') as FormArray<FormGroup>;
  }
  

  crearAnualControl(): FormGroup {
    return this.fb.group({
      idPlanAnual: [null, ],
            idPanelControl: [null, Validators.required],
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
  }

  HandleSubmit(): void {
    this.isLoading = true;
    this.annualOperativePlanService.createForm(this.myForm.value).subscribe(
      (response) => {
        this.isLoading = false;
        this.matSnackBar.open('Se ha creado el plan de actividades.', 'Cerrar', {
          duration: 3000,
        });
        this.guardarControlAnual(response);
      },
      (error) => {
        this.isLoading = false;
        console.error('Error al crear el plan de actividades:', error);
        this.matSnackBar.open('Error al crear el plan de actividades.', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }
  guardarControlAnual(idPlanAnual: number) {
    const controlesAnuales = this.anualControles.value;
    if (controlesAnuales && controlesAnuales.length > 0) {
      controlesAnuales.forEach((control) => {
        const controlAnual: AnualControl = {
          idPlanAnual: idPlanAnual,
          idPanelControl: control.idPanelControl,
          idOds: control.idOds,
          idEstrategia: control.idEstrategia,
          objetivoAnual: control.objetivoAnual,
          producto: control.producto,
          financiamiento: control.financiamiento,
          monto: control.monto,
          presupuesto: control.presupuesto,
          periodicidad: control.periodicidad,
          fechaInicio: control.fechaInicio,
          fechaFin: control.fechaFin,
          mediosVerificacion: control.mediosVerificacion,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.anualControlService.create(controlAnual).subscribe(
          (response) => {
            console.log('Control Anual creado correctamente:', response);
            this.actualizarProcesoGrupo();
          },
          (error) => {
            console.error('Error al crear el control anual:', error);
          }
        );
      });
    } else {
      console.error('No se han creado controles anuales.');
    }
  }
  actualizarProcesoGrupo(){
    this.invGroupService.getById(this.groupId).subscribe(data => {
      const invGroup: InvGroupForm = {
        idGrupoInv: this.groupId,
        idCoordinador: data.idCoordinador,
        nombreGrupoInv: data.nombreGrupoInv,
        estadoGrupoInv: data.estadoGrupoInv,
        proceso: '14',
        acronimoGrupoinv: data.acronimoGrupoinv,
        usuarioCreacion: data.usuarioCreacion,
        fechaCreacion: data.fechaCreacion,
        usuarioModificacion: this.currentUser,
        fechaModificacion: this.currentDate
      }
      this.invGroupService.update(this.groupId, invGroup).subscribe(
        () => {
          console.log('Proceso del grupo actualizado correctamente.');
          this.ruta('main/dashboard');
        });
    })
  }

  ruta(path: string) {
    this.router.navigate([path]);    
  }
  eliminarControl(index: number): void {
    this.anualControles.removeAt(index);
  }
  
  editarControl(index: number): void {
    const control = this.anualControles.at(index);
    const dialogRef = this.dialog.open(ModalCuadroOp, {
      width: '600px',
      //data: control.value
      data: {
        panelControl: control.value.panelControl,
        objetivoEspecifico: control.value.objetivoEspecifico
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        control.patchValue(result);
      }
    });
  }
  
}
