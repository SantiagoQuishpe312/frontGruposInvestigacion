import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreationReqService } from 'src/app/core/http/creation-req/creation-req.service';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { CreationReqForm } from 'src/app/types/creationReq.types';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { Usuario } from 'src/app/types/usuario.types';
import { InvGroup_academicDomainService } from 'src/app/core/http/invGroup_academicDomain/invGroup_academicDomain.service';
import { InvGroup_linesService } from 'src/app/core/http/InvGroup_line/invGroup_linesService.service';
import { Line } from 'src/app/types/line.types';
import { LineCreaCompleto } from 'src/app/types/invGroup_line';
import { AcadCreaCompleto } from 'src/app/types/invGroup_academicDomain';
import { CreaAreaCompleto } from 'src/app/types/invGroup_area.types';
import { InvGroup_areaService } from 'src/app/core/http/invGroup_area/crea-area.service';
import { DevelopmentPlanService } from 'src/app/core/http/develop-plan-form/develop-plan-form.service';
import { DevelopmentPlanForms } from 'src/app/types/developPlanForm';
import { LegalFrameworkFilter } from 'src/app/types/deveLega.types';
import { NationalPlanFilter } from 'src/app/types/deveNati.types';
import { UpperLevelPlanFilter } from 'src/app/types/deveUppe.types';
import { DeveLegaService } from 'src/app/core/http/deve-lega/deve-lega.service';
import { DeveNationalService } from 'src/app/core/http/deve-national/deve-national.service'; 
import { DeveUppeService } from 'src/app/core/http/deve-uppe/deve-uppe.service';
import { ObjStrategiesComplete } from 'src/app/types/strategies.types';
import { StrategiesService } from 'src/app/core/http/strategies/strategies.service';
import { ControlPanelForm } from 'src/app/types/controlPanel.types';
import { AnnexesService } from 'src/app/core/http/annexes/annexes.service';
import { ControlPanelService } from 'src/app/core/http/control-panel/control-panel.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importa DomSanitizer y SafeResourceUrl
import { DocumentsService } from 'src/app/core/http/documentos/documents.service';
import { AcademicDomain } from 'src/app/types/academicDomain.types';
import { Area } from 'src/app/types/area.types';
import { NationalPlan } from 'src/app/types/nationalPlan.types';
import { UpperLevelPlan } from 'src/app/types/upperLevelPlan.types';
import { LegalFramework } from 'src/app/types/legalFramework.types';
@Component({
  selector: 'app-solicitud-componente',
  templateUrl: './mostrarSolicitud.component.html',
  styleUrls: ['./obtenerSolicitudes.component.scss']
})
export class MostrarSolicitudForVicerectorA implements OnInit {

  id: number;
  creationReqForm: CreationReqForm;
  invGroup: InvGroupForm;
  usuario: Usuario;
  planDesarrollo: DevelopmentPlanForms
  memberUser: Usuario[] = [];
  member: InvMemberForm[];
  line: Line[];
  acad: AcademicDomain[];
  area: Area[];

  loadingData: boolean = true;
  invGroupId: number ;
  legalFramework: LegalFramework[];
  nationalPlan:NationalPlan[];
  upperLevelPlan: UpperLevelPlan[];
  objStrategies:ObjStrategiesComplete[]=[];
  controlPanel:ControlPanelForm[]=[];
  token:string;
  pdfUrlInforme: SafeResourceUrl | undefined;
  pdfUrl: SafeResourceUrl | undefined;
  pdfUrlCV: any []=[];
  pdfUrlMemo: SafeResourceUrl | undefined;

  constructor(
    private route: ActivatedRoute,
    private solicitudService: CreationReqService,
    private invGroupService: InvGroupService,
    private userService: UsuarioService,
    private invMemberService: InvMemberService,
    private invGroup_linesService: InvGroup_linesService,
    private invGroup_academicDomainService: InvGroup_academicDomainService,
    private invGroup_areaService: InvGroup_areaService,
    private router: Router,
    private developmentService: DevelopmentPlanService,
    private deveLegaService: DeveLegaService, 
    private deveUppeService: DeveUppeService,
    private deveNatiService: DeveNationalService,
    private strategiesService: StrategiesService,
    private controlPanelService: ControlPanelService,
    private annexesService:AnnexesService,
    private documentsService: DocumentsService,
    private sanitizer: DomSanitizer
  ) { /*this.loadingData = true;*/ }

  ngOnInit(): void {

    this.solicitudCreacion()
    this.token=sessionStorage.getItem('access_token');

  }

  solicitudCreacion() {
    this.loadingData = true;
    const navigationState = history.state;
    if (navigationState && navigationState.creationReqForm) {
      this.creationReqForm = navigationState.creationReqForm;
      this.invGroupId=this.creationReqForm.idGrupoInv;
      this.obtenerGrupo(this.creationReqForm.idGrupoInv)
      this.obtenerSegmentosInvestigacion(this.creationReqForm.idPeticionCreacion);
      // Id del formulario de creación que deseas utilizar
      this.obtenerPlanDesarrollo(this.creationReqForm.idGrupoInv);
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
        },
        error: (err) => {
          console.error('Error al cargar el documento:', err);
          
        }
      });
    
    })
  }
  obtenerPlanDesarrollo(id: number) {
    this.developmentService.getByIdGroupAndType(id,'c').subscribe((data) => {
  this.planDesarrollo = data[0];
  console.log("pd",data)
  this.obtenerExtras(data[0].idPlanDesarrollo)
    })
  }
  obtenerExtras(id: number) {
    console.log("id Plan: "+this.planDesarrollo.idPlanDesarrollo)
    this.deveUppeService.getByDev(id).subscribe((data) => {
      this.upperLevelPlan = data;
      console.log(data)
    })
    this.deveNatiService.getByDev(id).subscribe((data) => {
      this.nationalPlan = data;
      console.log(data)

    })
    this.deveLegaService.getByDev(id).subscribe((data) => {
      this.legalFramework = data;
      console.log(data)

    })
    this.strategiesService.getByPlan(id).subscribe((data) => {
      this.objStrategies = data;
      console.log(data)

    })
    this.controlPanelService.getByPlan(id).subscribe((data) => {
      this.controlPanel = data;
      console.log(data)

    })
  }
  obtenerSegmentosInvestigacion(id: number) {
    this.invGroup_linesService.getByGroup(id).subscribe(data => {
      this.line = data;

    });
    this.invGroup_academicDomainService.getByGroup(id).subscribe(data => {
      this.acad = data;
    });
    this.invGroup_areaService.getByGroup(id).subscribe(data => {
      this.area= data;
    });
  }
  obtenerGrupo(id: number) {
    this.invGroupService.getById(id).subscribe(
      (data) => {
        //console.log(data)
        this.invGroup = data
        this.obtenerUsuario(data.idCoordinador)
        this.obtenerMiembros(data.idGrupoInv)
     //   if(data.estadoGrupoInv==='revInfPer'){
          this.cargarInformePertinencia(data.idGrupoInv);
          this.cargarMemo(data.idGrupoInv);
        //}
      }
    )

  }
 cargarMemo(id:number){
  this.annexesService.getByGroupType(id,'memo_Comite_VITT').subscribe((data)=>{
    console.log('ann',data);
    this.documentsService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo)
    .subscribe({
      next: (blob) => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        this.pdfUrlMemo = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Marcar la URL como segura
      },
      error: (err) => {
        console.error('Error al cargar el documento:', err);
        
      }
    });
  
  })
 }
  cargarInformePertinencia(id:number){
    this.annexesService.getByGroupType(id,'Informe_Pertinencia_Grupo').subscribe((data)=>{
      console.log('ann',data);
      this.documentsService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo)
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          this.pdfUrlInforme = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Marcar la URL como segura
        },
        error: (err) => {
          console.error('Error al cargar el documento:', err);
          
        }
      });
    
    })
  }
  obtenerUsuario(id: number) {
    this.userService.getById(id).subscribe(
      (data) => {
        this.usuario = data;
        //console.log(data);
      }
    )
  }

  obtenerMiembros(id: number) {
    this.invMemberService.getAllByGroupId(id).subscribe(
      (data)=>{
        this.memberUser=data;
        this.loadingData = false;
      this.obtenerCV(id)  ;
      } 
    )
  }
  obtenerCV(id: number) {
    this.memberUser.forEach(element => {
      console.log(element.usuario)
      this.annexesService.getByGroupType(id, element.usuario).subscribe((data) => {
        console.log('ann', data);
          this.documentsService.getDocument(this.token, data[0].rutaAnexo, data[0].nombreAnexo)
          .subscribe({
            next: (blob) => {
              const pdfBlob = new Blob([blob], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(pdfBlob);
              
              // Guardar la URL en el arreglo
              const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
              this.pdfUrlCV.push(safeUrl); // Agregar la URL segura al arreglo
              
              console.log('PDF URL guardada:', safeUrl);
            },
            error: (err) => {
              console.error('Error al cargar el documento:', err);
            }
          });
        
      });
    });
  }
  validarGrupo(ruta: string) {
    const navigationState = history.state;
    const creationReqForm = navigationState.creationReqForm;
  
    // Concatenar "main/" con la variable ruta
    this.router.navigate([`main/${ruta}`], { state: { creationReqForm } });
  }
  
}
