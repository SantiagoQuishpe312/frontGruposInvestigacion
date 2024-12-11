import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { DegreeComponent } from './pages/degree/degree.component';
import { UserRolListComponent } from './pages/rol/rol.component';
import { ChecklistFormComponent } from './pages/checklist/checklist-reg.component';
//import { DevelopmentPlanFormComponent } from './pages/develop-plan-form/develop-plan-form.component';
import { TarjetasComponent } from './pages/administracion/tarjets.component';
import { VinculacionFormComponent } from './pages/coordinadorGI/vinculacion-desvinculacion/vinculacion/vinculacion-form.component';
import { DesvinculacionFormComponent } from './pages/coordinadorGI/vinculacion-desvinculacion/desvinculacion/desvinculacion.component';
import { DominioAcademico } from './pages/administracion/dominios-academicos/dom-acad.component';

import { LineComponent } from './pages/administracion/line/line.component';

import { AreaComponent } from './pages/administracion/area/area.component';

import { UpperPlanComponent } from './pages/administracion/upper-plan/upper-plan.component';

import { NationalPlanComponent } from './pages/administracion/national-plan/national-plan.component';

import { LegalFrameworkComponent } from './pages/administracion/legal-framework/legal-framework.component';

import { OdsComponent } from './pages/administracion/ods/ods.component';
import { CreationFormComponent } from './pages/creation-form/creation-form/creation-form.component';
import { EjecucionComponent } from './pages/ejecucion/ejecucion.component';
import { TarjetSeguimientoComponent } from './pages/coordinadorGI/seguimiento/seguimiento.component';
import { CargaBaremoComponent } from './pages/coordinadorGI/seguimiento/baremo/baremo.component';
import { ReportesProdArticulosComponent } from './pages/reportes-prod-articulos/reportes-prod-articulos.component';
import { SolicitudesComponent } from './pages/coordinador-inv/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitud } from './pages/coordinador-inv/solicitudes-de-creacion/mostrarSolicitud.component';
import { ReportMenuComponent } from './pages/reportes/report-menu.component';
import { AllInvGroupCDComponent } from './pages/reportes/all-inv-group-cd/all-inv-group-cd.component';
import { ScientificProductionGroupsComponent } from './pages/reportes/scientific-production-groups/scientific-production-groups.component';
import { ReporteActividadesComponent } from './pages/reporte-actividades/reporte-actividades.component';
import { SolicitudesForDirectorComponent } from './pages/directorDepartamento/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForDirector } from './pages/directorDepartamento/solicitudes-de-creacion/mostrarSolicitud.component';
import { CargaMemoDirComponent } from './pages/directorDepartamento/memorandosSolicitudCreacion/memorando.component';
import { GestionRolesComponent } from './pages/administracion/gestion-roles/gestion-crea/gestion-roles.component';
import { GestionMenuComponent } from './pages/administracion/gestion-roles/gestion-menu.component';

import { GestionRolesPrincipalComponent } from './pages/administracion/gestion-roles/gestion-crea/gestion-roles-principal.component';
import { SolicitudesForVicerectorComponent } from './pages/vicerectorDeInvestigacion/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForVicerector } from './pages/vicerectorDeInvestigacion/solicitudes-de-creacion/mostrarSolicitud.component';
import { SolicitudesForAnalistaComponent } from './pages/analistaGestion/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForAnalista } from './pages/analistaGestion/solicitudes-de-creacion/mostrarSolicitud.component';
import { FichaFormComponent } from './pages/analistaGestion/FichaDeRegistro/ficha.component';
import { CargaMemoVicComponent } from './pages/vicerectorDeInvestigacion/memorandosSolicitudCreacion/memorando.component';
import { SolicitudesForComisionComponent } from './pages/comisionDeTecnologia/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForComision } from './pages/comisionDeTecnologia/solicitudes-de-creacion/mostrarSolicitud.component';
import { CargaMemoComComponent } from './pages/comisionDeTecnologia/memorandosSolicitudCreacion/memorando.component';
import { SolicitudesForConsejoComponent } from './pages/consejoAcademico/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForConsejo } from './pages/consejoAcademico/solicitudes-de-creacion/mostrarSolicitud.component';
import { CargaMemoConsejoComponent } from './pages/consejoAcademico/memorandosSolicitudCreacion/memorando.component';
import { SolicitudesForVicerectorAComponent } from './pages/vicerectorDeInvestigacion/resoluciones/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForVicerectorA } from './pages/vicerectorDeInvestigacion/resoluciones/solicitudes-de-creacion/mostrarSolicitud.component';
import { CargaMemoVicAComponent } from './pages/vicerectorDeInvestigacion/resoluciones/memorandosSolicitudCreacion/memorando.component';
import { CargaSolComComponent } from './pages/analistaGestion/Seguimiento/Memorando/memorando.component';
import { GruposForAnalistaComponent } from './pages/analistaGestion/Seguimiento/ObtenerGrupos/obtenerSolicitudes.component';
import { CargaSolDirComponent } from './pages/directorDepartamento/Seguimiento/Memorando/memorando.component';
import { GruposForDirectorComponent } from './pages/directorDepartamento/Seguimiento/ObtenerGrupos/obtenerSolicitudes.component';
import { VinculacionForCoor } from './pages/coordinador-inv/vinculacion-proceso/obtenerSolicitudes/mostrarSolicitud.component';
import { VinculacionForCorComponent } from './pages/coordinador-inv/vinculacion-proceso/obtenerSolicitudes/obtenerSolicitudes.component';
import { VinculacionForVic } from './pages/vicerectorDeInvestigacion/vinculacion-desvinculacion/mostrarSolicitud.component';
import { VinculacionForVicComponent } from './pages/vicerectorDeInvestigacion/vinculacion-desvinculacion/obtenerSolicitudes.component';
import { VinculacionForDirComponent } from './pages/directorDepartamento/vinculacion-desvinculacion/obtenerSolicitudes.component';
import { ActaVicComponent } from './pages/vicerectorDeInvestigacion/vinculacion-desvinculacion/actas/memorando.component';
import { VinculacionForTecComponent } from './pages/comisionDeTecnologia/vinculacion-desvinculacion/obtenerSolicitudes.component';
import { VinculacionForTec } from './pages/comisionDeTecnologia/vinculacion-desvinculacion/mostrarSolicitud.component';
import { ActaTecComponent } from './pages/comisionDeTecnologia/vinculacion-desvinculacion/actas/memorando.component';
import { ActualizacionForVic } from './pages/vicerectorDeInvestigacion/actualizarGrupo/mostrarSolicitud.component';
import { ActualizacionForVicComponent } from './pages/vicerectorDeInvestigacion/actualizarGrupo/obtenerSolicitudes.component';
import { MemoActualizacionVicComponent } from './pages/vicerectorDeInvestigacion/actualizarGrupo/actas/memorando.component';
import { ActualizacionAnaVic } from './pages/analistaGestion/actualizarFicha/mostrarSolicitud.component';
import { ActualizacionForAnaComponent } from './pages/analistaGestion/actualizarFicha/obtenerSolicitudes.component';
import { ActivityReportsForCorComponent } from './pages/coordinador-inv/seguimiento/remisionDeInformacion/obtenerSolicitudes.component';
import { DevelopmentPlanFormComponent } from './pages/coordinadorGI/plan_desarrollo/development-plan';
import { VerReportesComponent } from './pages/reporte-actividades/ver-reportes/ver-reportes.component';
import { PropuestaGIComponent } from './pages/coordinadorGI/memorando/creation_proposal';
import { InformeDePertinenciaComponent } from './pages/coordinadorGI/Informe_Pertinencia/relevance_report';
import { MemoDirVIITComponent } from './pages/directorDepartamento/memorandosVIIT/memorando.component';
import { SolicitudesForVicerectorIComponent } from './pages/vicerectorDeInvestigacion/resoluciones copy/solicitudes-de-creacion/obtenerSolicitudes.component';
import { CargaMemoVicIComponent } from './pages/vicerectorDeInvestigacion/resoluciones copy/memorandosSolicitudCreacion/memorando.component';
import { MostrarSolicitudForVicerectorI } from './pages/vicerectorDeInvestigacion/resoluciones copy/solicitudes-de-creacion/mostrarSolicitud.component';
import { InstStrategicObjComponent } from './pages/administracion/inst-strategic-obj/inst-strategic-obj.component';
import { StrategiesComponent } from './pages/administracion/strategies/strategies.component';
import { InfPertinenciaComponent } from './pages/coordinador-inv/informePertinencia/infPertinencia.component';
import { MostrarSolicitudForDirector2 } from './pages/directorDepartamento/solicitudes-de-creacion/mostrarSolicitud2.component';
import { GruposControlComponent } from './pages/administracion/grupos-investigacion/grupos-investigacion.component';
import { DetalleGIComponent } from './pages/administracion/grupos-investigacion/detalle-gi.component';


const routes: Routes = [
  {
    path: 'principal',
    component: MainComponent
  }, {
    path: 'grupos-investigacion',
    component: GruposControlComponent
  }, { path: 'detalleGrupo', component: DetalleGIComponent }, {
    path: 'informePertinencia',
    component: InfPertinenciaComponent
  }, {
    path: 'solDir2',
    component: MostrarSolicitudForDirector2
  },
  {
    path: 'ods',
    component: OdsComponent
  },
  {
    path: 'rol',
    component: UserRolListComponent
  },
  {
    path: 'degree',
    component: DegreeComponent
  },



  {
    path: 'checklist',
    component: ChecklistFormComponent
  },
  {
    path: 'developPlan',
    component: DevelopmentPlanFormComponent
  },
  {
    path: 'admin',
    component: TarjetasComponent
  },
  {
    path: 'vinculacion-form',
    component: VinculacionFormComponent
  },
  {
    path: 'desvinculacion',
    component: DesvinculacionFormComponent
  },
  {
    path: 'acadDom',
    component: DominioAcademico

  },

  {
    path: 'line',
    component: LineComponent
  },

  {
    path: 'area',
    component: AreaComponent
  },

  {
    path: 'upper-plan',
    component: UpperPlanComponent
  },


  {
    path: 'national-plan',
    component: NationalPlanComponent
  },
  {
    path: 'coord2',
    component: SolicitudesForDirectorComponent
  }
  ,


  {
    path: 'legal',
    component: LegalFrameworkComponent
  }
  ,

  {
    path: 'remitirSolicitudes',
    component: MostrarSolicitudForDirector

  },

  {
    path: 'crea',
    component: CreationFormComponent
  },

  {
    path: 'ejecucion',
    component: EjecucionComponent
  }, {
    path: 'seguimiento',
    component: TarjetSeguimientoComponent
  },
  {
    path: 'baremo',
    component: CargaBaremoComponent
  },
  {
    path: 'solicitudes',
    component: SolicitudesComponent
  },
  {
    path: 'solicitudGI',
    component: MostrarSolicitud
  },
  {
    path: 'reportMenu',
    component: ReportMenuComponent
  }, {
    path: 'allGroups',
    component: AllInvGroupCDComponent
  },
  {
    path: 'cientificProduction',
    component: ScientificProductionGroupsComponent
  },
  {
    path: 'produccion-cientifica',
    component: ReportesProdArticulosComponent
  }
  ,
  {
    path: 'reporte-actividades',
    component: ReporteActividadesComponent
  }, {
    path: 'memo-solicitud',
    component: CargaMemoDirComponent
  }, {
    path: 'solicitud-dir',
    component: MostrarSolicitudForDirector
  },
  {
    path: 'memo-solicitud-v',
    component: CargaMemoVicComponent
  },
  {
    path: 'solicitud-vic',
    component: MostrarSolicitudForVicerector
  },
  {
    path: 'solicitud-com',
    component: MostrarSolicitudForComision
  },
  {
    path: 'memo-solicitud-t',
    component: CargaMemoComComponent
  }, {
    path: 'solicitudes-t',
    component: SolicitudesForComisionComponent

  }, {
    path: 'solicitud-con',
    component: MostrarSolicitudForConsejo

  },
  {
    path: 'solicitudes-A',
    component: SolicitudesForConsejoComponent
  },
  {
    path: 'memo-solicitud-A',
    component: CargaMemoConsejoComponent
  },
  {
    path: 'solicitud-Vic',
    component: MostrarSolicitudForVicerectorA

  },
  {
    path: 'solicitudes-V',
    component: SolicitudesForVicerectorAComponent
  },
  {
    path: 'solicitud-Inscripcion',
    component: SolicitudesForVicerectorIComponent
  },
  {
    path: 'inscripcionV',
    component: MostrarSolicitudForVicerectorI
  },
  {
    path: 'memo-registro',
    component: CargaMemoVicIComponent
  },
  {
    path: 'memo-solicitud-V',
    component: CargaMemoVicAComponent
  },
  {
    path: 'rol-gestion',
    component: GestionRolesComponent
  },
  {
    path: 'rol-menu',
    component: GestionMenuComponent
  },
  {
    path: 'rol-principal',
    component: GestionRolesPrincipalComponent
  },
  {
    path: 'solicitudesV',
    component: SolicitudesForVicerectorComponent
  },
  {
    path: 'validarSolicitud',
    component: MostrarSolicitudForVicerector,
  },
  {
    path: 'solicitudesA',
    component: SolicitudesForAnalistaComponent
  },
  {
    path: 'validarSolicitudA',
    component: MostrarSolicitudForAnalista
  },
  {
    path: 'ficha',
    component: FichaFormComponent
  },
  //seguimiento
  {
    path: 'sol-informe',
    component: CargaSolComComponent
  },
  {
    path: 'grupos-a',
    component: GruposForAnalistaComponent
  },
  {
    path: 'sol-informe-d',
    component: CargaSolDirComponent
  },
  {
    path: 'grupos-d',
    component: GruposForDirectorComponent
  },
  //procesos de vinculacion desvinculacion
  {
    path: 'sol-vinc-c',
    component: VinculacionForCorComponent
  },
  {
    path: 'solicitud-vin-c',
    component: VinculacionForCoor
  },
  {
    path: 'sol-vinc-d',
    component: VinculacionForDirComponent
  },
  {
    path: 'sol-vinc-v',
    component: VinculacionForVicComponent
  },
  {
    path: 'solicitud-vin-v',
    component: VinculacionForVic
  },
  {
    path: 'acta-v',
    component: ActaVicComponent
  },
  {
    path: 'sol-vinc-V',
    component: ActualizacionForVicComponent
  },
  {
    path: 'solicitud-vin-V',
    component: ActualizacionForVic
  },
  {
    path: 'acta-V',
    component: MemoActualizacionVicComponent
  },
  {
    path: 'acta-t',
    component: ActaTecComponent
  },
  {
    path: 'sol-vinc-t',
    component: VinculacionForTecComponent
  },
  {
    path: 'solicitud-vin-t',
    component: VinculacionForTec
  },
  {
    path: 'solicitud-vin-a',
    component: ActualizacionAnaVic
  },
  {
    path: 'sol-vinc-a',
    component: ActualizacionForAnaComponent
  },
  //reportes de Actividades
  {
    path: 'reports-c',
    component: ActivityReportsForCorComponent
  },
  {
    path: 'ver-reportes',
    component: VerReportesComponent
  }, {
    path: 'propuesta',
    component: PropuestaGIComponent
  },
  {
    path: 'infPertinencia',
    component: InformeDePertinenciaComponent
  },
  {
    path: 'memoDIR_VITT',
    component: MemoDirVIITComponent
  },
  {
    path: 'obj_institucionales',
    component: InstStrategicObjComponent
  },
  {
    path: 'strategiesInst',
    component: StrategiesComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
