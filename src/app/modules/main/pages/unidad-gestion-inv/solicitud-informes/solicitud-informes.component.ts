import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Usuario } from 'src/app/types/usuario.types';

@Component({
  selector: 'vex-solicitud-informes',
  templateUrl: './solicitud-informes.component.html',
  styleUrls: ['./solicitud-informes.component.scss']
})
export class SolicitudInformesComponent implements OnInit {

  solicitudesFiltradas: CreationReqForm[] = [];
    noSolicitudesPendientes: boolean = false;
    grupos: InvGroupForm[] = [];
    usuarios: any[] = [];
    loadingData: boolean = true;
    coordinador: Usuario;
    grupoComplete: InvGroupCompleteForm[];
    nombreCoor: string;
    departmentUser: string;

  constructor(
    private router: Router,
    private invGroupService: InvGroupService,
  ) { }

  ngOnInit() {
    this.departmentUser = sessionStorage.getItem('departamento');
    this.getGrupo();
}

getGrupo() {
    if (this.departmentUser) {
        this.invGroupService.getByProcessDepartment('12', this.departmentUser).subscribe({
            next: (data) => {
                this.grupoComplete = data;
                this.loadingData = false;
            },
            error: (err) => {
                console.error('Error al obtener el grupo:', err);
                this.loadingData = false;
            }
        });
    } else {
        console.warn('El departamento del usuario no está definido.');
        this.loadingData = false;
    }
}

solicitar(id: number) {
    localStorage.setItem('GI', id.toString());

    this.router.navigate(['main/memorando-sol-informes']);

}

}
