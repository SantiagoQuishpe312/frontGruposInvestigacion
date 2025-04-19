import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Usuario } from 'src/app/types/usuario.types';
@Component({
    selector: 'app-solicitud-list',
    templateUrl: './obtenerSolicitudes.component.html',
    styleUrls: ['./obtenerSolicitudes.component.scss'],
})
export class SolicitudesComponent30 implements OnInit {
    solicitudesFiltradas: CreationReqForm[] = [];
    noSolicitudesPendientes: boolean = false;
    grupos: InvGroupForm[] = [];
    usuarios: any[] = [];
    loadingData: boolean = true;
    coordinador: Usuario;
    grupoComplete: InvGroupForm[];
    nombreCoor: string;
    departmentUser: string;

    constructor(
        private router: Router,
        private invGroupService: InvGroupService,
    ) { }

    ngOnInit() {
        this.getGrupo();
    }

    getGrupo() {
            this.invGroupService.getAll().subscribe({
                next: (data) => {
                    this.grupos = data;
                    this.loadingData = false;
                },
                error: (err) => {
                    console.error('Error al obtener el grupo:', err);
                    this.loadingData = false;
                }
            });
    }

    validar(id: number) {
        localStorage.setItem('GI', id.toString());

        this.router.navigate(['main/fase-cierre']);

    }

}
