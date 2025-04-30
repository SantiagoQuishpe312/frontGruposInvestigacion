import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { Usuario } from 'src/app/types/usuario.types';
import { DevelopmentPlanService } from 'src/app/core/http/develop-plan-form/develop-plan-form.service';
import { DevelopmentPlanForms } from 'src/app/types/developPlanForm';
import { LegalFrameworkFilter } from 'src/app/types/deveLega.types';
import { NationalPlanFilter } from 'src/app/types/deveNati.types';
import { UpperLevelPlanFilter } from 'src/app/types/deveUppe.types';
import { DeveLegaService } from 'src/app/core/http/deve-lega/deve-lega.service';
import { DeveNationalService } from 'src/app/core/http/deve-national/deve-national.service'; 
import { DeveUppeService } from 'src/app/core/http/deve-uppe/deve-uppe.service';
import { ObjStrategiesComplete } from 'src/app/types/strategies.types';
import { ControlPanelForm } from 'src/app/types/controlPanel.types';
import { ControlPanelService } from 'src/app/core/http/control-panel/control-panel.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importa DomSanitizer y SafeResourceUrl
import { catchError, map, Observable, of,forkJoin } from 'rxjs';
import { SpecificObjetivesService } from 'src/app/core/http/specific-objetives/specific-objetives.service';
import { InstStrategicObj } from 'src/app/types/InstStrategicObj.types';
import { InstStrategicObjService } from 'src/app/core/http/instStrategicObj/inst-strategic-obj.service';
import { ObjectiveCompleteOds } from 'src/app/types/obj_strategies_ods.types';
import { ObjStrategiesODSService } from 'src/app/core/http/obj_strategies_ods/obj_strategies_ods.service';
@Component({
  selector: 'app-developmentPlanForm-component',
  templateUrl: './developmentPlanForm.component.html',
  styleUrls: ['./developmentPlanForm.component.scss']
})
export class DevelopPlanFormComponent implements OnInit {

    @Input() id!: number;
  invGroup: InvGroupForm;
  usuario: Usuario;
  planDesarrollo: DevelopmentPlanForms
  memberUser: Usuario[] = [];
  member: InvMemberForm[];
  loadingData: boolean = true;
  invGroupId: number ;
  legalFramework: LegalFrameworkFilter;
  nationalPlan:NationalPlanFilter;
  upperLevelPlan: UpperLevelPlanFilter;
  objStrategies:ObjStrategiesComplete[]=[];
  controlPanel:ControlPanelForm[]=[];
  specificObj:ObjectiveCompleteOds[]=[];
  token:string;
  planDesarrolloVigente:DevelopmentPlanForms[];
  constructor(
    private invGroupService: InvGroupService,
    private userService: UsuarioService,
    private invMemberService: InvMemberService,
    private developmentService: DevelopmentPlanService,
    private deveLegaService: DeveLegaService, 
    private deveUppeService: DeveUppeService,
    private deveNatiService: DeveNationalService,
    private controlPanelService: ControlPanelService,
    private specificObjService: SpecificObjetivesService,
private instStrategicService:InstStrategicObjService,
private objStrategiesODSService:ObjStrategiesODSService,
  ) { /*this.loadingData = true;*/ }

  ngOnInit(): void {
    console.log("id plan ",this.id)
    this.planDesarrolloVigente = JSON.parse(localStorage.getItem('planDesarrollo'));
    this.obtenerPlanDesarrollo(this.id)
  }

  obtenerPlanDesarrollo(id: number) {
    let tipo='c';
  if(this.planDesarrolloVigente){
    tipo=this.planDesarrolloVigente[0].tipo;
  }
  this.developmentService.getByIdGroupAndType(id,tipo).subscribe((data) => {
  this.planDesarrollo = data[0];
  this.obtenerExtras(data[0].idPlanDesarrollo)
  this.cargarObjInstitucional(data[0].idObjetivoInst)
  this.obtenerGrupo(data[0].idGrupoInv)
    })
  }
objInstitucional:InstStrategicObj;
  cargarObjInstitucional(id:number){
    this.instStrategicService.getById(id).subscribe((data)=>{
      this.objInstitucional=data;
      console.log(data)
    })
  }
  obtenerExtras(id: number) {
    console.log("id Plan: "+this.planDesarrollo.idPlanDesarrollo)
    this.deveUppeService.getByDev(id).subscribe((data) => {
      this.upperLevelPlan = data;
  })
    this.deveNatiService.getByDev(id).subscribe((data) => {
      this.nationalPlan = data;

    })
    this.deveLegaService.getByDev(id).subscribe((data) => {
      this.legalFramework = data;

    })
   
    this.controlPanelService.getByPlan(id).subscribe((data) => {
      this.controlPanel = data;
    })

    this.objStrategiesODSService.getByPlan(id).subscribe((data)=>{
      this.specificObj=data;
      console.log(data)
      this.loadingData = false;

    })

  }

  obtenerGrupo(id: number) {
    console.log("id grupo",id)
    this.invGroupService.getById(id).subscribe(
      (data) => {
        //console.log(data)
        this.invGroup = data
        this.obtenerUsuario(data.idCoordinador)
        this.obtenerMiembros(data.idGrupoInv)
      }
    )

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
      } 
      
    )
  }
  pdfUrlsCV: { [key: number]: SafeResourceUrl } = {}; // Mapeo de ID del miembro a URL del PDF


usuarioNombre: { [key: number]: string } = {};
objetivoEspecífico: { [key: number]: string } = {};
getName(id: number): Observable<string> {
  if (!this.usuarioNombre) {
    this.usuarioNombre = {};
  }
  if (this.usuarioNombre[id]) {
    return of(this.usuarioNombre[id]);
  }

  //Solicitud al backend
  return this.userService.getById(id).pipe(
    map((usuario) => {
      const nombre = usuario?.nombre || 'Usuario no encontrado';
      this.usuarioNombre[id] = nombre; // Almacena el resultado en usuarioNombre
      return nombre;
    }),
    catchError(() => {
      const errorNombre = 'Usuario no encontrado';
      this.usuarioNombre[id] = errorNombre; // También almacena el mensaje de error
      return of(errorNombre);
    })
  );

}
getObj(id: number): Observable<string> {
  if (!this.objetivoEspecífico) {
    this.objetivoEspecífico = {};
  }
  if (this.objetivoEspecífico[id]) {
    return of(this.objetivoEspecífico[id]);
    
  }

  //Solicitud al backend
  return this.specificObjService.getById(id).pipe(
    
    map((obj) => {
      const nombre = obj?.objetivo || 'Objetivo no encontrado';
      this.objetivoEspecífico[id] = nombre; // Almacena el resultado en usuarioNombre
      return nombre;
      
    }),
    catchError(() => {
      const errorNombre = 'Objetivo no encontrado';
      this.objetivoEspecífico[id] = errorNombre; // También almacena el mensaje de error
      return of(errorNombre);
    })
  );

}
}
