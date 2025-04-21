import { Component,Input,OnInit } from "@angular/core";
import { AssetsReportService } from "src/app/core/http/assets-report/assets-report.service";
import { AssetsReportComplete } from "src/app/types/assetsReport.types";

@Component({
    selector: 'vex-reporte-bienes',
    templateUrl: './assetsReport.component.html',
    styleUrls: ['./assetsReport.component.scss']
  })
  export class ReporteBienesComponent implements OnInit{
    @Input() idGrupo!: number;
    informeBienes:AssetsReportComplete;
    constructor(
        private assetsReportService:AssetsReportService,
    ){}
    ngOnInit(): void {
        this.loadData();
        console.log(this.idGrupo);
    }
    loadData(){
        this.assetsReportService.getAllByGroup(this.idGrupo).subscribe(data=>{
            this.informeBienes=data;
            console.log(data);
        })
    }
  }