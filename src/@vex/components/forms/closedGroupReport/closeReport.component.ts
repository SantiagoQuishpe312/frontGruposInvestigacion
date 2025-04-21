import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { ClosureService } from 'src/app/core/http/closure/closure.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Annexes } from 'src/app/types/annexes.types';
import { Closure, ClosureComplete } from 'src/app/types/closure.types';

@Component({
  selector: 'vex-informe-cierre',
  templateUrl: './closeReport.component.html',
  styleUrls: ['./closeReport.component.scss']
})
export class InformeCierreComponent implements OnInit {
    @Input() idGrupo!: number;

  anexos: Annexes[] = [];
  annexTypes = [1, 2, 3];
  reporteForm: FormGroup;
  informeCierre:ClosureComplete;
  constructor(
    private closureService: ClosureService,
    private invGroupService: InvGroupService,
    private annexeService: AnnexesService,
    private documentService:DocumentsService,
  ) { }

  ngOnInit(): void {
    this.loadReportsForGroup();
  }



  loadReportsForGroup() {
    this.closureService.getAllByGroup(this.idGrupo).subscribe(reports => {
      this.informeCierre= reports;
      console.log(reports)
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


  getTipoDocumento(idDocumento: number): string {
    switch(idDocumento) {
      case 1: return 'MEMORANDO';
      case 2: return 'SOLICITUD';
      case 3: return 'INFORME';
      default: return 'OTRO';
    }
  }


}
