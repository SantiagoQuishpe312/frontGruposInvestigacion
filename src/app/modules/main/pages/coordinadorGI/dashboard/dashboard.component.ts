import { Component, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { MatDialog } from '@angular/material/dialog';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { Usuario } from 'src/app/types/usuario.types';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'vex-dashboard-coordinator',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
@Injectable({
  providedIn: 'root'
})
export class DashboardCoordinadorComponent implements OnInit { 
  isLinear = true;
  reqFormResponse: any;
  usuarios: any[] = [];
  invGroupExists: boolean = false;
  grupo: InvGroupForm;
  loadingData: boolean = true;
  currentUser: string;
  currentDate: any;
  currentUserId: number;
  idGrupo: number;
  pdfUrl: SafeResourceUrl | undefined;
  token: string;

  constructor(
    private authService: AuthService,
    private apiInvGroupService: InvGroupService,
    private router: Router,
    private dialog: MatDialog,
    private usuarioService: UsuarioService,
    private annexesServices: AnnexesService,
    private documentService: DocumentsService,
    private sanitizer: DomSanitizer,

  ) { this.usuarios = []; }

  ngOnInit(): void {
    this.currentUser = this.authService.getUserName();
    this.currentDate = new Date();
    this.currentUserId = Number(sessionStorage.getItem("userId"));
    this.idGrupo = Number(sessionStorage.getItem("invGroup"));
    this.checkInvGroupInSessionStorage();
    this.token = sessionStorage.getItem('access_token');

  }

 
  //Verificamos si existe un grupo de investigación o se ha empezado algun proceso respecto a la creacion del mismo
  checkInvGroupInSessionStorage() {
    const invGroup = sessionStorage.getItem('invGroup');
    if (invGroup) {
      this.invGroupExists = true;
      this.cargarInfoGrupo(Number(invGroup));
    } else {
      this.invGroupExists = false;
      this.loadCoordinador();
    }
  }
  userCoordinador: Usuario;
  loadCoordinador() {
    this.usuarioService.getByUserName(this.currentUser).subscribe((data: Usuario) => {
      this.userCoordinador = data;
      this.loadingData = false;

    }, error => {
    });
  }
 

  cargarInfoGrupo(id: number) {
    this.apiInvGroupService.getById(id).subscribe(data => {
      this.grupo = data;
      this.loadingData = false;
      if (this.grupo.proceso === 'SolicitaPlanAnual') {
        this.loadMemo(id);
      }
    })
  }

  loadMemo(id: number) {
    this.annexesServices.getByGroupType(id, 'emo_Sol').subscribe((data) => {
      console.log('data', data);
      this.documentService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo).subscribe({
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
      })
    })
    if(this.grupo.proceso === '13'){
      this.annexesServices.getByGroupType(id, 'emo_Solicitud').subscribe((data) => {
        console.log('data', data);
        this.documentService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo).subscribe({
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
        })
      })
    }
  }
  enlace(url: string) {
    this.router.navigateByUrl(`main/${url}`);

  }
}
