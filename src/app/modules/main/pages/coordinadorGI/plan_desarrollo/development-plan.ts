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
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { ObjControl } from './modal_objetivos.component';
import { ChangeDetectorRef } from '@angular/core';
import { ActControl } from './modal_cuadro_actividades.component';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { SpecificObjetives } from 'src/app/types/specificObjetives.types';
import { SpecificObjetivesService } from 'src/app/core/http/specific-objetives/specific-objetives.service';
@Component({
  selector: 'vex-development-plan-form',
  templateUrl: './development-plan.html',
  styleUrls: ['../creation-form.component.scss'],
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
  planSuperiorControl = new FormControl<any>(0, Validators.required);
  alcanceControl = new FormControl("", Validators.required);
  contextoControl = new FormControl("", Validators.required);
  objGeneralControl = new FormControl("", Validators.required);
  objEstrategicoControl = new FormControl("", Validators.required);
  alineacionEstrategicaControl = new FormControl("", Validators.required);
  marcoControl = new FormControl<any>(0, Validators.required);
  planNacionalControl = new FormControl<any>(0, Validators.required);
  objetivoInstitucionalControl = new FormControl<any>(0, Validators.required);
  odsControl = new FormControl<any>(0, Validators.required);
  myForm: FormGroup;
  currentUser: string;
  currentDate: any;
  objetivoInstitucional: InstStrategicObj[];
  ods: ODS[];
  estrategias: Strategies[];
  obj: any[] = [];
  usuarioNombre: { [key: number]: string } = {};
  specificObjetives: SpecificObjetives[] = [];
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
    this.loadData().subscribe(() => {
      this.cargaFormularios();
      this.formReady = true;
    });
    this.idGroup = Number(sessionStorage.getItem("invGroup"))
    this.currentUser = this.authService.getUserName();
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

  }
  //Estado inicial de cargar los formularios 
  cargaFormularios() {
    this.myForm = this.fb.group({
      planDesarrolloForm1: this.fb.group({
        planSuperior: this.planSuperiorControl,
        marco: this.marcoControl,
        planNacional: this.planNacionalControl,
      }),
      planDesarrolloForm2: this.fb.group({
        alcance: this.alcanceControl,
      }),
      planDesarrolloForm2_1: this.fb.group({
        contexto: this.contextoControl,
      }),
      planDesarrolloForm2_2: this.fb.group({
        objInstitucional: this.objetivoInstitucionalControl,
        objGeneral: this.objGeneralControl,
      }),
      planDesarrolloForm3: this.fb.array([
        this.crearObjetivo()
      ]),
      grupoInv2_1:this.fb.group({
        alineacionEstrategica: this.alineacionEstrategicaControl,}),
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
      objetivo: [''],
      estrategias: [[]],
      ods: [[]]
    });
  }

  agregarObjetivo(): void {
    if (this.objetivos) {
      this.objetivos.push(this.crearObjetivo());
    } else {
      console.error('El FormArray "objetivos" no está definido.');
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
  
      this.cdr.detectChanges();
    } else {
      console.warn("No se puede eliminar el objetivo. Índice fuera de rango.");
    }
  }
  
  
  
  getRowspan(estrategias: any[], ods: any[]): number {
    return Math.max(estrategias.length, ods.length);
  }
  openDialogObj(index: number): void {
    const objetivoActual = this.objetivos.at(index).value;
    const objetivoInstitucional = this.myForm.get('planDesarrolloForm2_2').get('objInstitucional').value;
    console.log('Objetivo institucional:', objetivoInstitucional); // Para depuración inicial
    const dialogRef = this.dialog.open(ObjControl, {
      width: '50%',
      height: '70%',
      data: {
        objetivoEspecifico: objetivoActual,
        objetivoInstitucional: objetivoInstitucional,
        estrategiasSeleccionadas: objetivoActual.estrategias || [],
        odsSeleccionados: objetivoActual.ods || []
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentObjetivo = this.objetivos.at(index);
        const currentEstrategias = currentObjetivo.value.estrategias || [];
        const currentOds = currentObjetivo.value.ods || [];
        const updatedEstrategias = [...currentEstrategias, ...result.estrategias];
        const updatedOds = [...currentOds, ...result.ods];
        currentObjetivo.patchValue({
          estrategias: updatedEstrategias,
          ods: updatedOds
        });
        console.log(`Estado completo del Objetivo ${index + 1}:`, currentObjetivo.value);
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
    }
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
    // Verifica si el formulario es válido
    if (!this.myForm.get('planDesarrolloForm3').valid) {
      return false;
    }

    // Verifica cada objetivo para asegurar que tenga al menos una estrategia
    for (const objetivo of this.objetivos.controls) {
      if (!objetivo.value.objetivo || objetivo.value.estrategias.length === 0) {
        return false; // Si un objetivo no tiene descripción o estrategias, el formulario no es válido
      }
    }

    return true; // Todo está lleno y válido
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
        this.actualizarEstados();
        setTimeout(() => {
          this.formReady = false;
          this.router.navigateByUrl('main/dashboard');
        }, 8000);
      },
      (error) => {
        console.error('Error al crear el plan de desarrollo:', error); // Manejo de errores
      }
    )
  }
  guardarNormas(idPlanDesarrollo: number) {
    const planesNacionales = this.planNacionalControl.value;
    const planNivelSuperiores = this.planSuperiorControl.value;
    const legal = this.marcoControl.value;
    if (planesNacionales && planesNacionales.length > 0) {
      planesNacionales.forEach((id: number) => {
        const planNacional: DeveNati = {
          idPlan: idPlanDesarrollo,
          idPlanNacional: id,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.deveNationalService.createDevelopNatiForm(planNacional).subscribe(
          (response) => { }
        )
      });

    } else {

    }

    if (legal && legal.length > 0) {
      legal.forEach((id: number) => {
        const marcoLegal: DeveLegaForm = {
          idPlan: idPlanDesarrollo,
          idMarco: id,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.develegaService.createDeveLegaForm(marcoLegal).subscribe(
          (response) => { }
        )
      });

    } else {

    }
    if (planNivelSuperiores && planNivelSuperiores.length > 0) {
      planNivelSuperiores.forEach((id: number) => {
        const planSuperior: DeveUppe = {
          idPlan: idPlanDesarrollo,
          idPlanNivelSuperior: id,
          usuarioCreacion: this.currentUser,
          fechaCreacion: this.currentDate,
          usuarioModificacion: null,
          fechaModificacion: null
        }
        this.deveUppeService.createDeveUppeForm(planSuperior).subscribe(
          (response) => { }
        )
      });

    } else {

    }
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
        console.log("Panel de control creado:", act);
      }

      console.log('Todos los paneles de control fueron guardados correctamente.');

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
        estadoGrupoInv: "",
        proceso:'2',
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
