import { Component,Input,OnInit } from "@angular/core";
import { AssetsReportService } from "src/app/core/http/assets-report/assets-report.service";
import { InvGroupService } from "src/app/core/http/inv-group/inv-group.service";
import { AssetesDetails } from "src/app/types/assetesDetails.types";
import { AssetsReport, AssetsReportComplete } from "src/app/types/assetsReport.types";

@Component({
    selector: 'vex-reporte-bienes',
    templateUrl: './assetsReport.component.html',
    styleUrls: ['./assetsReport.component.scss']
  })
  export class ReporteBienesComponent implements OnInit{
    @Input() idGrupo!: number;
    assetsReports: AssetsReport[] = [];
    AssetDetails: AssetesDetails[] = [];
    groupName: string = '';

    constructor(
        private assetsReportService:AssetsReportService,
        private groupService: InvGroupService
    ){}
    ngOnInit(): void {
        this.loadData();
        this.loadGroupInfo();
        console.log(this.idGrupo);
    }
    loadData(){
        this.assetsReportService.getAllByGroup(this.idGrupo).subscribe(data=>{
            this.assetsReports = [data.reporteBienes];
            this.AssetDetails = data.detalleBienes;
            console.log(data);
        })
    }

    loadGroupInfo() {
        this.groupService.getById(this.idGrupo).subscribe(group => {
          this.groupName = group.nombreGrupoInv;
          console.log('Nombre del grupo:', this.groupName);
        }, error => {
          console.error('Error al cargar la información del grupo:', error);
        });
      }

    onChange(event: any) {
        const selectedReportId = event.target.value;
    }
  }