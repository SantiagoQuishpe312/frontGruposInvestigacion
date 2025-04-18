import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { Usuario } from 'src/app/types/usuario.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importa DomSanitizer y SafeResourceUrl
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
@Component({
  selector: 'vex-grupos-para-resolucion',
  templateUrl: './grupos-para-resolucion.component.html',
  styleUrls: ['./grupos-para-resolucion.component.scss']
})
export class GruposParaResolucionComponent implements OnInit {
  id: number;
  idPlanDesarrollo: number;
  creationReqForm: CreationReqForm;
  invGroup: InvGroupForm;
  usuario: Usuario;
  memberUser: Usuario[] = [];
  member: InvMemberForm[];
  idSolicitud: number;
  loadingData: boolean = true;
  invGroupId: number;
  token: string;
  pdfUrlInforme: SafeResourceUrl | undefined;
  pdfUrl: SafeResourceUrl | undefined;
  pdfUrlCV: any[] = [];
  cvUrl:SafeResourceUrl | undefined;
  constructor(
    private router: Router,
    private annexesService: AnnexesService,
    private documentsService: DocumentsService,
    private sanitizer: DomSanitizer,
    private creationReqService: CreationReqService,
         
) { /*this.loadingData = true;*/}

ngOnInit(): void {
  this.solicitudCreacion()
  this.token = sessionStorage.getItem('access_token');
}

solicitudCreacion() {
  this.loadingData = true;
  this.invGroupId = Number(localStorage.getItem('GI'));
  if (this.invGroupId) {
    this.creationReqService.getByGroup(this.invGroupId).subscribe((data) => {
      this.creationReqForm = data;
    });
    this.obtenerAnexos(this.invGroupId);
  } else {
    this.loadingData = false;
  }
}
obtenerAnexos(id: number) {
  this.annexesService.getByGroupType(id,`resolucion_consejo_acad_${id}`).subscribe((data) => {
    this.documentsService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo)
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Marcar la URL como segura
          this.loadingData = false;

        },
        error: (err) => {
          console.error('Error al cargar el documento:', err);
          this.loadingData = false;

        }
      });

  })
}

validarGrupo(ruta: string) {
  if (localStorage.getItem('GI')) {
    this.router.navigate([`main/${ruta}`]);
  } else {
    localStorage.setItem('GI', this.invGroupId.toString());
    this.router.navigate([`main/${ruta}`]);
  }
}

}
