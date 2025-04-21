import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { Usuario } from 'src/app/types/usuario.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importa DomSanitizer y SafeResourceUrl
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
@Component({
  selector: 'app-solicitud-componente',
  templateUrl: './mostrarSolicitud.component.html',
  styleUrls: ['./obtenerSolicitudes.component.scss']
})
export class MostrarSolicitud36 implements OnInit {

  id: number;
  invGroup: InvGroupForm;
  usuario: Usuario;
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
    this.token = sessionStorage.getItem('access_token');
    this.invGroupId = Number(localStorage.getItem('GI'));
  }

  


  obtenerAnexos(id: number) {
    this.annexesService.getByGroupType(id, 'propuesta').subscribe((data) => {
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
  /*validarGrupo(){
    const navigationState = history.state;
    const creationReqForm = navigationState.creationReqForm;
    this.router.navigate(["main/ficha"],{state:{creationReqForm}})
  }*/
}
