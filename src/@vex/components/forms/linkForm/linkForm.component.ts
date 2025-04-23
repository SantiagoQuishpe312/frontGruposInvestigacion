import { Component,Input,OnInit } from "@angular/core";
import { InvGroupService } from "src/app/core/http/inv-group/inv-group.service";
import { LinkService } from "src/app/core/http/link/link.service";
import { UsuarioService } from "src/app/core/http/usuario/usuario.service";
import { Area } from "src/app/types/area.types";
import { LinksComplete } from "src/app/types/link.types";
import { Usuario } from "src/app/types/usuario.types";
@Component({
    selector: 'vex-vinculacion-form-view',
    templateUrl: './linkForm.component.html',
    styleUrls: ['./linkForm.component.scss']
  })
  export class LinkFormComponent implements OnInit{
    @Input() idGrupo!: number;
    @Input() tipo!: string;
    @Input() estado!: string;
    vinculacionForm: LinksComplete | null = null;
    coordinador: Usuario | null = null;
    Area: Area[] = [];
    Usuarios: Usuario[] = [];

    groupName: string = '';

    constructor(
        private linkService:LinkService,
        private groupService: InvGroupService,
        private usuarioService: UsuarioService

    ){}
    ngOnInit(): void {
        this.loadData();
    }
    loadData() {
        this.linkService.getAllByGroup(this.idGrupo, this.estado, this.tipo).subscribe(data => {
          if (Array.isArray(data) && data.length > 0) {
            this.vinculacionForm = data[0];
          } else {
            this.vinculacionForm = data as unknown as LinksComplete;
          }
          
          console.log('Loaded vinculacionForm:', this.vinculacionForm);
          
          if (this.vinculacionForm && this.vinculacionForm.grupoInvestigacion) {
            const grupoInfo = this.vinculacionForm.grupoInvestigacion;
            
            if (grupoInfo.invGroup) {
              this.groupName = grupoInfo.invGroup.nombreGrupoInv;
            }
            
            if (grupoInfo.area && Array.isArray(grupoInfo.area)) {
              this.Area = grupoInfo.area;
            }
            
            if (grupoInfo.coordinador) {
              this.coordinador = grupoInfo.coordinador;
              this.Usuarios = [grupoInfo.coordinador];
            }
          }
        }, error => {
          console.error('Error loading data:', error);
        });
      }
    }