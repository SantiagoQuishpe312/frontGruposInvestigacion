import { Component, OnInit } from '@angular/core';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { Router } from '@angular/router';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';


@Component({
    selector: 'app-solicitud-list',
    templateUrl: './obtenerSolicitudes.component.html',
    styleUrls: ['./obtenerSolicitudes.component.scss'],
})
export class SolicitudesForDirectorComponent implements OnInit {
    creationReq: CreationReqForm[] = [];
    grupos: InvGroupForm[] = [];
    usuarios: any[] = [];
    loadingData: boolean = true;
    coordinador: any[] = [];
    grupoComplete: InvGroupCompleteForm[];
    grupoComplete2: InvGroupCompleteForm[];
    nombreCoor: string;
    departmentUser: string;
    noSolicitudesPendientes: boolean = false;
    noSolicitudesPendientes2: boolean = false;
    constructor(
        private router: Router,
        private solicitudService: CreationReqService,
        private invGroupService: InvGroupService,
    ) { }

    ngOnInit() {

        this.departmentUser = sessionStorage.getItem('departamento');
        this.getGrupo();
        this.getGrupo2();//Para hacer otra consulta con un proceso diferente
    }
    getGrupo() {
        if (this.departmentUser) {
            this.invGroupService.getByProcessDepartment('3', this.departmentUser).subscribe({
                next: (data) => {
                    this.grupoComplete = data;
                    this.loadingData = false;
                    this.verificarSolicitudes();
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

    getGrupo2() {
        if (this.departmentUser) {
            this.invGroupService.getByProcessDepartment('5', this.departmentUser).subscribe({
                next: (data) => {
                    this.grupoComplete2 = data;
                    this.loadingData = false;
                    this.verificarSolicitudes2();
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
    verificarSolicitudes() {
        if (this.grupoComplete.length > 0) {
            this.noSolicitudesPendientes = false;
        } else {
            this.noSolicitudesPendientes = true;
        }


    }

    verificarSolicitudes2() {
        if (this.grupoComplete2.length > 0) {
            this.noSolicitudesPendientes2 = false;
        } else {
            this.noSolicitudesPendientes2 = true;
        }


    }

    validar(id: number) {
        localStorage.setItem('GI', id.toString());
        this.router.navigate(['main/solicitud-dir']);

    }
    validar2(id: number) {
        localStorage.setItem('GI', id.toString());
        this.router.navigate(['main/solDir2']);
    }

}
