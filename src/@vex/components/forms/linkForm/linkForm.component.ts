import { Component,Input,OnInit } from "@angular/core";
import { InvGroupService } from "src/app/core/http/inv-group/inv-group.service";
import { LinkService } from "src/app/core/http/link/link.service";
import { LinksComplete } from "src/app/types/link.types";
@Component({
    selector: 'vex-vinculacion-form-view',
    templateUrl: './linkForm.component.html',
    styleUrls: ['./linkForm.component.scss']
  })
  export class LinkFormComponent implements OnInit{
    @Input() idGrupo!: number;
    @Input() tipo!: string;
    @Input() estado!: string;
    vinculacionForm: LinksComplete;
    groupName: string = '';

    constructor(
        private linkService:LinkService,
        private groupService: InvGroupService
    ){}
    ngOnInit(): void {
        this.loadData();
    }
    loadData(){
        this.linkService.getAllByGroup(this.idGrupo,this.estado,this.tipo).subscribe(data=>{
            //this.vinculacionForm = data;
            console.log(data);
        })
    }


  }