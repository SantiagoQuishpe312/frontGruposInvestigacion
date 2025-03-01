import { Component, OnInit, Input } from '@angular/core';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { DevelopmentPlanService } from 'src/app/core/http/develop-plan-form/develop-plan-form.service';
import { RelevanceReportService } from 'src/app/core/http/relevance-report/relevance-report.service';
@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
  @Input() id!: number; // Recibimos el id desde el componente padre
  grupo: InvGroupForm; // Almacenamos los datos del grupo
  creationDate: Date;
  steps: { label: string, state: string }[] = []; // Arreglo para los pasos
  events = [
    { date: '', title: '1.- Solicitud de creación de GI', state: '' },
    { date: '', title: '2.- Plan de Desarrollo', state: '' },
    { date: '', title: '3.- Propuesta de creación del GI', state: '' },
    { date: '', title: '4.- Solicitando informe de pertinencia del GI', state: '' },
    { date: '', title: '5.- Validación de Información', state: '' },
    { date: '', title: '6.- Resolución en Consejo de Departamento', state: '' },
    { date: '', title: '7.- Presentación de Solicitud al VITT', state: '' },
    { date: '', title: '8.- Delegando revisión al Comité de Investigación', state: '' },
    { date: '', title: '9.- Resolución en Consejo de Investigación', state: '' },
    { date: '', title: '10.- Remitido al Consejo Académico', state: '' },
    { date: '', title: '11.- Comité Académico emitiendo resolución', state: '' },
    { date: '', title: '12.- El VITT está revisando la resolución de inscripción', state: '' },
  ];
  constructor(private invGroupService: InvGroupService,
    private creationRequestService: CreationReqService,
    private developPlanService: DevelopmentPlanService,
    private relevanceReportService: RelevanceReportService) { }

  ngOnInit(): void {
    // Solicitamos los datos con el ID proporcionado
    this.invGroupService.getById(this.id).subscribe((data) => {
      this.grupo = data;
      this.obtenerFechas();
      this.actualizarEstados(); // Llamamos después de obtener los datos
    });
  }

  obtenerFechas() {
    if (this.grupo.proceso >= '1') {
      this.creationRequestService.getByGroup(this.id).subscribe((data) => {
        this.events[0].date = this.formatearFechas(data.fechaCreacionPeticion);
      });
    }
    if (this.grupo.proceso >= '2') {
      this.developPlanService.getByIdGroupAndType(this.id, 'c').subscribe((data) => {
        this.events[1].date = this.formatearFechas(data[0].fechaCreacionUsuario);
      });
    }
    if (this.grupo.proceso >= '3') {
      this.relevanceReportService.getByGroup(this.id).subscribe((data) => {
        this.events[2].date = this.formatearFechas(data.fechaCreacion);
      });
    }

  }


  formatearFechas(date): string {
    const fecha = new Date(date);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return fechaFormateada
  }
  actualizarEstados() {
    const procesoActual = Number(this.grupo.proceso); // Convertimos el proceso a número
  
    this.events.forEach((event, index) => {
      if (index  < procesoActual) {
        event.state = 'aprobado'; // Pasos anteriores están aprobados
      } else if (index  === procesoActual) {
        event.state = 'revision'; // Paso actual en revisión
      } else {
        event.state = 'pendiente'; // Pasos futuros están pendientes
      }
    });
  }
  
  getEventColor(state: string): string {
    switch (state) {
      case 'aprobado': return '#2e8041'; // Verde
      case 'revision': return '#ffc107'; // Amarillo
      case 'pendiente': return '#dc3545'; // Rojo
      default: return '#6c757d'; // Gris por defecto
    }
  }
}
