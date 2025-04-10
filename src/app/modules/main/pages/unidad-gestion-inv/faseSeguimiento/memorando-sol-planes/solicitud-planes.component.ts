import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Usuario } from 'src/app/types/usuario.types';

@Component({
  selector: 'vex-solicitud-planes',
  templateUrl: './solicitud-planes.component.html',
  styleUrls: ['./solicitud-planes.component.scss']
})
export class SolicitudPlanesComponent implements OnInit {
  solicitudesFiltradas: CreationReqForm[] = [];
    noSolicitudesPendientes: boolean = false;
    grupos: InvGroupForm[] = [];
    usuarios: any[] = [];
    isLoading: boolean = true;
    coordinador: Usuario;
    grupoComplete: InvGroupCompleteForm[];
    nombreCoor: string;
    displayedColumns: string[] = ['numero', 'grupo', 'coordinador', 'acciones'];

  constructor(
    private router: Router,
    private invGroupService: InvGroupService,
  ) { }

  ngOnInit() {
    this.getGrupo();
}

getGrupo() {
        this.invGroupService.getByProcess('12').subscribe({
            next: (data) => {
                this.grupoComplete = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al obtener el grupo:', err);
                this.isLoading = false;
            }
        });
 
}

solicitar(id: number) {
    localStorage.setItem('GI', id.toString());

    this.router.navigate(['main/memorando-sol-planes']);
}

}
