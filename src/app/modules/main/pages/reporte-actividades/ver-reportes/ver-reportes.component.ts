import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivityReportService } from 'src/app/core/http/activity-report/activity-report.service';
//import { InvgActiService } from 'src/app/core/http/invg-acti/invg-acti.service';
import { ObjStrategiesService } from 'src/app/core/http/obj-strategies/obj-strategies.service';
import { EventsService } from 'src/app/core/http/events/events.service';
import { ActivityReport } from 'src/app/types/activityReport.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { ResearchProjectService } from 'src/app/core/http/research-project/research-project.service';
import { PostGradTesisService } from 'src/app/core/http/postGrad-tesis/post-grad-tesis.service';
import { DegreeTesisService } from 'src/app/core/http/degree-tesis/degree-tesis.service';
import { BookChapterService } from 'src/app/core/http/book-chapter/book-chapter.service';
import { MagazinesService } from 'src/app/core/http/magazines/magazines.service';
import { CongressService } from 'src/app/core/http/congress/congress.service';
import { BudgetExecuteService } from 'src/app/core/http/budget-execute/budget-execute.service';

@Component({
  selector: 'vex-ver-reportes',
  templateUrl: './ver-reportes.component.html',
  styleUrls: ['./ver-reportes.component.scss']
})
export class VerReportesComponent implements OnInit {
  reportes: ActivityReport[] = [];
  repAct: any[];
  reporteForm: FormGroup;
  //invgActiForm: FormGroup;
  activityReports: any[];
  objetivos: any[];
  eventos: any[];
  proyectos: any[];
  posgrados: any[];
  titulaciones: any[];
  capitulosLibros: any[];
  revistas: any[];
  congresos: any[];
  presupuestos: any[];
  informeActividadId: number;
  idGrupo: number;

  constructor(
    private activityReportService: ActivityReportService,
    //private invgActiService: InvgActiService,
    private objStrategiesService: ObjStrategiesService,
    private eventsService: EventsService,
    private datePipe: DatePipe,
    private invGroupService: InvGroupService,
    private projectService: ResearchProjectService,
    private posgradoService: PostGradTesisService,
    private titulacionService: DegreeTesisService,
    private libroService: BookChapterService,
    private revistaService: MagazinesService,
    private congresoService: CongressService,
    private ejecucionService: BudgetExecuteService,
  ) { }

  ngOnInit(): void {
    this.getUserIdAndLoadReports();
  }

  getUserIdAndLoadReports() {
    const userId = Number(sessionStorage.getItem('userId'));
    this.invGroupService.getAll().subscribe(groups => {
      const userGroup = groups.find(group => group.idCoordinador === userId);
      if (userGroup) {
        this.idGrupo = userGroup.idGrupoInv;
        //this.getInvgActiAndLoadReports();
        this.loadReportsForGroup();

      } else {
      }
    }, error => {
    });
  }

/*
  getInvgActiAndLoadReports() {
    this.invgActiService.getAll().subscribe(invgActis => {
      const invgActiGroupIds = invgActis.filter(acti => acti.idGrupoInv === this.idGrupoInv)
        .map(acti => acti.idInformeActividades);
      if (invgActiGroupIds.length > 0) {
        this.loadReportsAndRelatedData(invgActiGroupIds);
        if (invgActiGroupIds[0]) {
          this.informeActividadId = invgActiGroupIds[0];
          this.loadRelatedData();
        }
      } else {
      }
    }, error => {
    });
  }
*/

loadReportsForGroup() {
  this.activityReportService.getAll().subscribe(reports => {
    // Filter reports for the current group
    this.activityReports = reports.filter(report => report.idGrupo === this.idGrupo);
    
    if (this.activityReports.length > 0) {
      // Set the first report as default
      this.informeActividadId = this.activityReports[0].idInformeActividades;
      this.loadRelatedData();
    } else {
      // Handle case where no reports found
    }
  }, error => {
    // Handle error
  });
}

/*
  loadReportsAndRelatedData(informeActividadIds: number[]) {
    this.activityReportService.getAll().subscribe(reports => {
      this.activityReports = reports.filter(rep => informeActividadIds.includes(rep.idInformeActividades));
      this.loadReports();
      this.loadEvents();
      this.loadObjectives();
      this.loadProjects();
      this.loadPostgraduates();
      this.loadDegreeTheses();
      this.loadBookChapters();
      this.loadMagazines();
      this.loadCongresses();
      this.loadBudgetExecutions();
    });
    this.repAct = informeActividadIds;
  }


  loadReports() {
    this.activityReportService.getAll().subscribe(repAct => {
      this.repAct = repAct.filter(rep => rep.idInformeActividades === this.informeActividadId);
    });
  }*/

    loadReports() {
      this.activityReportService.getAll().subscribe(reports => {
        this.repAct = reports.filter(rep => rep.idInformeActividades === this.informeActividadId);
      });
    }

  loadEvents() {
    this.eventsService.getAll().subscribe(events => {
      this.eventos = events.filter(ev => ev.idInformeActividades === this.informeActividadId);
      this.eventos.forEach(evento => {
        evento.fecha = this.datePipe.transform(evento.fecha, 'yyyy-MM-dd');
      });
    });
  }

  loadObjectives() {
    this.objStrategiesService.getAll().subscribe(objetivos => {
      this.objetivos = objetivos.filter(obj => obj.idInformeActividades === this.informeActividadId);
      console.log('Objetivos:', this.objetivos);
    });
  }

  loadProjects() {
    this.projectService.getAll().subscribe(proyectos => {
      this.proyectos = proyectos.filter(pr => pr.idInformeActividades === this.informeActividadId);
    });
  }

  loadPostgraduates() {
    this.posgradoService.getAll().subscribe(posgrados => {
      this.posgrados = posgrados.filter(pos => pos.idInformeActividades === this.informeActividadId);
    });
  }

  loadDegreeTheses() {
    this.titulacionService.getAll().subscribe(titulaciones => {
      this.titulaciones = titulaciones.filter(ti => ti.idInformeActividades === this.informeActividadId);
    });
  }

  loadBookChapters() {
    this.libroService.getAll().subscribe(capitulosLibros => {
      this.capitulosLibros = capitulosLibros.filter(lib => lib.idInformeActividades === this.informeActividadId);
    });
  }

  loadMagazines() {
    this.revistaService.getAll().subscribe(revistas => {
      this.revistas = revistas.filter(rev => rev.idInformeActividades === this.informeActividadId);
    });
  }

  loadCongresses() {
    this.congresoService.getAll().subscribe(congresos => {
      this.congresos = congresos.filter(congr => congr.idInformeActividad === this.informeActividadId);
    });
  }

  loadBudgetExecutions() {
    this.ejecucionService.getAll().subscribe(presupuestos => {
      this.presupuestos = presupuestos.filter(pr => pr.idInformeActividades === this.informeActividadId);
    });
  }
  onChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.informeActividadId = parseInt(id);
    this.loadRelatedData();
  }
  loadRelatedData() {
    this.loadReports();
    this.loadEvents();
    this.loadObjectives();
    this.loadProjects();
    this.loadPostgraduates();
    this.loadDegreeTheses();
    this.loadBookChapters();
    this.loadMagazines();
    this.loadCongresses();
    this.loadBudgetExecutions();
  }

  getAllReports() {
    this.activityReportService.getAll().subscribe(reports => {
      this.activityReports = reports;
    });
  }

}
