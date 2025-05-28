import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { AnnualOperativePlanService } from 'src/app/core/http/annual-operative-plan/annual-operative-plan.service';
import { AnualControlService } from 'src/app/core/http/anual-control/anual-control.service';
import { ControlPanelService } from 'src/app/core/http/control-panel/control-panel.service';
import { DevelopmentPlanService } from 'src/app/core/http/develop-plan-form/develop-plan-form.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { SpecificObjetivesService } from 'src/app/core/http/specific-objetives/specific-objetives.service';
import { ControlPanelComplete } from 'src/app/types/controlPanel.types';
import { DevelopmentPlanComplete } from 'src/app/types/developPlanForm';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { StrategiesService } from 'src/app/core/http/strategies/strategies.service';
import { OdsService } from 'src/app/core/http/ods/ods.service';

@Component({
  selector: 'vex-vista-plan-anual',
  templateUrl: './vista-plan-anual.component.html',
  styleUrls: ['./vista-plan-anual.component.scss']
})
export class VistaPlanAnualComponent implements OnInit {

  idGrupo: number;
  annualPlans: any[];
  annualPlanId: number;
  developPlanId: number;
  planOp: any[];
  controlPanel: any[] = [];
  anualControl: any[] = [];
  anualControlComplete: any[] = [];
  controlPanelWithObjectives: any[] = [];
  developmentPlan: DevelopmentPlanComplete;
  usuarioNombreCache: { [key: number]: string } = {};
  objetivosEspecificosCache: { [key: number]: string } = {};
  odsCache: { [key: number]: any } = {};
  estrategiasCache: { [key: number]: any } = {};
  colorSemaforoPromedio: string = '';
  cumplimientoPromedio: number = 0;
  nombreGrupo: string = '';


  constructor(
    private annualPlanService: AnnualOperativePlanService,
    private datePipe: DatePipe,
    private invGroupService: InvGroupService,
    private controlPanelService: ControlPanelService,
    private anualControlService: AnualControlService,
    private specificObjectiveService: SpecificObjetivesService,
    private developmentPlanService: DevelopmentPlanService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private odsService: OdsService,
    private strategiesService: StrategiesService

  ) { }

  ngOnInit(): void {
    this.getUserIdAndLoadReports();
  }

  getName(id: number): Observable<string> {
    if (this.usuarioNombreCache[id]) {
      return of(this.usuarioNombreCache[id]);
    }

    return this.usuarioService.getById(id).pipe(
      map(usuario => {
        const nombre = usuario?.nombre || 'Usuario no encontrado';
        this.usuarioNombreCache[id] = nombre;
        return nombre;
      }),
      catchError(() => {
        const errorNombre = 'Usuario no encontrado';
        this.usuarioNombreCache[id] = errorNombre;
        return of(errorNombre);
      })
    );
  }

  getObjetivoEspecifico(id: number): string {
    if (!this.objetivosEspecificosCache[id]) {
      this.specificObjectiveService.getById(id).subscribe(
        objetivo => {
          this.objetivosEspecificosCache[id] = objetivo.objetivo;
          this.cdr.detectChanges();
        },
        () => {
          this.objetivosEspecificosCache[id] = 'Objetivo no encontrado';
          this.cdr.detectChanges();
        }
      );
      return 'Cargando...';
    }
    return this.objetivosEspecificosCache[id];
  }


  getODS(idODS: number): string {
    if (!this.odsCache[idODS]) {
      this.odsService.getById(idODS).subscribe({
        next: (ods) => {
          this.odsCache[idODS] = ods.descripcion || ods.ods;
          this.cdr.detectChanges();
        },
        error: () => {
          this.odsCache[idODS] = 'ODS no encontrado';
          this.cdr.detectChanges();
        }
      });
      return 'Cargando ODS...';
    }
    return this.odsCache[idODS];
  }

  getEstrategia(idEstrategia: number): string {
    if (!this.estrategiasCache[idEstrategia]) {
      this.strategiesService.getById(idEstrategia).subscribe({
        next: (estrategia) => {
          this.estrategiasCache[idEstrategia] = estrategia.estrategia;
          this.cdr.detectChanges();
        },
        error: () => {
          this.estrategiasCache[idEstrategia] = 'Estrategia no encontrada';
          this.cdr.detectChanges();
        }
      });
      return 'Cargando estrategia...';
    }
    return this.estrategiasCache[idEstrategia];
  }



  private preloadNombresUsuarios(): void {
    if (!this.controlPanel || this.controlPanel.length === 0) return;

    const uniqueUserIds = [...new Set(this.controlPanel.map(m => m.idResponsable))];
    uniqueUserIds.forEach(id => {
      if (!this.usuarioNombreCache[id]) {
        this.getName(id).subscribe();
      }
    });
  }

  private preloadObjetivosEspecificos(): void {
    if (!this.controlPanel || this.controlPanel.length === 0) return;

    const uniqueObjectiveIds = [...new Set(this.controlPanel.map(m => m.idObjetivoEspecifico))];
    uniqueObjectiveIds.forEach(id => {
      if (!this.objetivosEspecificosCache[id]) {
        this.specificObjectiveService.getById(id).subscribe(
          objetivo => {
            this.objetivosEspecificosCache[id] = objetivo.objetivo;
            this.cdr.detectChanges();
          },
          () => {
            this.objetivosEspecificosCache[id] = 'Objetivo no encontrado';
            this.cdr.detectChanges();
          }
        );
      }
    });
  }

  getUserIdAndLoadReports() {
    const userId = Number(sessionStorage.getItem('userId'));
    this.invGroupService.getAll().subscribe(groups => {
      const userGroup = groups.find(group => group.idCoordinador === userId);
      if (userGroup) {
        this.idGrupo = userGroup.idGrupoInv;
        this.nombreGrupo = userGroup.nombreGrupoInv;
        this.loadReportsForGroup();
      } else {
        console.log('No se encontró grupo para el usuario');
      }
    }, error => {
      console.error('Error al cargar grupos:', error);
    });
  }

  loadReportsForGroup() {
    this.annualPlanService.getAll().subscribe(plans => {
      this.annualPlans = plans.filter(plan => plan.idGrupoInvestigacion === this.idGrupo);
      if (this.annualPlans.length > 0) {
        this.annualPlanId = this.annualPlans[0].idAnnualOperativePlan;
        this.loadRelatedData();
      } else {
      }
    }, error => {
      console.error('Error al cargar planes anuales:', error);
    });
  }

  loadPlans() {
    this.annualPlanService.getAll().subscribe(plans => {
      const selectedPlan = plans.find(pln => pln.idAnnualOperativePlan === this.annualPlanId);
      this.planOp = selectedPlan ? [selectedPlan] : [];
    }, error => {
      console.error('Error al cargar planes:', error);
      this.planOp = [];
    });
  }

  loadRelatedData() {
    this.loadPlans();
    this.loadAnualControl();
    this.loadControlPanels();
  }

  loadControlPanels() {
    if (!this.annualPlanId) {
      return;
    }

    const currentAnnualPlan = this.annualPlans?.find(ap => ap.idAnnualOperativePlan === this.annualPlanId);

    if (!currentAnnualPlan) {
      return;
    }

    if (currentAnnualPlan.idPlanDesarrollo) {
      this.developPlanId = currentAnnualPlan.idPlanDesarrollo;
      this.loadControlPanelsByDevelopmentPlan();
    } else {
      this.developmentPlanService.getAll().subscribe(developmentPlans => {
        const relatedPlan = developmentPlans.find(dp => dp.idGrupoInv === this.idGrupo);
        if (relatedPlan) {
          this.developPlanId = relatedPlan.idPlanDesarrollo;
          this.loadControlPanelsByDevelopmentPlan();
        } else {
        }
      }, error => {
        console.error('Error al cargar planes de desarrollo:', error);
      });
    }
  }

  private loadControlPanelsByDevelopmentPlan() {
    this.controlPanelService.getByPlan(this.developPlanId).subscribe(panels => {
      console.log('Paneles de control cargados:', panels);
      this.controlPanel = panels || [];
      this.preloadNombresUsuarios();
      this.preloadObjetivosEspecificos();

      this.cdr.detectChanges();
    }, error => {
      console.error('Error al cargar paneles de control:', error);
      this.controlPanel = [];
    });
  }

  loadAnualControl() {
    if (!this.annualPlanId) {
      console.error('annualPlanId es nulo o undefined');
      return;
    }

    this.anualControlService.getByIdPlan(this.annualPlanId).subscribe({
      next: (anualControlData) => {
        if (Array.isArray(anualControlData) && anualControlData.length === 0) {
          console.warn('⚠️ EL SERVICIO DEVUELVE ARRAY VACÍO');
        }

        this.anualControl = anualControlData || [];
        this.anualControlComplete = anualControlData || [];
        this.calcularSemaforizacionPromedio();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ ERROR en la llamada HTTP:', error);
        this.anualControl = [];
        this.anualControlComplete = [];
      }
    });
  }

  private enrichAnualControlData(anualControlData: any[]) {
    this.anualControlComplete = anualControlData.map(control => {
      return {
        control: control,
        ods: null, 
        estrategias: null, 
        controlPanel: null 
      };
    });
  }

  onChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.annualPlanId = parseInt(id);
    this.planOp = [];
    this.controlPanel = []; 
    this.anualControl = []; 
    this.anualControlComplete = [];
    this.loadRelatedData();
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'N/A';
  }

  formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getPercentage(value: number): string {
    if (!value && value !== 0) return 'N/A';
    return `${value}%`;
  }

  getControlStats() {
    if (!this.anualControlComplete || this.anualControlComplete.length === 0) {
      return {
        total: 0,
        totalMonto: 0,
        promedioAcumulamiento: 0,
        completados: 0,
        enProceso: 0,
        pendientes: 0
      };
    }

    const total = this.anualControlComplete.length;
    const totalMonto = this.anualControlComplete.reduce((sum, control) => {
      return sum + (control.control?.monto || control.monto || 0);
    }, 0);

    const controles = this.anualControlComplete.map(c => c.control?.cumplimiento || c.cumplimiento || 0);
    const promedioAcumulamiento = controles.reduce((sum, cum) => sum + cum, 0) / total;

    const completados = controles.filter(c => c >= 100).length;
    const enProceso = controles.filter(c => c >= 1 && c < 100).length;
    const pendientes = controles.filter(c => c === 0).length;

    return {
      total,
      totalMonto,
      promedioAcumulamiento,
      completados,
      enProceso,
      pendientes
    };
  }

  getCumplimientoColor(cumplimiento: number): string {
    if (cumplimiento >= 80) return '#28a745'; 
    if (cumplimiento >= 50) return '#ffc107'; 
    if (cumplimiento >= 1) return '#fd7e14';  
    return '#dc3545';
  }

  getCumplimientoStatus(cumplimiento: number): string {
    if (cumplimiento >= 100) return 'Completado';
    if (cumplimiento >= 80) return 'Casi Completo';
    if (cumplimiento >= 50) return 'En Progreso';
    if (cumplimiento >= 1) return 'Iniciado';
    return 'Pendiente';
  }


  calcularSemaforizacionPromedio(): void {
    if (!this.anualControlComplete || this.anualControlComplete.length === 0) {
      this.cumplimientoPromedio = 0;
      this.colorSemaforoPromedio = '';
      return;
    }

    const total = this.anualControlComplete.length;
    const suma = this.anualControlComplete.reduce((acc, control) => {
      return acc + (control.control?.cumplimiento || control.cumplimiento || 0);
    }, 0);

    this.cumplimientoPromedio = Number((suma / total).toFixed(2));

    if (this.cumplimientoPromedio < 70) {
      this.colorSemaforoPromedio = 'rojo';
    } else if (this.cumplimientoPromedio >= 70 && this.cumplimientoPromedio <= 90) {
      this.colorSemaforoPromedio = 'amarillo';
    } else {
      this.colorSemaforoPromedio = 'verde';
    }
  }
}