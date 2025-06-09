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
import { Strategies } from 'src/app/types/strategies.types';
import { ControlPanelForm } from 'src/app/types/controlPanel.types';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { InstStrategicObj } from 'src/app/types/InstStrategicObj.types';
import { InstStrategicObjService } from 'src/app/core/http/instStrategicObj/inst-strategic-obj.service';
import { OdsService } from 'src/app/core/http/ods/ods.service';
import { ODS } from 'src/app/types/ods.types';
import { ObjStrategiesODSService } from 'src/app/core/http/obj_strategies_ods/obj_strategies_ods.service';
import { Objectives_Strategies_Ods } from 'src/app/types/obj_strategies_ods.types';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ObjControl } from './modal_objetivos.component';
import { ChangeDetectorRef } from '@angular/core';
import { ActControl } from './modal_cuadro_actividades.component';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { SpecificObjetives } from 'src/app/types/specificObjetives.types';
import { SpecificObjetivesService } from 'src/app/core/http/specific-objetives/specific-objetives.service';

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
    this.idGroup = Number(sessionStorage.getItem("invGroup"))
    this.currentUser = this.authService.getUserName();
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.obtenerPlanVigente();
    this.isSeguimientoFase = localStorage.getItem('isSeguimientoFase');



  }
  planVigente: DevelopmentPlanForms;
  obtenerPlanVigente() {
    this.developmentPlanService.getByIdGroupC(this.idGroup).subscribe(data => {
      if (data && data.length > 0) {
        // Obtener el plan con la fecha más reciente
        this.planVigente = data.reduce((latest, current) => {
          const latestDate = new Date(
            latest.fechaModificacionUsuario || latest.fechaCreacionUsuario
          );
          const currentDate = new Date(
            current.fechaModificacionUsuario || current.fechaCreacionUsuario
          );
          return currentDate > latestDate ? current : latest;
        });
        this.loadData().subscribe(() => {
          this.cargaFormularios(); // crea el formulario con opciones ya cargadas
          this.loadDataForm(this.planVigente.idPlanDesarrollo); // ahora sí, setear seleccionados desde BD
          this.formReady = true;
        });

      } else {
        this.planVigente = null;
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
        }
        this.developmentPlanService.create(planDesarrollo).subscribe(response => {
          this.planVigente.idPlanDesarrollo = response;
        });
        this.loadData().subscribe(() => {
          this.cargaFormularios();
          this.formReady = true;
        });
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
        alcance: [this.planVigente.alcance || "", Validators.required],
      }),
      planDesarrolloForm2_1: this.fb.group({
        contexto: [this.planVigente.contexto || "", Validators.required],
      }),
      planDesarrolloForm2_2: this.fb.group({
        objInstitucional: this.objetivoInstitucionalControl,
        objGeneral: [this.planVigente.objGeneral || "", Validators.required],
      }),
      planDesarrolloForm3: this.fb.array([
        this.crearObjetivo()
      ]),
      grupoInv2_1: this.fb.group({
        alineacionEstrategica: this.alineacionEstrategicaControl,
      }),
      planDesarrolloForm4: this.fb.array([]),
    });
    this.planSuperiorControl.setValue([this.planSuperior[0].idPlanNivelSuperior]);
    this.marcoControl.setValue([this.marcoLegal[0].idMarcoLegal]);
    this.planNacionalControl.setValue([this.planNacional[0].idPlanNacional]);
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

  trackByIndex(index: number, item: any): number {
    return item ? item.value.id || index : index;
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
  //campo de objetivos especificos - Agregar con ODS y estrategias institucionales
  crearObjetivo(): FormGroup {
    return this.fb.group({
      idObjetivo: [0],                       // ← nuevo
      objetivo: ['', Validators.required],
      estrategias: [[]],
      ods: [[]]
    });
  }


  async agregarObjetivo(): Promise<void> {
    const objetivoForm = this.fb.group({
      objetivo: [''],
      estrategias: [[]],
      ods: [[]],
      idObjetivo: [null] // ← para guardar el ID de la BD
    });

    // Crear en backend inmediatamente
    const nuevoObjetivo: SpecificObjetives = {
      idObjetivo: 0,
      objetivo: '',
      usuarioCreacion: this.currentUser,
      fechaCreacion: this.currentDate,
      usuarioModificacion: null,
      fechaModificacion: null
    };

    try {
      const idCreado = await this.specificObjetivesService.createSpecificObjetive(nuevoObjetivo).toPromise();
      objetivoForm.patchValue({ idObjetivo: idCreado });

      this.objetivos.push(objetivoForm);
      this.actualizarInformacion();

    } catch (error) {
      console.error('Error al crear el objetivo en el backend:', error);
    }
  }


  getObjetivoEspecifico(posicion: number): string {
    const objetivo = this.objetivos.value[posicion];  // Usar la posición para acceder al arreglo
    return objetivo ? objetivo.objetivo : 'Objetivo no encontrado';  // Ajusta según el campo que quieras mostrar
  }

  eliminarObjetivo(index: number): void {
    const objetivo = this.objetivos.at(index).value.objetivo; // Obtener el texto del objetivo

    if (!window.confirm(`¿Estás seguro de que deseas eliminar el objetivo?\n"${objetivo}"`)) {
      return;
    }

    console.log("Intentando eliminar índice:", index, "Total objetivos:", this.objetivos.length);

    if (this.objetivos.length > 1 && index >= 0 && index < this.objetivos.length) {
      const updatedObjetivos = this.objetivos.controls.filter((_, i) => i !== index);
      this.myForm.setControl('planDesarrolloForm3', this.fb.array(updatedObjetivos));

      console.log("Elemento eliminado correctamente. Nuevo tamaño:", updatedObjetivos.length);
      this.actualizarInformacion(); // Actualizar la información

      this.cdr.detectChanges();
    } else {
      console.warn("No se puede eliminar el objetivo. Índice fuera de rango.");
    }
  }

  actualizarInformacion(): void {
    if (!this.objetivos || this.objetivos.length === 0) {
      this.informacionObjetivos = "No hay objetivos registrados.";
      return;
    }

    this.informacionObjetivos = this.objetivos.value.map((obj, index) => {
      const estrategiasTexto = obj.estrategias.length
        ? obj.estrategias.map(e => e.descripcion).join(', ')
        : 'Ninguna';

      const odsTexto = obj.ods.length
        ? obj.ods.map(o => o.descripcion).join(', ')
        : 'Ninguno';

      return `🎯 Objetivo ${index + 1}: ${obj.objetivo}
      📌 Estrategias: ${estrategiasTexto}
      🌍 ODS: ${odsTexto}
  --------------------------------------------------`;
    }).join('\n\n');
  }


  getRowspan(estrategias: any[], ods: any[]): number {
    return Math.max(estrategias.length, ods.length);
  }
  openDialogObj(index: number): void {
    const objetivoActual = this.objetivos.at(index).value;

    const dialogRef = this.dialog.open(ObjControl, {
      width: '50%',
      height: '70%',
      data: {
        objetivoEspecifico: objetivoActual,
        estrategiasSeleccionadas: objetivoActual.estrategias || [],
        odsSeleccionados: objetivoActual.ods || []
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const currentObjetivo = this.objetivos.at(index);
        const idObjetivo = currentObjetivo.value.idObjetivo;

        // Guardar las estrategias + ODS en la BD
        try {
          if (result.estrategias.length !== result.ods.length) {
            throw new Error("El número de estrategias y ODS no coincide");
          }

          for (let i = 0; i < result.estrategias.length; i++) {
            const estrategia = result.estrategias[i];
            const odsItem = result.ods[i];

            const relacion: Objectives_Strategies_Ods = {
              idEstrategia: estrategia.id,
              idObjetivoEspecifico: idObjetivo,
              idODS: odsItem.id,
              usuarioCreacion: this.currentUser,
              fechaCreacion: this.currentDate,
              usuarioModificacion: null,
              fechaModificacion: null,
            };

            await this.objStrategiesODSService.create(relacion).toPromise();
          }

          currentObjetivo.patchValue({
            estrategias: result.estrategias,
            ods: result.ods
          });

          this.actualizarInformacion();
        } catch (error) {
          console.error('Error al guardar estrategias y ODS:', error);
        }
      }
    });
  }

  eliminarOds(objetivoIndex: number, itemIndex: number): void {
    const objetivo = this.objetivos.at(objetivoIndex);

    // Clonar los arreglos actuales
    const estrategias = [...objetivo.value.estrategias];
    const ods = [...objetivo.value.ods];

    // Verificar que el índice sea válido y eliminar ambos elementos
    if (estrategias.length > itemIndex && ods.length > itemIndex) {
      estrategias.splice(itemIndex, 1);
      ods.splice(itemIndex, 1);

      // Actualizar el formulario reactivo con los nuevos valores
      objetivo.patchValue({ estrategias, ods });
    } this.actualizarInformacion(); // Actualizar la información

  }


  crearMarco(): FormGroup {
    return this.fb.group({
      idPlanDesarrollo: [null, Validators.required],
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

  esFormularioValido(): boolean {
    if (!this.myForm.get('planDesarrolloForm3').valid) {
      return false;
    }

    for (const objetivo of this.objetivos.controls) {
      if (!objetivo.value.objetivo || objetivo.value.estrategias.length === 0) {
        return false;
      }
    }

    return true;
  }

  getName(id: number): Observable<string> {
    if (!this.usuarioNombre) {
      this.usuarioNombre = {};
    }
    if (this.usuarioNombre[id]) {
      return of(this.usuarioNombre[id]);
    }

    //Solicitud al backend
    return this.usuarioService.getById(id).pipe(
      map((usuario) => {
        const nombre = usuario?.nombre || 'Usuario no encontrado';
        this.usuarioNombre[id] = nombre; // Almacena el resultado en usuarioNombre
        return nombre;
      }),
      catchError(() => {
        const errorNombre = 'Usuario no encontrado';
        this.usuarioNombre[id] = errorNombre; // También almacena el mensaje de error
        return of(errorNombre);
      })
    );

  }

  agregarMarco(): void {
    const dialogRef = this.dialog.open(ActControl, {
      width: '80%',
      height: '90%',
      data: {
        objetivos: this.objetivos.value
      }
    });

    // Cuando se cierra el modal, verificar si hay datos y agregar al FormArray
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Aquí agregamos el nuevo marco al FormArray
        const newMarco = this.crearMarco();
        newMarco.patchValue(result);  // Asignar los valores que se ingresaron en el modal
        this.marco.push(newMarco);    // Agregar el marco al FormArray

        console.log('Nuevo marco agregado:', newMarco.value);
        console.log(`cs:`, this.marco.value);

      }
    });
  }
  eliminarMarco(index: number): void {
    if (this.marco.length > 1) {
      this.marco.removeAt(index);
    } else {
      console.error('No se puede eliminar el último marco');
    }
  }


  openModalMarco(index: number): void {
    const marcoActual = this.marco.at(index).value;

    const dialogRef = this.dialog.open(ActControl, {
      width: '50%',
      height: '70%',
      data: marcoActual
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentMarco = this.marco.at(index);
        currentMarco.patchValue({
          actividades: result.actividades,
          responsable: result.responsable,
          indicador: result.indicador,
          1: result[1],
          2: result[2],
          3: result[3],
          4: result[4],
          financiamientoRequerido: result.financiamientoRequerido,
          observaciones: result.observaciones
        });

        console.log('Marco actualizado:', currentMarco.value);
      }
    });
  }

  //Envio del Formulario------------------------------
  HandleSubmit() {
    this.formReady = true;
    this.isLoading = true;
    if (this.myForm.valid) {
      this.guardarPlanBase();
      this.snackBar.open('Solicitudes Enviados correctamente.', 'Cerrar', {
        duration: 3000,
      });
    } else {
      this.formReady = false;
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
      });
    }
  }
  guardarPlanBase() {

    const DevPlan: DevelopmentPlanForms = {
      idPlanDesarrollo: 0,
      idGrupoInv: this.idGroup,
      idObjetivoInst: this.myForm.value.planDesarrolloForm2_2.objInstitucional,
      tipo: "c",
      estado: "e",
      alcance: this.myForm.value.planDesarrolloForm2.alcance,
      contexto: this.myForm.value.planDesarrolloForm2_1.contexto,
      objGeneral: this.myForm.value.planDesarrolloForm2_2.objGeneral,
      usuarioCreacionUsuario: this.currentUser,
      fechaCreacionUsuario: this.currentDate,
      usuarioModificacionUsuario: null,
      fechaModificacionUsuario: null
    }
    this.developmentPlanService.create(DevPlan).subscribe(
      (response) => {
        this.guardarNormas(response);
        this.ejecutarGuardado(response);
        if (this.isSeguimientoFase === "1") {
          localStorage.removeItem('isSeguimientoFase');
        } else {

          this.actualizarEstados();
        }
        setTimeout(() => {
          this.formReady = false;
          if (this.isSeguimientoFase === "1") {
            this.router.navigateByUrl('main/anual-Plan');
          } else {
            this.router.navigateByUrl('main/dashboard');
          }
        }, 2000);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al crear el plan de desarrollo:', error); // Manejo de errores
      }
    )
  }

  idMap: { [key: number]: number } = {}; // Este mapa guardará el id de cada objetivo asociado con su posición

  async ejecutarGuardado(idPlan: number): Promise<void> {
    try {
      // Ejecutar guardarObj primero
      await this.guardarObj();
      console.log('Objetivos guardados exitosamente. Continuando con el guardado del panel de control.');

      // Después de guardarObj, ejecutar guardarControl
      await this.guardarControl(idPlan);
      console.log('Panel de control guardado exitosamente.');
    } catch (error) {
      console.error('Error en el proceso de guardado:', error);
    }
  }

  async guardarObj(): Promise<void> {
    const objetivos = this.objetivos.value.map((obj: any, index: number) => ({
      index, // Guardar el índice para referencia
      objetivo: obj.objetivo,
      estrategias: obj.estrategias || [],
      ods: obj.ods || [] // Incluimos ODS
    }));

    this.idMap = {}; // Aseguramos que el mapa esté vacío antes de empezar

    try {
      for (const obj of objetivos) {
        // Crear el objetivo específico
        const objetivo: SpecificObjetives = {
          idObjetivo: 0,
          objetivo: obj.objetivo,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null,
        };

        // Guardar el objetivo y obtener su ID
        const response = await this.specificObjetivesService.createSpecificObjetive(objetivo).toPromise();
        this.idMap[obj.index] = response;  // Asociamos el ID con la posición del arreglo
        const idObjetivo = response;

        // Validar que las estrategias y ODS tengan el mismo tamaño
        if (obj.estrategias.length !== obj.ods.length) {
          throw new Error(
            `El número de estrategias y ODS no coincide para el objetivo en la posición ${obj.index}`
          );
        }

        // Guardar estrategias y ODS conjuntamente por su posición
        for (let i = 0; i < obj.estrategias.length; i++) {
          const estrategia = obj.estrategias[i];
          const odsItem = obj.ods[i];

          const obj_strategy_ods: Objectives_Strategies_Ods = {
            idEstrategia: estrategia.id,
            idObjetivoEspecifico: idObjetivo,
            idODS: odsItem.id,
            usuarioCreacion: this.currentUser,
            fechaCreacion: this.currentDate,
            usuarioModificacion: null,
            fechaModificacion: null,
          };

          await this.objStrategiesODSService.create(obj_strategy_ods).toPromise();
        }
      }

      console.log('Todos los objetivos, estrategias y ODS se guardaron correctamente en orden:', this.idMap);
    } catch (error) {
      console.error('Error al guardar objetivos, estrategias y ODS:', error);
      throw error; // Propagamos el error para manejarlo en el flujo principal
    }
  }

  async guardarControl(idPlan: number): Promise<void> {
    const control = this.myForm.value.planDesarrolloForm4;

    // Verificar que el mapa de IDs esté disponible
    if (!this.idMap || Object.keys(this.idMap).length === 0) {
      console.error('No se han generado los IDs de los objetivos. Asegúrate de guardar los objetivos primero.');
      return;
    }

    try {
      // Guardar cada control de panel
      for (const obj of control) {
        // Buscar el ID de objetivo específico correspondiente
        const objetivoIndex = obj.idObjetivoEspecifico; // Índice del objetivo que vino del formulario
        const idObjetivoEspecifico = this.idMap[objetivoIndex]; // Obtener el ID generado para ese objetivo

        if (idObjetivoEspecifico === undefined) {
          console.error(`No se encontró un ID para el objetivo en la posición ${objetivoIndex}`);
          continue; // Continuamos con el siguiente registro si no se encuentra un ID
        }

        // Crear el objeto de ControlPanelForm con el ID correspondiente
        const act: ControlPanelForm = {
          idPlanDesarrollo: idPlan, // Suponiendo que tienes este ID en tu formulario
          idPanelControl: 0, // ID generado por el backend
          idObjetivoEspecifico: idObjetivoEspecifico, // Asociar el ID del objetivo
          idResponsable: obj.idResponsable, // Deberías tener esto en tu formulario
          indicadorNombre: obj.indicadorNombre,
          indicadorTipo: obj.indicadorTipo,
          indicadorForma: obj.indicadorForma,
          indicadorCondicional: obj.indicadorCondicional,
          indicadorAcumulativo: obj.indicadorAcumulativo,
          actividad: obj.actividad,
          meta1: obj.meta1,
          meta2: obj.meta2,
          meta3: obj.meta3,
          meta4: obj.meta4,
          financiamiento: obj.financiamiento,
          observacion: obj.observacion,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        };

        // Guarda el control de panel y espera la respuesta
        await this.controlPanelService.createControlPanelForm(act).toPromise();
      }
    } catch (error) {
      console.error('Error al guardar los paneles de control:', error);
      throw error; // Propagamos el error para manejarlo en el flujo principal
    }
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
        });
    })
  }
}
