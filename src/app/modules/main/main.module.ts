import { importProvidersFrom, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './pages/main/main.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ChecklistFormComponent } from './pages/checklist/checklist-reg.component';
//import { DevelopmentPlanFormComponent } from './pages/develop-plan-form/develop-plan-form.component';
import { TarjetasComponent } from './pages/administracion/tarjets.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { VinculacionFormComponent } from './pages/coordinadorGI/vinculacion-desvinculacion/vinculacion/vinculacion-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { DesvinculacionFormComponent } from './pages/coordinadorGI/vinculacion-desvinculacion/desvinculacion/desvinculacion.component';
import { DominioAcademico } from './pages/administracion/dominios-academicos/dom-acad.component';
import { OdsComponent } from './pages/administracion/ods/ods.component';
//import { ControlPanelFormComponent } from './pages/control-panel/control-panel-form.component';

import { InstStrategicObjComponent } from './pages/administracion/inst-strategic-obj/inst-strategic-obj.component';
import { ModalInstStrategicObjControl } from './pages/administracion/inst-strategic-obj/modal-inst-strategic-obj.component';
import { StrategiesComponent } from './pages/administracion/strategies/strategies.component';
import { ModalStrategiesControl } from './pages/administracion/strategies/modal-strategies.component';

import { LineComponent } from './pages/administracion/line/line.component';

import { AreaComponent } from './pages/administracion/area/area.component';

import { UpperPlanComponent } from './pages/administracion/upper-plan/upper-plan.component';
import { NationalPlanComponent } from './pages/administracion/national-plan/national-plan.component';
import { LegalFrameworkComponent } from './pages/administracion/legal-framework/legal-framework.component';
import { DashboardCoordinadorComponent } from './pages/coordinadorGI/dashboard/dashboard.component';
import { EjecucionComponent } from './pages/ejecucion/ejecucion.component';
import { TarjetSeguimientoComponent } from './pages/coordinadorGI/seguimiento/seguimiento.component';
import { CargaBaremoComponent } from './pages/coordinadorGI/seguimiento/baremo/baremo.component';
import { ReportesProdArticulosComponent } from './pages/reportes-prod-articulos/reportes-prod-articulos.component';
import { SolicitudesComponent } from './pages/coordinador-inv/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitud } from './pages/coordinador-inv/solicitudes-de-creacion/mostrarSolicitud.component';
import { ReportMenuComponent } from './pages/reportes/report-menu.component';
import { ScientificProductionGroupsComponent } from './pages/reportes/scientific-production-groups/scientific-production-groups.component';
import { NgxChartsModule } from '@swimlane/ngx-charts'
import { AllInvGroupCDComponent } from './pages/reportes/all-inv-group-cd/all-inv-group-cd.component';
import { ReporteActividadesComponent } from './pages/reporte-actividades/reporte-actividades.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MembersGroup } from './pages/creation-form/creation-form/membersGroup.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SolicitudesForDirectorComponent } from './pages/directorDepartamento/faseCreacionGI/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForDirector } from './pages/directorDepartamento/faseCreacionGI/solicitudes-de-creacion/mostrarSolicitud.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CargaMemoDirComponent } from './pages/directorDepartamento/faseCreacionGI/memorandosSolicitudCreacion/memorando.component';
import { GestionRolesComponent } from './pages/administracion/gestion-roles/gestion-crea/gestion-roles.component';
import { GestionMenuComponent } from './pages/administracion/gestion-roles/gestion-menu.component';
import { ModalUpperPlanControl } from './pages/administracion/upper-plan/modal-upper-plan.component';
import { GestionRolesPrincipalComponent } from './pages/administracion/gestion-roles/gestion-crea/gestion-roles-principal.component';
import { AgregarObjetivosComponent } from './pages/reporte-actividades/objetivosModal/agregar-objetivos.component';
import { EditarObjetivosComponent } from './pages/reporte-actividades/objetivosModal/editar-objetivos.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AgregarEventosComponent } from './pages/reporte-actividades/eventos-modal/agregar-eventos.component';
import { EditarEventosComponent } from './pages/reporte-actividades/eventos-modal/editar-eventos.component';
import { AgregarProyectosComponent } from './pages/reporte-actividades/proyectos-modal/agregar-proyectos.component';
import { EditarProyectosComponent } from './pages/reporte-actividades/proyectos-modal/editar-proyectos.component';
import { EditarPosgradoComponent } from './pages/reporte-actividades/posgrado-modal/editar-posgrado.component';
import { AgregarPosgradoComponent } from './pages/reporte-actividades/posgrado-modal/agregar-posgrado.component';
import { AgregarTitulacionComponent } from './pages/reporte-actividades/titulacion-modal/agregar-titulacion.component';
import { EditarTitulacionComponent } from './pages/reporte-actividades/titulacion-modal/editar-titulacion.component';
import { AgregarLibrosComponent } from './pages/reporte-actividades/capitulos-libros-modal/agregar-libros.component';
import { EditarLibrosComponent } from './pages/reporte-actividades/capitulos-libros-modal/editar-libros.component';
import { AgregarRevistaComponent } from './pages/reporte-actividades/revistas-modal/agregar-revistas.component';
import { EditarRevistaComponent } from './pages/reporte-actividades/revistas-modal/editar-revistas.component';
import { AgregarCongresoComponent } from './pages/reporte-actividades/congresos-modal/agregar-congreso.component';
import { EditarCongresoComponent } from './pages/reporte-actividades/congresos-modal/editar-congreso.component';
import { AgregarEjecucionComponent } from './pages/reporte-actividades/ejecucion-presupuestaria-modal/agregar-ejecucion.component';
import { EditarEjecucionComponent } from './pages/reporte-actividades/ejecucion-presupuestaria-modal/editar-ejecucion.component';
import { SolicitudesForVicerectorComponent } from './pages/vicerectorDeInvestigacion/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForVicerector } from './pages/vicerectorDeInvestigacion/solicitudes-de-creacion/mostrarSolicitud.component';
import { SolicitudesForAnalistaComponent } from './pages/analistaGestion/fase-creacion/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForAnalista } from './pages/analistaGestion/fase-creacion/solicitudes-de-creacion/mostrarSolicitud.component';
import { FichaFormComponent } from './pages/analistaGestion/FichaDeRegistro/ficha.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Avances } from './pages/analistaGestion/FichaDeRegistro/registroAvances.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
import { VerReportesComponent } from './pages/reporte-actividades/ver-reportes/ver-reportes.component';
import { DevelopmentPlanFormComponent } from './pages/coordinadorGI/faseCreacion/plan_desarrollo/development-plan';
import { PropuestaGIComponent } from './pages/coordinadorGI/faseCreacion/memorando/creation_proposal';
import { InformeDePertinenciaComponent } from './pages/coordinadorGI/Informe_Pertinencia/relevance_report';
import { ResolucionConsejoComponent } from './pages/directorDepartamento/faseCreacionGI/resolucionConsejo/resolucionConsejo.component';
import { SolicitudesForVicerectorIComponent } from './pages/vicerectorDeInvestigacion/resoluciones copy/solicitudes-de-creacion/obtenerSolicitudes.component';
import { MostrarSolicitudForVicerectorI } from './pages/vicerectorDeInvestigacion/resoluciones copy/solicitudes-de-creacion/mostrarSolicitud.component';
import { CargaMemoVicIComponent } from './pages/vicerectorDeInvestigacion/resoluciones copy/memorandosSolicitudCreacion/memorando.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatGridTile } from '@angular/material/grid-list';
import { AcademicDomainsControl } from './pages/administracion/dominios-academicos/modal_academic_domain.component';
import { AreaControl } from './pages/administracion/area/modal_area.component';
import { LineaControl } from './pages/administracion/line/modal_line.component';
import { LegalFrameworkControl } from './pages/administracion/legal-framework/modal_legal_framework.component';
import { ModalNationalControl } from './pages/administracion/national-plan/modal-national-plan.component';
import { ExternMembersGroup } from './pages/creation-form/creation-form/externMemberForm.component';
import { InfPertinenciaComponent } from './pages/coordinador-inv/informePertinencia/infPertinencia.component';
import { infBienesEquiposComponent } from './pages/coordinadorGI/informeBienesEquipos/infBienesEquipos.component';
import { OdsControl } from './pages/administracion/ods/modal_ods.component';
import { ObjControl } from './pages/coordinadorGI/faseCreacion/plan_desarrollo/modal_objetivos.component';
import { ActControl } from './pages/coordinadorGI/faseCreacion/plan_desarrollo/modal_cuadro_actividades.component';
import { ProgressComponent } from 'src/@vex/components/progress/progress.component';
import { CreationRequestFormComponent } from 'src/@vex/components/forms/creationRequest/creationRequestForm.component';
import { DevelopPlanFormComponent } from 'src/@vex/components/forms/developmentPlanForm/developmentPlanForm.component';
import { CvComponent } from 'src/@vex/components/forms/cv/cv.component';
import { InformePertinenciaComponent } from 'src/@vex/components/forms/relevanceReport/relevanceReport.component';
import { MostrarSolicitudForDirector2 } from './pages/directorDepartamento/faseCreacionGI/solicitudes-de-creacion/mostrarSolicitud2.component';
import { GruposControlComponent } from './pages/administracion/grupos-investigacion/grupos-investigacion.component';
import { DetalleGIComponent } from './pages/administracion/grupos-investigacion/detalle-gi.component';
import { CrearGIComponent } from './pages/administracion/grupos-investigacion/crearGI.component';
import { LineModalEdit } from './pages/administracion/grupos-investigacion/modales_gestion/lineModal.component';
import { MembersModalEdit } from './pages/administracion/grupos-investigacion/modales_gestion/membersModal.component';
import { GroupModalEdit } from './pages/administracion/grupos-investigacion/modales_gestion/groupModal.component';
import { AnnualPlanComponent } from './pages/coordinadorGI/seguimiento/PlanAnual/planAnual.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SeleccionRolDialogComponent } from './pages/creation-form/SeleccionRolDialogComponent';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SolCreacionComponent } from './pages/coordinadorGI/faseCreacion/sol-creacion/sol-creacion.component';
import { ReportesGIComponent } from './pages/administracion/grupos-investigacion/reportes-gi/reportes-gi.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MemorandoCreacionVITTComponent } from './pages/directorDepartamento/faseCreacionGI/memorando-creacion-vitt/memorando-creacion-vitt.component';
import { MemorandoOchoComponent } from './pages/analistaGestion/fase-creacion/solicitudes-de-creacion/memorando-ocho/memorando-ocho.component';
import { SolicitudesFaseNueveComponent } from './pages/comite-investigacion/fase-creacion/solicitudes-fase-nueve/solicitudes-fase-nueve.component';
import { MostrarGrupoFaseNueveComponent } from './pages/comite-investigacion/fase-creacion/mostrar-grupo-fase-nueve/mostrar-grupo-fase-nueve.component';
import { MemorandoNueveComponent } from './pages/comite-investigacion/fase-creacion/memorando-nueve/memorando-nueve.component';
import { SolicitudGruposFaseDiezComponent } from './pages/analistaGestion/fase-creacion/solicitudes-resolucion/solicitud-grupos-fase-diez/solicitud-grupos-fase-diez.component';
import { GruposAprobadosComponent } from './pages/analistaGestion/fase-creacion/solicitudes-resolucion/grupos-aprobados/grupos-aprobados.component';
import { MemorandoDiezComponent } from './pages/analistaGestion/fase-creacion/solicitudes-resolucion/memorando-diez/memorando-diez.component';
import { SolicitudesParaResolucionComponent } from './pages/analistaGestion/fase-creacion/Solicitudes-para-resolucion/solicitudes-para-resolucion/solicitudes-para-resolucion.component';
import { GruposParaResolucionComponent } from './pages/analistaGestion/fase-creacion/Solicitudes-para-resolucion/grupos-para-resolucion/grupos-para-resolucion.component';
import { MemorandoDoceComponent } from './pages/analistaGestion/fase-creacion/Solicitudes-para-resolucion/memorando-doce/memorando-doce.component';
import { SolicitudPlanesComponent } from './pages/unidad-gestion-inv/faseSeguimiento/memorando-sol-planes/solicitud-planes.component';
import { MemorandoSolPlanesComponent } from './pages/unidad-gestion-inv/faseSeguimiento/memorando-sol-planes/memorando-sol-planes.component';
import { SolicitudInformesComponent } from './pages/unidad-gestion-inv/solicitud-informes/solicitud-informes.component';
import { MemorandoSolInformesComponent } from './pages/unidad-gestion-inv/solicitud-informes/memorando-sol-informes/memorando-sol-informes.component';
import { SelectCoordinadorGroup } from './pages/administracion/grupos-investigacion/modales_gestion/selectCoordinador.component';
import { FaseCierreComponent } from './pages/unidad-gestion-inv/fase-cierre/fase-cierre.component';
import { EvaluacionesModalComponent } from './pages/unidad-gestion-inv/fase-cierre/evaluaciones-modal/evaluaciones-modal.component';
import { SolicitudesModalComponent } from './pages/unidad-gestion-inv/fase-cierre/solicitudes-modal/solicitudes-modal.component';
import { EditarEvaluacionCierreComponent } from './pages/unidad-gestion-inv/fase-cierre/evaluaciones-modal/editar-evaluacionCierre.component';
import { EditarSolicitudCierreComponent } from './pages/unidad-gestion-inv/fase-cierre/solicitudes-modal/editar-solicitudCierre.component';
import { VerInformeCierreComponent } from './pages/unidad-gestion-inv/fase-cierre/ver-informe-cierre/ver-informe-cierre.component';
import { AnexosFaseCierreComponent } from './pages/unidad-gestion-inv/fase-cierre/anexos-fase-cierre/anexos-fase-cierre.component';
import { ModalCuadroOp } from './pages/coordinadorGI/seguimiento/PlanAnual/modalCuadro.component';
import { VistaPlanAnualComponent } from './pages/coordinadorGI/vista-plan-anual/vista-plan-anual.component';
import { SolicitudesComponent30 } from './pages/unidad-gestion-inv/fase-cierre/grupos/obtenerSolicitudes.component';
import { MostrarSolicitud30 } from './pages/unidad-gestion-inv/fase-cierre/grupos/mostrarSolicitud.component';
import { InformeCierreComponent } from 'src/@vex/components/forms/closedGroupReport/closeReport.component';
import { SolicitudesComponent31 } from './pages/analistaGestion/FaseCierre/obtenerSolicitudes.component';
import { MostrarSolicitud31 } from './pages/analistaGestion/FaseCierre/mostrarSolicitud.component';
import { Memorando31Component } from './pages/analistaGestion/FaseCierre/memorando-31/memorando-31.component';
import { DetalleEquiposComponent } from './pages/coordinadorGI/informeBienesEquipos/modalBienesEquipos/modalDetalles.component';
import { Solicitudes36Component } from './pages/unidad-gestion-inv/fase-cierre/proceso36/obtenerSolicitudes.component';
import { MostrarSolicitud36 } from './pages/unidad-gestion-inv/fase-cierre/proceso36/mostrarSolicitud.component';
import { Memorando32Component } from './pages/consejoAcademico/FaseCierre/memorando32/memorando32.component';
import { SolicitudesComponent32 } from './pages/consejoAcademico/FaseCierre/obtenerSolicitudes.component';
import { Memorando33Component } from './pages/vicerectorDeInvestigacion/FaseCierre/memorando33/memorando33.component';
import { SolicitudesComponent33 } from './pages/vicerectorDeInvestigacion/FaseCierre/obtenerSolicitudes.component';
import { Memorando34Component } from './pages/utic/memorando34/memorando34.component';
import { SolicitudesComponent34 } from './pages/utic/obtenerSolicitudes.component';
import { MostrarSolicitud32 } from './pages/consejoAcademico/FaseCierre/mostrarSolicitud.component';
import { MostrarSolicitud33 } from './pages/vicerectorDeInvestigacion/FaseCierre/mostrarSolicitud.component';
import { MostrarSolicitud34 } from './pages/utic/mostrarSolicitud.component';
import { ReporteBienesComponent } from 'src/@vex/components/forms/assetsReport/assetsReport.component';
import{Memorando36Component} from './pages/unidad-gestion-inv/fase-cierre/proceso36/memorando36/memorando36.component';
import { LinkFormComponent } from 'src/@vex/components/forms/linkForm/linkForm.component';
import { MostrarSolicitud39 } from './pages/unidad-gestion-inv/fase-vinculacion/mostrarSolicitud.component';
import { SolicitudesComponent39 } from './pages/unidad-gestion-inv/fase-vinculacion/obtenerSolicitudes.component';
import { Modal_ObjEspecifico } from './pages/coordinadorGI/faseCreacion/plan_desarrollo/modal_specificObj.component';
import { CvCoordUpdate } from './pages/administracion/grupos-investigacion/modales_gestion/CvCoordUpdate.component';
@NgModule({
  declarations: [
    SolicitudesComponent30,
    MostrarSolicitud39,
    SolicitudesComponent39,
    LinkFormComponent,
    Memorando36Component,
    Solicitudes36Component,
    MostrarSolicitud36,
    ReporteBienesComponent,
    MostrarSolicitud31,
    InformeCierreComponent,
    MostrarSolicitud30,
    SeleccionRolDialogComponent,
    ProgressComponent,
    GroupModalEdit,
    MembersModalEdit,
    LineModalEdit,
    CrearGIComponent,
    DetalleGIComponent,
    GruposControlComponent,
    MostrarSolicitudForDirector2,
    InformePertinenciaComponent,
    CvComponent,
    DevelopPlanFormComponent,
    CreationRequestFormComponent,
    MainComponent,
    ActControl,
    ObjControl,
    OdsControl,
    OdsComponent,
    ExternMembersGroup,
    SelectCoordinadorGroup,
    ModalNationalControl,
    ModalUpperPlanControl,
    LegalFrameworkControl,
    LineaControl,
    ChecklistFormComponent,
    DevelopmentPlanFormComponent,
    TarjetasComponent,
    DominioAcademico,
    EjecucionComponent,
    LineComponent,
    AreaComponent,
    UpperPlanComponent,
    NationalPlanComponent,
    LegalFrameworkComponent,
    DashboardCoordinadorComponent,
    TarjetSeguimientoComponent,
    CargaBaremoComponent,
    SolicitudesComponent,
    MostrarSolicitud,
    ReportMenuComponent,
    AllInvGroupCDComponent,
    ScientificProductionGroupsComponent,
    CargaBaremoComponent,
    ReportesProdArticulosComponent,
    VinculacionFormComponent,
    DesvinculacionFormComponent,
    ReporteActividadesComponent,
    MembersGroup, MostrarSolicitudForDirector,
    SolicitudesForDirectorComponent, CargaMemoDirComponent,
    GestionRolesComponent,
    GestionMenuComponent,
    GestionRolesPrincipalComponent,
    AgregarObjetivosComponent,
    EditarObjetivosComponent,
    AgregarEventosComponent,
    EditarEventosComponent,
    AgregarProyectosComponent,
    EditarProyectosComponent,
    AgregarPosgradoComponent,
    EditarPosgradoComponent,
    AgregarTitulacionComponent,
    EditarTitulacionComponent,
    AgregarLibrosComponent,
    EditarLibrosComponent,
    AgregarRevistaComponent,
    EditarRevistaComponent,
    AgregarCongresoComponent,
    EditarCongresoComponent,
    AgregarEjecucionComponent,
    EditarEjecucionComponent,
    MostrarSolicitudForVicerector,
    SolicitudesForVicerectorComponent, SolicitudesForAnalistaComponent,
    MostrarSolicitudForAnalista,
    FichaFormComponent, Avances
    , CargaMemoVicComponent,
    SolicitudesForComisionComponent,
    MostrarSolicitudForComision,
    CargaMemoComComponent,
    SolicitudesForConsejoComponent, MostrarSolicitudForConsejo,
    CargaMemoConsejoComponent,
    SolicitudesForVicerectorAComponent,
    CargaMemoVicAComponent,
    MostrarSolicitudForVicerectorA,
    CargaSolComComponent,
    GruposForAnalistaComponent, CargaSolDirComponent,
    GruposForDirectorComponent,

    VinculacionForCoor,
    VinculacionForCorComponent,
    VinculacionForVicComponent,
    VinculacionForDirComponent,
    VinculacionForVic,
    ActaVicComponent,
    VinculacionForTec,
    VinculacionForTecComponent,
    ActaTecComponent,
    ActualizacionForVic,
    ActualizacionForVicComponent,
    MemoActualizacionVicComponent,
    ActualizacionAnaVic,
    ActualizacionForAnaComponent,
    ActivityReportsForCorComponent,
    VerReportesComponent,
    PropuestaGIComponent,
    InformeDePertinenciaComponent,
    ResolucionConsejoComponent,
    SolicitudesForVicerectorIComponent,
    MostrarSolicitudForVicerectorI,
    CargaMemoVicIComponent, AcademicDomainsControl,
    AreaControl,
    InstStrategicObjComponent,
    ModalInstStrategicObjControl,
    StrategiesComponent,
    ModalStrategiesControl,
    InfPertinenciaComponent,
    infBienesEquiposComponent,
    AnnualPlanComponent,
    SolCreacionComponent,
    ReportesGIComponent,
    ConfirmDialogComponent,
    MemorandoCreacionVITTComponent,
    MemorandoOchoComponent,
    SolicitudesFaseNueveComponent,
    MostrarGrupoFaseNueveComponent,
    MemorandoNueveComponent,
    SolicitudGruposFaseDiezComponent,
    GruposAprobadosComponent,
    MemorandoDiezComponent,
    SolicitudesParaResolucionComponent,
    GruposParaResolucionComponent,
    MemorandoDoceComponent,
    SolicitudPlanesComponent,
    MemorandoSolPlanesComponent,
    SolicitudInformesComponent,
    MemorandoSolInformesComponent,
    FaseCierreComponent,
    EvaluacionesModalComponent,
    SolicitudesModalComponent,
    EditarEvaluacionCierreComponent,
    EditarSolicitudCierreComponent,
    VerInformeCierreComponent,
    AnexosFaseCierreComponent,
    ModalCuadroOp,
    VistaPlanAnualComponent,
    SolicitudesComponent31,
    Memorando31Component,
    DetalleEquiposComponent,
    Memorando32Component,
    SolicitudesComponent32,
    Memorando33Component,
    SolicitudesComponent33,
    Memorando34Component,
    SolicitudesComponent34,
    MostrarSolicitud32,
    MostrarSolicitud33,
    MostrarSolicitud34,
    Modal_ObjEspecifico,
    CvCoordUpdate

  ],
  imports: [
    MatButtonToggleModule,

    CommonModule,
    MainRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CdkStepperModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    NgxChartsModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSnackBarModule, MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatGridListModule,
    MatTooltipModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  exports: [CdkStepperModule],
  providers: [],
  entryComponents: [ConfirmDialogComponent] // Asegura que se pueda abrir dinámicamente

})
export class MainModule { }
