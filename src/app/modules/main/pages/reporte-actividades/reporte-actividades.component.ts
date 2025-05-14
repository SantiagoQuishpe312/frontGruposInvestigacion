import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ActivityReportService } from 'src/app/core/http/activity-report/activity-report.service';
import { ObjStrategiesService } from 'src/app/core/http/obj-strategies/obj-strategies.service';
import { EventsService } from 'src/app/core/http/events/events.service';
import { ActivityReport } from 'src/app/types/activityReport.types';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { Router } from '@angular/router';
import { AgregarObjetivosComponent } from './objetivosModal/agregar-objetivos.component';
import { EditarObjetivosComponent } from './objetivosModal/editar-objetivos.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgregarEventosComponent } from './eventos-modal/agregar-eventos.component';
import { ResearchProjectService } from 'src/app/core/http/research-project/research-project.service';
import { EditarEventosComponent } from './eventos-modal/editar-eventos.component';
import { AgregarProyectosComponent } from './proyectos-modal/agregar-proyectos.component';
import { EditarProyectosComponent } from './proyectos-modal/editar-proyectos.component';
import { AgregarPosgradoComponent } from './posgrado-modal/agregar-posgrado.component';
import { PostGradTesisService } from 'src/app/core/http/postGrad-tesis/post-grad-tesis.service';
import { EditarPosgradoComponent } from './posgrado-modal/editar-posgrado.component';
import { DegreeTesisService } from 'src/app/core/http/degree-tesis/degree-tesis.service';
import { AgregarTitulacionComponent } from './titulacion-modal/agregar-titulacion.component';
import { EditarTitulacionComponent } from './titulacion-modal/editar-titulacion.component';
import { AgregarLibrosComponent } from './capitulos-libros-modal/agregar-libros.component';
import { EditarLibrosComponent } from './capitulos-libros-modal/editar-libros.component';
import { BookChapterService } from 'src/app/core/http/book-chapter/book-chapter.service';
import { MagazinesService } from 'src/app/core/http/magazines/magazines.service';
import { AgregarRevistaComponent } from './revistas-modal/agregar-revistas.component';
import { EditarRevistaComponent } from './revistas-modal/editar-revistas.component';
import { CongressService } from 'src/app/core/http/congress/congress.service';
import { AgregarCongresoComponent } from './congresos-modal/agregar-congreso.component';
import { EditarCongresoComponent } from './congresos-modal/editar-congreso.component';
import { BudgetExecuteService } from 'src/app/core/http/budget-execute/budget-execute.service';
import { AgregarEjecucionComponent } from './ejecucion-presupuestaria-modal/agregar-ejecucion.component';
import { EditarEjecucionComponent } from './ejecucion-presupuestaria-modal/editar-ejecucion.component';
import { SolCreaGiService } from 'src/app/core/http/sol-crea-gi/sol-crea-gi.service';


@Component({
  selector: 'vex-reporte-actividades',
  templateUrl: './reporte-actividades.component.html',
  styleUrls: ['./reporte-actividades.component.scss']
})
export class ReporteActividadesComponent implements OnInit {
  reporteForm: FormGroup;
  conclusionesRecomendacionesForm: FormGroup;
  objStrategiesForms: FormGroup[] = [];
  eventsForm: FormGroup[] = [];
  currentStep: number = 0;
  strategyStepIndex: number = 1;
  eventStepIndex: number = 2;
  projectStepIndex: number = 3;
  projectsForms: FormGroup[] = [];
  posgradosForms: FormGroup[] = [];
  titulacionForms: FormGroup[] = [];
  librosForms: FormGroup[] = [];
  revistasForms: FormGroup[] = [];
  congresosForms: FormGroup[] = [];
  ejecucionForms: FormGroup[] = [];
  informeActividadId: number;
  idGrupo: number;
  invGroupExists: boolean = false;
  valoresCumplimiento: number[] = [];
  promedioCumplimiento: number = 0;
  colorSemaforo: 'rojo' | 'amarillo' | 'verde' = 'rojo';
  constructor(
    private formBuilder: FormBuilder,
    private activityReportService: ActivityReportService,
    private objStrategiesService: ObjStrategiesService,
    private eventsService: EventsService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private projectService: ResearchProjectService,
    private posgradoService: PostGradTesisService,
    private titulacionService: DegreeTesisService,
    private libroService: BookChapterService,
    private revistaService: MagazinesService,
    private congresoService: CongressService,
    private ejecucionService: BudgetExecuteService,
    private solCreaGiService: SolCreaGiService
  ) { const almacenado = localStorage.getItem('promedioCumplimiento');
    if (almacenado) {
      this.promedioCumplimiento = Number(almacenado);
      this.actualizarColorSemaforo();
    }}

  ngOnInit(): void {
    const currentUser = this.authService.getUserName();
    const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    const userId = Number(sessionStorage.getItem('userId'));

    this.reporteForm = this.formBuilder.group({
      idGrupo: [''],
      antecedentes: ['', Validators.required],
      conclusiones: [''],
      recomendaciones: [''],
      estado: [''],
      usuarioCreacionInforme: [currentUser],
      fechaCreacionInforme: [currentDate],
      usuarioModificacionInforme: [currentUser],
      fechaModificacionInforme: [currentDate]
    });

    this.solCreaGiService.getAll().subscribe(groups => {
      const userGroup = groups.find(group => group.idCoordinador === userId);
      if (userGroup) {
        this.idGrupo = userGroup.idGrupoInv;
        this.reporteForm.patchValue({
          idGrupo: this.idGrupo
        });
      }
    });
    
    this.subscribeToFieldChanges('antecedentes');
    this.subscribeToFieldChanges('conclusiones');
    this.subscribeToFieldChanges('recomendaciones');

  }
calcularPromedio() {
    const suma = this.valoresCumplimiento.reduce((a, b) => a + b, 0);
    this.promedioCumplimiento = suma / this.valoresCumplimiento.length;
  }
   actualizarColorSemaforo() {
    if (this.promedioCumplimiento < 70) {
      this.colorSemaforo = 'rojo';
    } else if (this.promedioCumplimiento >= 70 && this.promedioCumplimiento <= 90) {
      this.colorSemaforo = 'amarillo';
    } else {
      this.colorSemaforo = 'verde';
    }
  }agregarCumplimiento(valor: number) {
    this.valoresCumplimiento.push(valor);
    this.calcularPromedio();
    this.actualizarColorSemaforo();

    // Guardar en localStorage
    localStorage.setItem('promedioCumplimiento', this.promedioCumplimiento.toString());
  }
  private subscribeToFieldChanges(fieldName: string): void {
    this.reporteForm.get(fieldName).valueChanges.subscribe((value: string) => {
      if (value.trim().length === 0) {
        this.reporteForm.get(fieldName).setValue('', { emitEvent: false });
      } else {
        const newValue = value.charAt(0).toUpperCase() + value.slice(1);
        const formattedValue = newValue.replace(/^(.*?\S)(.*)$/, (_, firstWord, rest) => {
          return firstWord + rest.replace(/\s/g, ' ');
        });
        this.reporteForm.get(fieldName).setValue(formattedValue, { emitEvent: false });
      }
    });
  }
  
  openAgregarObjetivosModal() {
    const dialogRef: MatDialogRef<AgregarObjetivosComponent> = this.dialog.open(AgregarObjetivosComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const objStrategiesForm = this.formBuilder.group({
          idInformeActividades: [''],
          objetivo: [result.objetivo, Validators.required],
          estrategia: [result.estrategia, Validators.required],
          verificable: [result.verificable, Validators.required],
          cumplimiento: [result.cumplimiento, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.objStrategiesForms.push(objStrategiesForm);
      }
       dialogRef.componentInstance.cumplimientoAgregado.subscribe((nuevoCumplimiento: number) => {
      this.agregarCumplimiento(nuevoCumplimiento);
    });
    });
  }

  actualizarObjetivoEstrategico(index: number) {
    const dialogRef = this.dialog.open(EditarObjetivosComponent, {
      width: '400px',
      data: {
        objetivo: this.objStrategiesForms[index].get('objetivo').value,
        estrategia: this.objStrategiesForms[index].get('estrategia').value,
        verificable: this.objStrategiesForms[index].get('verificable').value,
        cumplimiento: this.objStrategiesForms[index].get('cumplimiento').value
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.objStrategiesForms[index].patchValue({
          objetivo: result.objetivo,
          estrategia: result.estrategia,
          verificable: result.verificable,
          cumplimiento: result.cumplimiento
        });
      }
    });
  }

  borrarObjetivoEstrategico(index: number) {
    this.objStrategiesForms.splice(index, 1);
  }

  
  openAgregarEventosModal() {
    const dialogRef: MatDialogRef<AgregarEventosComponent> = this.dialog.open(AgregarEventosComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const eventForm = this.formBuilder.group({
          idInformeActividades: [''],
          nombre: [result.nombre, Validators.required],
          ciudad: [result.ciudad, Validators.required],
          pais: [result.pais, Validators.required],
          fecha: [result.fecha, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.eventsForm.push(eventForm);
      }
    });
  }

  actualizarEvento(index: number) {
    const dialogRef = this.dialog.open(EditarEventosComponent, {
      width: '400px',
      data: {
        nombre: this.eventsForm[index].get('nombre').value,
        ciudad: this.eventsForm[index].get('ciudad').value,
        pais: this.eventsForm[index].get('pais').value,
        fecha: this.eventsForm[index].get('fecha').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventsForm[index].patchValue({
          nombre: result.nombre,
          ciudad: result.ciudad,
          pais: result.pais,
          fecha: result.fecha
        });
      }
    });
  }

  borrarEvento(index: number) {
    this.eventsForm.splice(index, 1);
  }

  

  openAgregarProyectosModal() {
    const dialogRef: MatDialogRef<AgregarProyectosComponent> = this.dialog.open(AgregarProyectosComponent, {
      width: '600px',

      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const projectForm = this.formBuilder.group({
          idInformeActividades: [''],
          titulo: [result.titulo, Validators.required],
          entidadFinanciera: [result.entidadFinanciera, Validators.required],
          institucionColaboradora: [result.institucionColaboradora, Validators.required],
          horas: [result.horas, Validators.required],
          minutos: [result.minutos, Validators.required],
          presupuesto: [result.presupuesto, Validators.required],
          responsable: [result.responsable, Validators.required],
          participantes: [result.participantes, Validators.required],
          tipo: [result.tipo, Validators.required],
          estado: [result.estado, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.projectsForms.push(projectForm);
      }
    });
  }

  actualizarProyecto(index: number) {
    const dialogRef = this.dialog.open(EditarProyectosComponent, {
      width: '600px',
      data: {
        titulo: this.projectsForms[index].get('titulo').value,
        entidadFinanciera: this.projectsForms[index].get('entidadFinanciera').value,
        institucionColaboradora: this.projectsForms[index].get('institucionColaboradora').value,
        horas: this.projectsForms[index].get('horas').value,
        minutos: this.projectsForms[index].get('minutos').value,
        presupuesto: this.projectsForms[index].get('presupuesto').value,
        responsable: this.projectsForms[index].get('responsable').value,
        participantes: this.projectsForms[index].get('participantes').value,
        tipo: this.projectsForms[index].get('tipo').value,
        estado: this.projectsForms[index].get('estado').value,


      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectsForms[index].patchValue({
          titulo: result.titulo,
          entidadFinanciera: result.entidadFinanciera,
          institucionColaboradora: result.institucionColaboradora,
          horas: result.horas,
          minutos: result.minutos,
          presupuesto: result.presupuesto,
          responsable: result.responsable,
          participantes: result.participantes,
          tipo: result.tipo,
          estado: result.estado
        });
      }
    });
  }

  borrarProyecto(index: number) {
    this.projectsForms.splice(index, 1);
  }




  openAgregarPosgradoModal() {
    const dialogRef: MatDialogRef<AgregarPosgradoComponent> = this.dialog.open(AgregarPosgradoComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const posgradoForm = this.formBuilder.group({
          idInformeActividades: [''],
          //nombre: [result.nombre, Validators.required],
          //tesistas: [result.tesistas, Validators.required],
          nombre: [result.nombre],
          tesistas: [result.tesistas],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.posgradosForms.push(posgradoForm);
      }
    });
  }

  actualizarPosgrado(index: number) {
    const dialogRef = this.dialog.open(EditarPosgradoComponent, {
      width: '400px',
      data: {
        nombre: this.posgradosForms[index].get('nombre').value,
        tesistas: this.posgradosForms[index].get('tesistas').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.posgradosForms[index].patchValue({
          nombre: result.nombre,
          tesistas: result.tesistas,
        });
      }
    });
  }

  borrarPosgrado(index: number) {
    this.posgradosForms.splice(index, 1);
  }


 
  openAgregarTitulacionModal() {
    const dialogRef: MatDialogRef<AgregarTitulacionComponent> = this.dialog.open(AgregarTitulacionComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const titulacionForm = this.formBuilder.group({
          idInformeActividades: [''],
          nombre: [result.nombre, Validators.required],
          tesistas: [result.tesistas, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.titulacionForms.push(titulacionForm);
      }
    });
  }

  actualizarTitulacion(index: number) {
    const dialogRef = this.dialog.open(EditarTitulacionComponent, {
      width: '400px',
      data: {
        nombre: this.titulacionForms[index].get('nombre').value,
        tesistas: this.titulacionForms[index].get('tesistas').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.titulacionForms[index].patchValue({
          nombre: result.nombre,
          tesistas: result.tesistas,
        });
      }
    });
  }

  borrarTitulacion(index: number) {
    this.titulacionForms.splice(index, 1);
  }


  
  openAgregarCapitulosLibrosModal() {
    const dialogRef: MatDialogRef<AgregarLibrosComponent> = this.dialog.open(AgregarLibrosComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const libroForm = this.formBuilder.group({
          idInformeActividades: [''],
          //numero: [result.numero, Validators.required],
          titulo: [result.titulo, Validators.required],
          autor: [result.autor, Validators.required],
          editorial: [result.editorial, Validators.required],
          isbn: [result.isbn, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.librosForms.push(libroForm);
      }
    });
  }

  actualizarCapitulosLibros(index: number) {
    const dialogRef = this.dialog.open(EditarLibrosComponent, {
      width: '400px',
      data: {
        //numero: this.librosForms[index].get('numero').value,
        titulo: this.librosForms[index].get('titulo').value,
        autor: this.librosForms[index].get('autor').value,
        editorial: this.librosForms[index].get('editorial').value,
        isbn: this.librosForms[index].get('isbn').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.librosForms[index].patchValue({
          //numero: result.numero,
          titulo: result.titulo,
          autor: result.autor,
          editorial: result.editorial,
          isbn: result.isbn,
        });
      }
    });
  }

  borrarCapituloLibro(index: number) {
    this.librosForms.splice(index, 1);
  }

  


  openAgregarRevistasModal() {
    const dialogRef: MatDialogRef<AgregarRevistaComponent> = this.dialog.open(AgregarRevistaComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const revistaForm = this.formBuilder.group({
          idInformeActividades: [''],
          //numero: [result.numero, Validators.required],
          titulo: [result.titulo, Validators.required],
          autores: [result.autores, Validators.required],
          revista: [result.revista, Validators.required],
          indice: [result.indice, Validators.required],
          doi: [result.doi, Validators.required],
          ifsjr: [result.ifsjr, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.revistasForms.push(revistaForm);
      }
    });
  }

  actualizarRevista(index: number) {
    const dialogRef = this.dialog.open(EditarRevistaComponent, {
      width: '400px',
      data: {
        //numero: this.revistasForms[index].get('numero').value,
        titulo: this.revistasForms[index].get('titulo').value,
        autores: this.revistasForms[index].get('autores').value,
        revista: this.revistasForms[index].get('revista').value,
        indice: this.revistasForms[index].get('indice').value,
        doi: this.revistasForms[index].get('doi').value,
        ifsjr: this.revistasForms[index].get('ifsjr').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.revistasForms[index].patchValue({
          //numero: result.numero,
          titulo: result.titulo,
          autores: result.autores,
          revista: result.revista,
          indice: result.indice,
          doi: result.doi,
          ifsjr: result.ifsjr,
        });
      }
    });
  }

  borrarRevista(index: number) {
    this.revistasForms.splice(index, 1);
  }

  
  
  openAgregarCongresosModal() {
    const dialogRef: MatDialogRef<AgregarCongresoComponent> = this.dialog.open(AgregarCongresoComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const congresoForm = this.formBuilder.group({
          idInformeActividad: [''],
          numero: [result.numero],
          titulo: [result.titulo, Validators.required],
          autores: [result.autores, Validators.required],
          congreso: [result.congreso, Validators.required],
          //indice: [result.indice, Validators.required],
          doi: [result.doi, Validators.required],
          ifSjr: [result.ifSjr, Validators.required],
          cuartil: [result.cuartil, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.congresosForms.push(congresoForm);
      }
    });
  }

  actualizarCongreso(index: number) {
    const dialogRef = this.dialog.open(EditarCongresoComponent, {
      width: '400px',
      data: {
        numero: this.congresosForms[index].get('numero').value,
        titulo: this.congresosForms[index].get('titulo').value,
        autores: this.congresosForms[index].get('autores').value,
        congreso: this.congresosForms[index].get('congreso').value,
        doi: this.congresosForms[index].get('doi').value,
        ifSjr: this.congresosForms[index].get('ifSjr').value,
        cuartil: this.congresosForms[index].get('cuartil').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.congresosForms[index].patchValue({
          numero: result.numero,
          titulo: result.titulo,
          autores: result.autores,
          congreso: result.congreso,
          doi: result.doi,
          ifSjr: result.ifSjr,
          cuartil: result.cuartil,
        });
      }
    });
  }

  borrarCongreso(index: number) {
    this.congresosForms.splice(index, 1);
  }



  openAgregarEjecucionModal() {
    const dialogRef: MatDialogRef<AgregarEjecucionComponent> = this.dialog.open(AgregarEjecucionComponent, {
      width: '400px',
      data: { idInformeActividades: this.informeActividadId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentUser = this.authService.getUserName();
        const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

        const ejecucionForm = this.formBuilder.group({
          idInformeActividades: [''],
          item: [result.item, Validators.required],
          valorAsignado: [result.valorAsignado, Validators.required],
          valorComprometido: [result.valorComprometido, Validators.required],
          valorAcumulado: [result.valorComprometido, Validators.required],
          bienesAdquiridos: [result.bienesAdquiridos, Validators.required],
          usuarioCreacion: [currentUser],
          fechaCreacion: [currentDate],
          usuarioModificacion: [currentUser],
          fechaModificacion: [currentDate]
        });

        this.ejecucionForms.push(ejecucionForm);
      }
    });
  }

  actualizarEjecucion(index: number) {
    const dialogRef = this.dialog.open(EditarEjecucionComponent, {
      width: '400px',
      data: {
        item: this.ejecucionForms[index].get('item').value,
        valorAsignado: this.ejecucionForms[index].get('valorAsignado').value,
        valorComprometido: this.ejecucionForms[index].get('valorComprometido').value,
        valorAcumulado: this.ejecucionForms[index].get('valorAcumulado').value,
        bienesAdquiridos: this.ejecucionForms[index].get('bienesAdquiridos').value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ejecucionForms[index].patchValue({
          item: result.item,
          valorAsignado: result.valorAsignado,
          valorComprometido: result.valorComprometido,
          valorAcumulado: result.valorAcumulado,
          bienesAdquiridos: result.bienesAdquiridos,
        });
      }
    });
  }

  borrarEjecucion(index: number) {
    this.ejecucionForms.splice(index, 1);
  }




  onSubmit() {
    if (this.reporteForm.valid && this.objStrategiesForms.some(form => form.valid) && this.eventsForm.every(form => form.valid)
      && this.projectsForms.every(form => form.valid) && this.posgradosForms.every(form => form.valid)
      && this.librosForms.every(form => form.valid) && this.revistasForms.every(form => form.valid)
      && this.congresosForms.every(form => form.valid) && this.ejecucionForms.every(form => form.valid)
    ) {

      this.activityReportService.createActivityReportForm(this.reporteForm.value).subscribe(
        (reporteResponse: ActivityReport) => {
          this.informeActividadId = reporteResponse.idInformeActividades;

          this.reporteForm.patchValue({
            idInformeActividades: reporteResponse,
          });

          //this.activityReportService.createActivityReportForm(this.reporteForm.value).subscribe(
           // () => {
              this.objStrategiesForms.forEach(objStrategiesForm => {
                objStrategiesForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.objStrategiesService.createObjStrategiesForm(objStrategiesForm.value).subscribe(
                  () => {
                  },
                  (error) => {
                  }
                );
              });

              this.eventsForm.forEach(eventForm => {
                eventForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.eventsService.createEventsForm(eventForm.value).subscribe(
                  () => {
                  },
                  (error) => {
                  }
                );
              });


              this.projectsForms.forEach(projectForm => {
                projectForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.projectService.createResearchProject(projectForm.value).subscribe(
                  () => {
                  },
                  (error) => {
                  }
                );
              });

              this.posgradosForms.forEach(posgradoForm => {
                posgradoForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.posgradoService.createPostGradTesisForm(posgradoForm.value).subscribe(
                  () => {
                  },
                  (error) => {
                  }
                );
              });

              this.titulacionForms.forEach(titulacionForm => {
                titulacionForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.titulacionService.createDegreeTesisForm(titulacionForm.value).subscribe(
                  () => {
                    
                  },
                  (error) => {
                    
                  }
                );
              });

              
              this.librosForms.forEach(libroForm => {
                libroForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.libroService.createBookChaptersForm(libroForm.value).subscribe(
                  () => {
                    
                  },
                  (error) => {
                    
                  }
                );
              });

              
              this.revistasForms.forEach(revistaForm => {
                revistaForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.revistaService.createMagazinesForm(revistaForm.value).subscribe(
                  () => {
                    
                  },
                  (error) => {
                    
                  }
                );
              });

              this.congresosForms.forEach(congresoForm => {
                congresoForm.patchValue({
                  idInformeActividad: reporteResponse
                });

                this.congresoService.createCongressForm(congresoForm.value).subscribe(
                  () => {
                    
                  },
                  (error) => {
                    
                  }
                );
              });

              this.ejecucionForms.forEach(ejecucionForm => {
                ejecucionForm.patchValue({
                  idInformeActividades: reporteResponse
                });

                this.ejecucionService.createBudgetExecuteForm(ejecucionForm.value).subscribe(
                  () => {
                    
                  },
                  (error) => {
                    
                  }
                );
              });

              this.snackBar.open('Los datos se han guardado correctamente', 'Cerrar', {
                duration: 3000

              });

              setTimeout(() => {
                this.router.navigateByUrl('main/principal');
              }, 3000);
            //},
            //(error) => {
            //}
          //);
        },
        (error) => {
        }
      );
    } else {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 3000
      });
    }
  }

  updateActivityReport() {
    if (this.reporteForm.valid) {
      this.activityReportService.update(this.informeActividadId, this.reporteForm.value).subscribe(
        (updatedReport: ActivityReport) => {
        },
        (error) => {
        }
      );
    } else {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 3000 });
    }
  }

  nextStep() {
    if (this.currentStep >= this.strategyStepIndex) {
      const previousStepsCompleted = this.objStrategiesForms.slice(0, this.currentStep).every(form => form.valid);
      if (!previousStepsCompleted) {
        this.snackBar.open('Por favor complete los pasos anteriores antes de avanzar', 'Cerrar', { duration: 3000 });
        return;
      }
    }
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep === this.strategyStepIndex && this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isStepValid(stepIndex: number): boolean {
    if (stepIndex < this.congresosForms.length) {
      return this.congresosForms[stepIndex].valid;
    }
    return true;
  }

}