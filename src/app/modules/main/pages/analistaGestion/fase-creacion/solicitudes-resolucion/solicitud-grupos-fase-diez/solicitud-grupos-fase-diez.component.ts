import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvGroupCompleteForm, InvGroupForm } from 'src/app/types/invGroup.types';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';

@Component({
  selector: 'vex-solicitud-grupos-fase-diez',
  templateUrl: './solicitud-grupos-fase-diez.component.html',
  styleUrls: ['./solicitud-grupos-fase-diez.component.scss']
})
export class SolicitudGruposFaseDiezComponent implements OnInit {
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
    this.invGroupService.getByProcess('9').subscribe({
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
    this.router.navigate(['main/solicitud-aprobada']);

}

}
