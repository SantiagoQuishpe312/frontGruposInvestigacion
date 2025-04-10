import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { ClosureRequestService } from 'src/app/core/http/closure-request/closure-request.service';
import { ClosureService } from 'src/app/core/http/closure/closure.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { UnsatisfactoryService } from 'src/app/core/http/unsatisfactory/unsatisfactory.service';
import { Annexes } from 'src/app/types/annexes.types';
import { Closure } from 'src/app/types/closure.types';

@Component({
  selector: 'vex-ver-informe-cierre',
  templateUrl: './ver-informe-cierre.component.html',
  styleUrls: ['./ver-informe-cierre.component.scss']
})
export class VerInformeCierreComponent implements OnInit {

  anexos: Annexes[] = [];
  annexTypes = [1, 2, 3];
    reportes: Closure[] = [];
  infCierre: any[];
  reporteForm: FormGroup;
  informesCierre: any[];
  solicitudes: any[];
  evaluaciones: any[];
  idInforme: number;
  idGrupo: number;
  
  constructor(
    private closureService: ClosureService,
    private closureRequestService: ClosureRequestService,
    private unsatisfactoryService: UnsatisfactoryService,
    private invGroupService: InvGroupService,
    private datePipe: DatePipe,

    private annexeService: AnnexesService
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
        this.loadReportsForGroup();

      } else {
      }
    }, error => {
    });
  }

  loadReportsForGroup() {
    this.closureService.getAll().subscribe(reports => {
      this.informesCierre = reports.filter(report => report.idGrupoInvestigacion === this.idGrupo);

      if (this.informesCierre.length > 0) {
        this.idInforme= this.informesCierre[0].idInforme;
        this.loadRelatedData();
      } else {
      }
    }, error => {
    });
  }

  loadAnnexes() {
    const requests = this.annexTypes.map(typeId =>
      this.annexeService.getByGroupType(this.idGrupo, typeId.toString())
    );
    
    forkJoin(requests).subscribe(results => {
      this.anexos = results.flat();
    });
  }

  loadReports() {
    this.closureService.getAll().subscribe(reports => {
      this.infCierre = reports.filter(rep => rep.id=== this.idInforme);
    });
  }

  loadClosureRequest() {
    this.closureRequestService.getAll().subscribe(closureReq => {
      this.solicitudes = closureReq.filter(cr => cr.idCierre === this.idInforme);
      this.solicitudes.forEach(closureR => {
        closureR.fecha = this.datePipe.transform(closureR.fecha, 'yyyy-MM-dd');
      });
    });
  }

  loadUnsatisfactory() {
    this.unsatisfactoryService.getAll().subscribe(unsatisfactory => {
      this.evaluaciones = unsatisfactory.filter(un => un.idCierre === this.idInforme);
      this.evaluaciones.forEach(unstf => {
        unstf.fecha = this.datePipe.transform(unstf.fecha, 'yyyy-MM-dd');
      });
    });
  }

  onChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.idInforme = parseInt(id);
    this.loadRelatedData();
  }
  loadRelatedData() {
    this.loadReports();
    this.loadClosureRequest();
    this.loadUnsatisfactory();
    this.loadAnnexes();
  }

  getTipoDocumento(idDocumento: number): string {
    switch(idDocumento) {
      case 1: return 'MEMORANDO';
      case 2: return 'SOLICITUD';
      case 3: return 'INFORME';
      default: return 'OTRO';
    }
  }

  getAllReports() {
    this.closureService.getAll().subscribe(reports => {
      this.infCierre= reports;
    });
  }


}
