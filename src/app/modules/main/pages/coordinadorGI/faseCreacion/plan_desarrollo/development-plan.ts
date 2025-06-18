import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpperLevelPlanService } from 'src/app/core/http/upperLevel-plan/upper-level-plan.service';
import { LegalFrameworkService } from 'src/app/core/http/legal-framework/legalFramework.service';
import { NationalPlanService } from 'src/app/core/http/national-plan/national-plan.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { DeveLegaService } from 'src/app/core/http/deve-lega/deve-lega.service';
import { DeveNationalService } from 'src/app/core/http/deve-national/deve-national.service';
import { DeveUppeService } from 'src/app/core/http/deve-uppe/deve-uppe.service';
import { DevelopmentPlanService } from 'src/app/core/http/develop-plan-form/develop-plan-form.service';
import { DevelopmentPlanForms } from 'src/app/types/developPlanForm';
import { DatePipe } from '@angular/common';
import { DeveNati } from 'src/app/types/deveNati.types';
import { DeveUppe } from 'src/app/types/deveUppe.types';
import { DeveLegaForm } from 'src/app/types/deveLega.types';
import { ObjectivesService } from 'src/app/core/http/objectives/objectives.service';
import { StrategiesService } from 'src/app/core/http/strategies/strategies.service';
import { ControlPanelService } from 'src/app/core/http/control-panel/control-panel.service';
import { ObjStrategiesComplete, Strategies } from 'src/app/types/strategies.types';
import { ControlPanelComplete, ControlPanelForm } from 'src/app/types/controlPanel.types';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { InstStrategicObj } from 'src/app/types/InstStrategicObj.types';
import { InstStrategicObjService } from 'src/app/core/http/instStrategicObj/inst-strategic-obj.service';
import { OdsService } from 'src/app/core/http/ods/ods.service';
import { ODS } from 'src/app/types/ods.types';
import { ObjStrategiesODSService } from 'src/app/core/http/obj_strategies_ods/obj_strategies_ods.service';
import { EstrategiaOds, ObjectiveCompleteOds, ObjectiveCompleteOdsById, Objectives_Strategies_Ods } from 'src/app/types/obj_strategies_ods.types';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ObjControl } from './modal_objetivos.component';
import { ChangeDetectorRef } from '@angular/core';
import { ActControl } from './modal_cuadro_actividades.component';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { SpecificObjetives } from 'src/app/types/specificObjetives.types';
import { SpecificObjetivesService } from 'src/app/core/http/specific-objetives/specific-objetives.service';
import { Modal_ObjEspecifico } from './modal_specificObj.component';

@Component({
  selector: 'vex-development-plan-form',
  templateUrl: './development-plan.html',
  styleUrls: ['../../creation-form.component.scss'],
})
@Injectable({
  providedIn: 'root',
})
export class DevelopmentPlanFormComponent implements OnInit {
  idGroup: number;
  isLinear = true; // Stepper will be linear (cannot skip steps)
  planSuperior: any[] = [];
  marcoLegal: any[] = [];
  planNacional: any[] = [];
  idPlanDesarrollo: number;

  currentUser: string;
  currentDate: any;
  objetivoInstitucional: InstStrategicObj[];
  ods: ODS[];
  estrategias: Strategies[];
  obj: any[] = [];
  usuarioNombre: { [key: number]: string } = {};
  specificObjetives: SpecificObjetives[] = [];
  informacionObjetivos: string = '';
  isSeguimientoFase: string;
  dataCompleteobjetivos: ObjectiveCompleteOdsById[] = [];

  constructor(
    private fb: FormBuilder,
    private upperLevelPlanService: UpperLevelPlanService,
    private legalFrameworkService: LegalFrameworkService,
    private nationalPlanService: NationalPlanService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private route: ActivatedRoute,
    private develegaService: DeveLegaService,
    private deveUppeService: DeveUppeService,
    private deveNationalService: DeveNationalService,
    private developmentPlanService: DevelopmentPlanService,
    private datePipe: DatePipe,
    private controlPanelService: ControlPanelService,
    private creationReqService: CreationReqService,
    private invGroupService: InvGroupService,
    private objInstitucionalService: InstStrategicObjService,
    private odsService: OdsService,
    private strategiesService: StrategiesService,
    private dialog: MatDialog,
    private usuarioService: UsuarioService,
    private specificObjetivesService: SpecificObjetivesService,
    private objStrategiesODSService: ObjStrategiesODSService,
    private cdr: ChangeDetectorRef,
  ) { this.obj = []; }
  public formReady: boolean = false; // Bandera para indicar si el formulario está listo
  public isLoading: boolean = true; // Inicializar como true para que el spinner aparezca al inicio

  ngOnInit(): void {
    this.idGroup = Number(sessionStorage.getItem("invGroup"));
    this.currentUser = this.authService.getUserName();
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.isSeguimientoFase = localStorage.getItem('isSeguimientoFase');

    this.obtenerPlanVigente(); // Esto llama también a cargaFormularios internamente
    this.obtenerSolicitudCreacion(); // Esta no depende del plan, así que puede ir en paralelo
  }
  solicitudCreacion: CreationReqForm;
  obtenerSolicitudCreacion() {
    this.creationReqService.getByGroup(this.idGroup).subscribe(data => {
      this.solicitudCreacion = data;

      // Actualizar campo del formulario si ya está cargado
      if (this.myForm?.get('grupoInv2_1')) {
        this.myForm.get('grupoInv2_1').patchValue({
          alineacionEstrategica: this.solicitudCreacion.alineacionEstrategica || ""
        });
      }
    });
  }


  planVigente: DevelopmentPlanForms;
  obtenerPlanVigente() {
    this.developmentPlanService.getByIdGroupC(this.idGroup).subscribe(data => {
      if (data && data.length > 0) {
        // Obtener el plan con la fecha más reciente
        this.planVigente = data.reduce((latest, current) => {
          const latestDate = new Date(latest.fechaModificacionUsuario || latest.fechaCreacionUsuario);
          const currentDate = new Date(current.fechaModificacionUsuario || current.fechaCreacionUsuario);
          return currentDate > latestDate ? current : latest;
        });

        // ✅ Ahora que ya se ha definido planVigente, puedes actualizar los objetivos
        this.actualizarInformacionObjetivos();
        this.obtenerPanelesControl();
        this.isLoading = false;

        this.loadData().subscribe(() => {
          this.cargaFormularios(); // crea el formulario con opciones ya cargadas
          this.loadDataForm(this.planVigente.idPlanDesarrollo); // ahora sí, setear seleccionados desde BD
          this.formReady = true;
          this.isLoading = false;
        });
        this.isLoading = false;

      } else {
        const planDesarrollo: DevelopmentPlanForms = {
          idPlanDesarrollo: 0,
          idGrupoInv: this.idGroup,
          idObjetivoInst: 22,
          tipo: "c",
          estado: "e",
          alcance: "",
          contexto: "",
          objGeneral: "",
          usuarioCreacionUsuario: this.currentUser,
          fechaCreacionUsuario: this.currentDate,
          usuarioModificacionUsuario: null,
          fechaModificacionUsuario: null
        };
        this.planVigente = planDesarrollo;


        this.developmentPlanService.create(planDesarrollo).subscribe(response => {
          this.planVigente.idPlanDesarrollo = response;
          this.actualizarInformacionObjetivos();
        });

        this.loadData().subscribe(() => {
          this.cargaFormularios();
          this.formReady = true;
        });
        this.isLoading = false;
      }
    });
  }

  loadDataForm(idPlan: number) {
    if (!idPlan) return;
    this.deveNationalService.getByDev(idPlan).subscribe((data) => {
      const planNacionalIds = data.map(d => d.idPlanNacional);
      this.planNacionalControl.patchValue(planNacionalIds);
    })
    this.develegaService.getByDev(idPlan).subscribe((data) => {
      const marcoLegalIds = data.map(d => d.idMarcoLegal);
      this.marcoControl.patchValue(marcoLegalIds);
    })
    this.deveUppeService.getByDev(idPlan).subscribe((data) => {
      const planSuperiorIds = data.map(d => d.idPlanNivelSuperior);
      this.planSuperiorControl.patchValue(planSuperiorIds);
    })
    this.objetivoInstitucionalControl.patchValue(this.planVigente.idObjetivoInst);

  }
  private sincronizarReferencias(
    formControl: FormControl,
    obtenerDesdeBD: () => Observable<any[]>,
    getId: (item: any) => number,
    crearRelacion: (id: number) => Observable<any>,
    eliminarRelacion: (id: number) => Observable<any>
  ) {
    obtenerDesdeBD().subscribe((data) => {
      const bdIds = data.map(getId);
      const formIds = formControl.value || [];

      // IDs que están en el formulario pero no en la BD → Crear
      const nuevos = formIds.filter(id => !bdIds.includes(id));

      // IDs que están en la BD pero ya no en el formulario → Eliminar
      const eliminados = bdIds.filter(id => !formIds.includes(id));

      // Crear nuevas relaciones
      nuevos.forEach(id => {
        crearRelacion(id).subscribe({
          next: () => console.log('Relación creada:', id),
          error: err => console.error('Error al crear relación', err)
        });
      });

      // Eliminar relaciones obsoletas
      eliminados.forEach(id => {
        eliminarRelacion(id).subscribe({
          next: () => console.log('Relación eliminada:', id),
          error: err => console.error('Error al eliminar relación', err)
        });
      });
    });
  }
  guardarNormas(idPlanDesarrollo: number) {
    this.sincronizarReferencias(
      this.planNacionalControl,
      () => this.deveNationalService.getByDev(idPlanDesarrollo),
      (item) => item.idPlanNacional,
      (id) => this.deveNationalService.createDevelopNatiForm({
        idPlan: idPlanDesarrollo,
        idPlanNacional: id,
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null
      }),
      (id) => this.deveNationalService.delete(id, idPlanDesarrollo)
    );

    this.sincronizarReferencias(
      this.marcoControl,
      () => this.develegaService.getByDev(idPlanDesarrollo),
      (item) => item.idMarcoLegal,
      (id) => this.develegaService.createDeveLegaForm({
        idPlan: idPlanDesarrollo,
        idMarco: id,
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null
      }),
      (id) => this.develegaService.delete(id, idPlanDesarrollo)
    );

    this.sincronizarReferencias(
      this.planSuperiorControl,
      () => this.deveUppeService.getByDev(idPlanDesarrollo),
      (item) => item.idPlanNivelSuperior,
      (id) => this.deveUppeService.createDeveUppeForm({
        idPlan: idPlanDesarrollo,
        idPlanNivelSuperior: id,
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null
      }),
      (id) => this.deveUppeService.delete(id, idPlanDesarrollo)
    );
  }

  savePartialPlan(step: number) {
    if (step === 1) {
      this.guardarNormas(this.planVigente.idPlanDesarrollo);
    } if (step === 2) {
      this.guardarContexto();
    } if (step === 3) {
      this.guardarAlcance();
    } if (step === 4) {
      this.guardarObjetivosParcial();
    }
    if (step === 6) {
      this.guardarAlineacion();
    }

  }
  guardarAlineacion() {
    {
      this.creationReqService.getByGroup(this.idGroup).subscribe(data => {
        const creationReq: CreationReqForm = {
          idPeticionCreacion: data.idPeticionCreacion,
          idGrupoInv: data.idGrupoInv,
          alineacionEstrategica: this.myForm.value.grupoInv2_1.alineacionEstrategica,
          estado: "p",
          usuarioCreacionPeticion: data.usuarioCreacionPeticion,
          fechaCreacionPeticion: data.fechaCreacionPeticion,
          usuarioModificacionPeticion: this.currentUser,
          fechaModificacionPeticion: this.currentDate
        }
        this.creationReqService.update(data.idPeticionCreacion, creationReq).subscribe(
          () => {
          });
      })

    }
  }
  guardarContexto() {
    {
      let plan = this.planVigente;
      if (plan.contexto === this.myForm.value.planDesarrolloForm2_1.contexto) {
        return;
      }
      plan.contexto = this.myForm.value.planDesarrolloForm2_1.contexto;
      this.developmentPlanService.update(this.planVigente.idPlanDesarrollo, plan).subscribe(
        () => {
        });
    }
  }


  guardarAlcance() {
    let plan = this.planVigente;
    if (plan.alcance === this.myForm.value.planDesarrolloForm2.alcance) {
      return;
    }
    plan.alcance = this.myForm.value.planDesarrolloForm2.alcance;
    this.developmentPlanService.update(this.planVigente.idPlanDesarrollo, plan).subscribe(
      () => {
      });
  }
  guardarObjetivosParcial() {
    let plan = this.planVigente;
    if (plan.objGeneral === this.myForm.value.planDesarrolloForm2_2.objGeneral && plan.idObjetivoInst === this.myForm.value.planDesarrolloForm2_2.objInstitucional) {
      return;
    }
    plan.idObjetivoInst = this.myForm.value.planDesarrolloForm2_2.objInstitucional;
    plan.objGeneral = this.myForm.value.planDesarrolloForm2_2.objGeneral;
    this.developmentPlanService.update(this.planVigente.idPlanDesarrollo, plan).subscribe(
      () => {
      });
  }
  planSuperiorControl = new FormControl();
  objEstrategicoControl = new FormControl();
  alineacionEstrategicaControl = new FormControl("", Validators.required);
  marcoControl = new FormControl();
  planNacionalControl = new FormControl();
  objetivoInstitucionalControl = new FormControl();
  odsControl = new FormControl<any>(0, Validators.required);
  myForm: FormGroup;
  cargaFormularios() {
    this.myForm = this.fb.group({
      planDesarrolloForm1: this.fb.group({
        planSuperior: this.planSuperiorControl,
        marco: this.marcoControl,
        planNacional: this.planNacionalControl,
      }),
      planDesarrolloForm2: this.fb.group({
        alcance: [this.planVigente?.alcance || "", Validators.required],
      }),
      planDesarrolloForm2_1: this.fb.group({
        contexto: [this.planVigente?.contexto || "", Validators.required],
      }),
      planDesarrolloForm2_2: this.fb.group({
        objInstitucional: this.objetivoInstitucionalControl,
        objGeneral: [this.planVigente?.objGeneral || "", Validators.required],
      }),
      planDesarrolloForm3: this.fb.array([]),
      grupoInv2_1: this.fb.group({
        alineacionEstrategica: [this.solicitudCreacion?.alineacionEstrategica || "", Validators.required],
      }),
      planDesarrolloForm4: this.fb.array([]),
    });

    // Solo hacer patch si los arrays no están vacíos
    if (this.planSuperior.length > 0) {
      this.planSuperiorControl.setValue([this.planSuperior[0].idPlanNivelSuperior]);
    }
    if (this.marcoLegal.length > 0) {
      this.marcoControl.setValue([this.marcoLegal[0].idMarcoLegal]);
    }
    if (this.planNacional.length > 0) {
      this.planNacionalControl.setValue([this.planNacional[0].idPlanNacional]);
    }
  }


  get planDesarrolloForm1() {
    return this.myForm.get('planDesarrolloForm1') as FormGroup;
  }
  get planDesarrolloForm2() {
    return this.myForm.get('planDesarrolloForm2') as FormGroup;
  }
  get planDesarrolloForm2_1() {
    return this.myForm.get('planDesarrolloForm2_1') as FormGroup;
  }
  get planDesarrolloForm2_2() {
    return this.myForm.get('planDesarrolloForm2_2') as FormGroup;
  }
  get planDesarrolloForm3() {
    return this.myForm.get('planDesarrolloForm3') as FormGroup;
  }
  get planDesarrolloForm4() {
    return this.myForm.get('planDesarrolloForm4') as FormGroup;
  }
  get objetivos(): FormArray {
    return this.myForm.get('planDesarrolloForm3') as FormArray;
  }
  get marco(): FormArray {
    return this.myForm.get('planDesarrolloForm4') as FormArray;
  }
  get grupoInv2_1() {
    return this.myForm.get('grupoInv2_1') as FormGroup;
  }
  //Cargar Data inicial para poder iniciar los Formularios con Datos
  loadData() {
    return forkJoin({
      planSuperior: this.upperLevelPlanService.getAll(),
      marcoLegal: this.legalFrameworkService.getAll(),
      planNacional: this.nationalPlanService.getAll(),
      objetivoInstitucional: this.objInstitucionalService.getAll(),
      estrategias: this.strategiesService.getAll(),
      ods: this.odsService.getAll(),
    }).pipe(
      map((response) => {
        this.planSuperior = response.planSuperior.filter((plan) => plan.estado === true);
        this.marcoLegal = response.marcoLegal.filter((marco) => marco.estado === true);
        this.planNacional = response.planNacional.filter((plan) => plan.estado === true);
        this.objetivoInstitucional = response.objetivoInstitucional.filter((obj) => obj.estado === true);
        this.estrategias = response.estrategias.filter((estrategia) => estrategia.estado === true);
        this.ods = response.ods;
      })
    );
  }
  agregarObjetivo(): void {
    const dialogRef = this.dialog.open(Modal_ObjEspecifico, {
      width: '50%',
      height: '70%',
      data: {
        idPlanActual: this.planVigente.idPlanDesarrollo
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.actualizarInformacionObjetivos();
      }
    });
  }
  editarObjetivo(objetivo: SpecificObjetives): void {
    const dialogRef = this.dialog.open(Modal_ObjEspecifico, {
      width: '50%',
      height: '70%',
      data: {
        objetivoEspecifico: objetivo,
        idPlanActual: objetivo.idPlanDesarrollo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarInformacionObjetivos();
      }
      this.actualizarInformacionObjetivos();
    });
  }

  actualizarInformacionObjetivos(): void {
    this.objStrategiesODSService.getCompleteByObjRelations(this.planVigente.idPlanDesarrollo).subscribe((data) => {
      this.dataCompleteobjetivos = data;
      this.actualizarInformacion();
    });
  }

  getObjetivoEspecifico(posicion: number): string {
    const objetivo = this.objetivos.value[posicion];  // Usar la posición para acceder al arreglo
    return objetivo ? objetivo.objetivo : 'Objetivo no encontrado';  // Ajusta según el campo que quieras mostrar
  }
  actualizarInformacion(): void {
    if (!this.dataCompleteobjetivos || this.dataCompleteobjetivos.length === 0) {
      this.informacionObjetivos = "No hay objetivos registrados.";
      return;
    }
    this.informacionObjetivos = this.dataCompleteobjetivos.map((item, index) => {
      const estrategias = item.estrategiasOds.map(e => e.estrategia?.estrategia).filter(Boolean);
      const ods = item.estrategiasOds.map(o => o.ods?.ods).filter(Boolean);
      console.log(estrategias, ods)
      const estrategiasTexto = estrategias.length ? estrategias.join(', ') : 'Ninguna';
      const odsTexto = ods.length ? ods.join(', ') : 'Ninguno';

      return `🎯 Objetivo ${index + 1}: ${item.obj.objetivo}
📌 Estrategias: ${estrategiasTexto}
🌍 ODS: ${odsTexto}
--------------------------------------------------`;
    }).join('\n\n');
  }


  openDialogObj(obj: SpecificObjetives): void {
    const objetivoActual = obj;
    const objetivoInstitucional = this.myForm.get('planDesarrolloForm2_2.objInstitucional')?.value;
    const dialogRef = this.dialog.open(ObjControl, {
      width: '50%',
      height: '70%',
      data: {
        idObjetivoEspecifico: objetivoActual.idObjetivo, // <-- Aquí va el ID
        objetivoEspecifico: objetivoActual,
        objetivoInstitucional: objetivoInstitucional,
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const currentObjetivo = obj;
        this.actualizarInformacionObjetivos(); // Refresca el estado del form

      }
      this.actualizarInformacionObjetivos(); // Refresca el estado del form
    });
  }


  agregarMarco(): void {
    const dialogRef = this.dialog.open(ActControl, {
      width: '80%',
      height: '90%',
      data: {
        objetivos: this.dataCompleteobjetivos,
        planId: this.planVigente.idPlanDesarrollo
      }
    });

    // Cuando se cierra el modal, verificar si hay datos y agregar al FormArray
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerPanelesControl();
      }
      this.obtenerPanelesControl();
    });
  }
  controlPanel: ControlPanelComplete[];
  obtenerPanelesControl() {
    this.controlPanelService.getCompleteByPlan(this.planVigente.idPlanDesarrollo).subscribe((data) => {
      this.controlPanel = data;
    });
  }
  eliminarMarco(index: number): void {
    this.controlPanelService.delete(index).subscribe((data) => {
      this.obtenerPanelesControl();
    });
  }


  openModalMarco(marco: ControlPanelComplete): void {
    const marcoActual = marco;
    const dialogRef = this.dialog.open(ActControl, {
      width: '50%',
      height: '70%',
      data: {
        objetivos: this.dataCompleteobjetivos,
        planId: this.planVigente.idPlanDesarrollo,
        marco: marcoActual
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerPanelesControl();
      } 
      this.obtenerPanelesControl();

    });
  }
  eliminarRelacion(rel: EstrategiaOds, idObj: number) {
    this.objStrategiesODSService.delete(idObj, rel.estrategia.idEstrategia, rel.ods.id)
      .subscribe(() => {
        this.actualizarInformacionObjetivos();
        this.obtenerPanelesControl();
      });
  }
  //Envio del Formulario------------------------------
  HandleSubmit() {
    this.isLoading = true;
    if (this.myForm.valid) {
      this.guardarPlanBase();
      this.snackBar.open('Solicitudes Enviados correctamente.', 'Cerrar', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
      });
    }
  }
  guardarPlanBase() {
    this.planVigente.fechaCreacionUsuario = this.currentDate;
    this.planVigente.usuarioModificacionUsuario = this.currentUser;
    this.developmentPlanService.update(this.planVigente.idPlanDesarrollo, this.planVigente).subscribe(
      () => {
        this.actualizarEstados();
      });

  }



  actualizarEstados() {
    this.creationReqService.getByGroup(this.idGroup).subscribe(data => {
      const creationReq: CreationReqForm = {
        idPeticionCreacion: data.idPeticionCreacion,
        idGrupoInv: data.idGrupoInv,
        alineacionEstrategica: this.myForm.value.grupoInv2_1.alineacionEstrategica,
        estado: "p",
        usuarioCreacionPeticion: data.usuarioCreacionPeticion,
        fechaCreacionPeticion: data.fechaCreacionPeticion,
        usuarioModificacionPeticion: this.currentUser,
        fechaModificacionPeticion: this.currentDate
      }
      this.creationReqService.update(data.idPeticionCreacion, creationReq).subscribe(
        () => {
        });
    })
    this.invGroupService.getById(this.idGroup).subscribe(data => {
      const invGroup: InvGroupForm = {
        idGrupoInv: this.idGroup,
        idCoordinador: data.idCoordinador,
        nombreGrupoInv: data.nombreGrupoInv,
        estadoGrupoInv: data.estadoGrupoInv,
        proceso: '2',
        acronimoGrupoinv: data.acronimoGrupoinv,
        usuarioCreacion: data.usuarioCreacion,
        fechaCreacion: data.fechaCreacion,
        usuarioModificacion: this.currentUser,
        fechaModificacion: this.currentDate
      }
      this.invGroupService.update(this.idGroup, invGroup).subscribe(
        () => {
          this.isLoading = false;
          this.router.navigateByUrl(`main/dashboard`);
        });
    })
  }
}
