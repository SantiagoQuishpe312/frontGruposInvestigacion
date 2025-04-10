import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { Usuario } from 'src/app/types/usuario.types';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'vex-solicitud-informes',
  templateUrl: './solicitud-informes.component.html',
  styleUrls: ['./solicitud-informes.component.scss']
})
export class SolicitudInformesComponent implements OnInit {

    noSolicitudesPendientes: boolean = false;
    grupos: InvGroupForm[] = [];
    usuarios: any[] = [];
    isLoading: boolean = true;
    coordinador: Usuario;
    grupoComplete: InvGroupCompleteForm[];
    nombreCoor: string;

  constructor(
    private router: Router,
    private invGroupService: InvGroupService,
    private dialog: MatDialog,
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
                this.dialog.open(err, {
                    width: '250px',
                    data: {
                        title: 'Error',
                        message: 'No se pudo obtener el grupo',
                    }
                });
            }
        });
  
}

solicitar(id: number) {
    localStorage.setItem('GI', id.toString());

    this.router.navigate(['main/memorando-sol-informes']);

}

}
