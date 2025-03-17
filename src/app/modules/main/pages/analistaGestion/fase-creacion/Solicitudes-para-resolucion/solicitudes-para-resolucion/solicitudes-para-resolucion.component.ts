import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';

@Component({
  selector: 'vex-solicitudes-para-resolucion',
  templateUrl: './solicitudes-para-resolucion.component.html',
  styleUrls: ['./solicitudes-para-resolucion.component.scss']
})
export class SolicitudesParaResolucionComponent implements OnInit {
  grupos: InvGroupForm[] = [];
  usuarios: any[] = [];
  loadingData: boolean = true;
  coordinador: any[] = [];
  grupoComplete: InvGroupCompleteForm[];
  grupoComplete2: InvGroupCompleteForm[];
  nombreCoor: string;
  departmentUser: string;
  noSolicitudesPendientes: boolean = false;
  constructor(private router: Router,
    private invGroupService: InvGroupService,) { }

    ngOnInit() {
      this.getGrupo();
  }

  getGrupo() {
      this.invGroupService.getByProcess('11').subscribe({
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
      this.router.navigate(['main/grupo-resolucion']);

  }


}
