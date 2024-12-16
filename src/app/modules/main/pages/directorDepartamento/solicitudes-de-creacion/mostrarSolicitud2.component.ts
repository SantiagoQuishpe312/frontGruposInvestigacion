import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { Usuario } from 'src/app/types/usuario.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importa DomSanitizer y SafeResourceUrl
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';

@Component({
  selector: 'app-solicitud-componente',
  templateUrl: './mostrarSolicitud2.component.html',
  styleUrls: ['./obtenerSolicitudes.component.scss']
})
export class MostrarSolicitudForDirector2 implements OnInit {

  id: number;
idPlanDesarrollo: number;
  creationReqForm: CreationReqForm;
  invGroup: InvGroupForm;
  usuario: Usuario;
  memberUser: Usuario[] = [];
  member: InvMemberForm[];
  idSolicitud: number;
  loadingData: boolean = true;
  invGroupId: number ;
  token:string;
  pdfUrlInforme: SafeResourceUrl | undefined;
  pdfUrl: SafeResourceUrl | undefined;
  pdfUrlCV: any []=[];
  constructor(
    private router: Router,
    private annexesService:AnnexesService,
    private documentsService: DocumentsService,
    private sanitizer: DomSanitizer,
  ) { /*this.loadingData = true;*/ }

  ngOnInit(): void {
    const navigationState = history.state;
    this.idSolicitud=navigationState.creationReqForm.idPeticionCreacion;
    this.solicitudCreacion()
    this.token=sessionStorage.getItem('access_token');
  }
  solicitudCreacion() {
    this.loadingData = true;
    const navigationState = history.state;
    if (navigationState && navigationState.creationReqForm) {
      this.creationReqForm = navigationState.creationReqForm;
      this.invGroupId=this.creationReqForm.idGrupoInv;
      this.obtenerAnexos(this.creationReqForm.idGrupoInv);
    } else {
      this.loadingData = false;
    }
  }
  obtenerAnexos(id:number){
    this.annexesService.getByGroupType(id,'propuesta').subscribe((data)=>{
      console.log('ann',data);
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
  const navigationState = history.state;
  const creationReqForm = navigationState.creationReqForm;
  this.router.navigate([`main/${ruta}`], { state: { creationReqForm } });
}

}