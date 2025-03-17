import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';

@Component({
    selector: 'app-solicitud-list',
    templateUrl: './obtenerSolicitudes.component.html',
    styleUrls: ['./obtenerSolicitudes.component.scss'],
})
export class SolicitudesForConsejoComponent implements OnInit {
    grupos: InvGroupForm[] = [];
    usuarios: any[] = [];
    loadingData: boolean = true;
    coordinador: any[] = [];
    grupoComplete: InvGroupCompleteForm[];
    departmentUser: string;
    noSolicitudesPendientes: boolean = false;
    constructor(
        private router: Router,
        private invGroupService: InvGroupService,
    ) { }

    ngOnInit(): void {
        this.getGrupo();

    }
    getGrupo() {
        this.invGroupService.getByProcess('10').subscribe({
            next: (data) => {
                this.grupoComplete = data;
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
        this.router.navigate(['main/solicitud-con']);


    }

}
