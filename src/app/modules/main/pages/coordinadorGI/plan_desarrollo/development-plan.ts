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
import { Objectives } from 'src/app/types/objectives.types';
import { Strategies } from 'src/app/types/strategies.types';
import { ControlPanelForm } from 'src/app/types/controlPanel.types';
import { fadeInUpAnimation } from 'src/@vex/animations/fade-in-up.animation';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
@Component({
  selector: 'vex-creation-form',
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
  marcoControl = new FormControl<any>(0, Validators.required);
  planNacionalControl = new FormControl<any>(0, Validators.required);
  myForm: FormGroup;
  currentUser: string;
  currentDate: any;
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
    private objService: ObjectivesService,
    private strategieService: StrategiesService,
    private controlPanelService: ControlPanelService,
    private creationReqService: CreationReqService,
    private invGroupService: InvGroupService,

  ) {
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
        objGeneral: this.objGeneralControl,
        objEstrategico: this.objEstrategicoControl,
      }),
      planDesarrolloForm3: this.fb.group({
        objetivos: this.fb.array([]),
      }),
      planDesarrolloForm4: this.fb.group({
        actividades: this.fb.array([]),
      }),
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.idGroup = Number(sessionStorage.getItem("invGroup"))
    this.currentUser = this.authService.getUserName();
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
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
  loadData() {
    this.upperLevelPlanService.getAll().subscribe((data) => {
      this.planSuperior = data.filter((plan) => plan.estado === true);
    });
    this.legalFrameworkService.getAll().subscribe((data) => {
      this.marcoLegal = data.filter((marco) => marco.estado === true);
    });
    this.nationalPlanService.getAll().subscribe((data) => {
      this.planNacional = data.filter((plan) => plan.estado === true);
    });
  }

  addObjetivo() {
    const objetivoGroup = this.fb.group({
      nombre: ['', Validators.required],
      estrategias: this.fb.array([]),
    });
    this.objetivos.push(objetivoGroup);
  }

  get objetivos(): FormArray {
    return this.myForm.get('planDesarrolloForm3.objetivos') as FormArray;
  }

  addEstrategia(objetivoIndex: number) {
    const estrategiaGroup = this.fb.group({
      descripcion: ['', Validators.required],
      ods: ['', Validators.required],
    });
    this.getEstrategias(objetivoIndex).push(estrategiaGroup);
  }

  getEstrategias(objetivoIndex: number): FormArray {
    return this.objetivos.at(objetivoIndex).get('estrategias') as FormArray;
  }

  agregarActividad() {
    const actividadGroup = this.fb.group({
      objEspecifico: ['', Validators.required],
      actividad: ['', Validators.required],
      responsable: ['', Validators.required],
      indicador: ['', Validators.required],
      meta1: ['', Validators.required],
      meta2: ['', Validators.required],
      meta3: ['', Validators.required],
      meta4: ['', Validators.required],
      observaciones: ['', Validators.required],
      financiamiento: [1.1, Validators.required],
    });
    this.actividades.push(actividadGroup);
  }

  get actividades(): FormArray {
    return this.myForm.get('planDesarrolloForm4.actividades') as FormArray;
  }

  borrarActividad(index: number) {
    this.actividades.removeAt(index);
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
    //this.deveNationalService.createDevelopNatiForm()
  }
  guardarPlanBase() {
    const DevPlan: DevelopmentPlanForms = {
      idPlanDesarrollo: 0,
      idGrupoInv: this.idGroup,
      tipo: "c",
      estado: "e",
      alcance: this.myForm.value.planDesarrolloForm2.alcance,
      contexto: this.myForm.value.planDesarrolloForm2_1.contexto,
      objGeneral: this.myForm.value.planDesarrolloForm2_2.objGeneral,
      objEstrategico: this.myForm.value.planDesarrolloForm2_2.objEstrategico,
      usuarioCreacionUsuario: this.currentUser,
      fechaCreacionUsuario: this.currentDate,
      usuarioModificacionUsuario: null,
      fechaModificacionUsuario: null
    }
    this.developmentPlanService.create(DevPlan).subscribe(
      (response) => {
        // console.log('Respuesta del servidor:', response); // Imprimir la respuesta en la consola
        //this.idPlanDesarrollo=response;
        setTimeout(() => {
          this.router.navigateByUrl('main/crea');
        }, 8000);
        this.guardarNormas(response);
        this.guardarObj(response);
        this.guardarControl(response);
        this.actualizarEstados();

      },
      (error) => {
        console.error('Error al crear el plan de desarrollo:', error); // Manejo de errores
      }
    )
  }
  guardarObj(idPlan: number) {
    const objetivos = this.myForm.value.planDesarrolloForm3.objetivos;

    objetivos.forEach((obj: any) => {
      const objetivo: Objectives = {
        idObjetivo: 0, // Inicialmente 0, se asignará después
        idPlanDesarrollo: idPlan,
        objetivo: obj.nombre,
        usuarioCreacion: this.currentUser,
        fechaCreacion: this.currentDate,
        usuarioModificacion: null,
        fechaModificacion: null,
      };

      // Guarda el objetivo y espera la respuesta
      this.objService.createObjectivesForm(objetivo).subscribe(
        (response) => {
          
          const idObjetivo = response; // Asumiendo que la respuesta tiene el idObjetivo

          // Ahora, itera sobre las estrategias y guárdalas
          obj.estrategias.forEach((estrategia: any) => {
            const estrategiaData: Strategies = {
              //descripcion: estrategia.descripcion,
              idEstrategia: 0,
              estrategia: estrategia.descripcion,
              ods: estrategia.ods,
              idObjetivo: idObjetivo, // Relaciona la estrategia con el objetivo creado
              usuarioCreacion: this.currentUser,
              fechaCreacion: this.currentDate,
              usuarioModificacion: null,
              fechaModificacion: null,
            };

            // Guarda la estrategia
            this.strategieService.createStrategiesForm(estrategiaData).subscribe(
              (estrategiaResponse) => {
                console.log('Estrategia creada:', estrategiaResponse); // Maneja la respuesta aquí
              },
              (error) => {
                console.error('Error al crear la estrategia:', error); // Manejo de errores
              }
            );
          });
        },
        (error) => {
          console.error('Error al crear el objetivo:', error); // Manejo de errores
        }
      );
    });
  }
  guardarControl(idPlan: number) {
    const control = this.myForm.value.planDesarrolloForm4.actividades;

    control.forEach((obj: any) => {
      const act: ControlPanelForm = {
        idPlanDesarrollo: idPlan,
        idPanelControl: 0,
        indicador: obj.indicador,
        responsable: obj.responsable,
        objetivoEspecifico: obj.objEspecifico,
        actividad: obj.actividad,
        meta1: obj.meta1,
        meta2: obj.meta2,
        meta3: obj.meta3,
        meta4: obj.meta4,
        financiamiento: obj.financiamiento,
        observacion: obj.observaciones,
        usuarioCreacionPanelControl: this.currentUser,
        fechaCreacionPanelControl: this.currentDate,
        usuarioModificacionPanelControl: null,
        fechaModificacionPanelControl: null
      };

      // Guarda el objetivo y espera la respuesta
      this.controlPanelService.createControlPanelForm(act).subscribe(
        (response) => {
          console.log(response, "Creado")

        });
    })
  }

  HandleSubmit() {
    if (this.myForm.valid) {
      this.guardarPlanBase();
      console.log('Objetivos:', this.myForm.value.planDesarrolloForm3.objetivos);
      console.log('Cuadro de Mando Actividades:', this.myForm.value.planDesarrolloForm4.actividades);
      this.snackBar.open('Solicitudes Enviados correctamente.', 'Cerrar', {
        duration: 3000,
      });
     
     

    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
      });
    }
  }
  actualizarEstados(){
    
    this.creationReqService.getByGroup(this.idGroup).subscribe(data=>{
      const creationReq:CreationReqForm={
         idPeticionCreacion:data.idPeticionCreacion,
         idGrupoInv:data.idGrupoInv,
         alineacionEstrategica: data.alineacionEstrategica,
          estado:"M", 
          usuarioCreacionPeticion:data.usuarioCreacionPeticion,
          fechaCreacionPeticion:data.fechaCreacionPeticion,
          usuarioModificacionPeticion:this.currentUser,
          fechaModificacionPeticion:this.currentDate
      }
      this.creationReqService.update(data.idPeticionCreacion,creationReq).subscribe(
        ()=>{
        });
    })
    this.invGroupService.getById(this.idGroup).subscribe(data=>{
      const invGroup:InvGroupForm={
        idGrupoInv:this.idGroup,
        idUser:data.idUser,
        nombreGrupoInv:data.nombreGrupoInv,
        estadoGrupoInv:"ppropuesta",
        nombreOlGrupoInv:data.nombreOlGrupoInv,
        acronimoGrupoinv:data.acronimoGrupoinv,
        usuarioCreacionUsuario:data.usuarioCreacionUsuario,
        fechaCreacionUsuario:data.fechaCreacionUsuario,
        usuarioModificacionUsuario:this.currentUser,
        fechaModificacionUsuario:this.currentDate

      }
      this.invGroupService.update(this.idGroup,invGroup).subscribe(
        ()=>{
        });
    })
  }
}
