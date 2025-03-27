import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvGroupService } from 'src/app/core/http/inv-group/inv-group.service';
import { UsuarioService } from 'src/app/core/http/usuario/usuario.service';
import { InvGroupForm } from 'src/app/types/invGroup.types';
import { Usuario } from 'src/app/types/usuario.types';
import { Link as LinkForm } from 'src/app/types/link.types';
import { LinkService } from 'src/app/core/http/link/link.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InvMemberService } from 'src/app/core/http/inv-member/inv-member.service';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { UserRolService } from 'src/app/core/http/userRol/userRol.service';
import { UserRole } from 'src/app/types/userApp.types';
import { UserRoles } from 'src/app/types/userRol.types';
@Component({
  selector: 'app-solicitud-componente',
  templateUrl: './mostrarSolicitud.component.html',
  styleUrls: ['./obtenerSolicitudes.component.scss']
})
export class ActualizacionAnaVic implements OnInit {
  pdfUrl:  string = 'https://repositorio.espe.edu.ec/bitstream/21000/12595/1/T-ESPE-049842.pdf';
  pdfUrlSafe: SafeResourceUrl;
  link: LinkForm;
  miembroVincular: Usuario;
  invGroup: InvGroupForm;
  coordinador: Usuario;
  loadingData: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private invGroupService: InvGroupService,
    private userService: UsuarioService,
    private router: Router,
    private linkService: LinkService,
    private invMemberService: InvMemberService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private userRolService: UserRolService

  ) { this.pdfUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl); }

  ngOnInit(): void {
    this.solicitudCreacion()
  }

  solicitudCreacion() {
    this.loadingData = true;
    const navigationState = history.state;
    if (navigationState && navigationState.link) {
      this.link = navigationState.link;
      this.obtenerGrupo(this.link.idGrupoInv)
      this.obtenerMiembro(this.link.idUser);
    } else {
      this.loadingData = false;
    }
  }
  obtenerMiembro(id: number) {
    this.userService.getById(id).subscribe(data => {
      this.miembroVincular = data;
      this.loadingData = false;

    })
  }

  obtenerGrupo(id: number) {
    this.invGroupService.getById(id).subscribe(
      (data) => {
        this.invGroup = data
        this.obtenerUsuario(data.idCoordinador)
      }
    )

  }
  //recuperar el coordinador del Grupo de Investigación
  obtenerUsuario(id: number) {
    this.userService.getById(id).subscribe(
      (data) => {
        this.coordinador = data;
      }
    )
  }

  //Recuperar el anexo

  validarSolicitud() {
    const currentUser = this.authService.getUserName();
    const currentDate = new Date();

    const invMemberData:InvMemberForm={
      idGrupoInv:this.link.idGrupoInv,
       idUsuario:this.link.idUser,
       fechaVinculacion:null,
       tipo:'Externo',
       usuarioCreacion:currentUser
        , fechaCreacion:currentDate,
        usuarioModificacion:null,
        fechaModificacion:null
    }
    const userRol:UserRoles={
      idRoles:8, 
      idUsuario:this.link.idUser,
       usuarioCreacion:currentUser,
        fechaCreacion:currentDate, 
        usuarioModificacion:null, fechaModificacion:null
    }
    if (this.link.tipo==='vinc'){
      this.invMemberService.createInvMemberFormForm(invMemberData).subscribe(response=>{
        this.userRolService.createUserRol(userRol).subscribe(data=>{
          console.log("inscrito");

        })
      })
    }
    else if(this.link.tipo==='desv'){
      
      this.invMemberService.deleteUserGroup(this.link.idUser,this.link.idGrupoInv).subscribe(response=>{
        console.log("eliminado correctamente")
      })
    }
    
    const linkDataUpdate:any = {
      idUser: this.link.idUser,
      idGrupoInv: this.link.idGrupoInv,
      estado:'Z'
    }
    this.linkService.update(this.link.idVinculacion, linkDataUpdate).subscribe(response=> {
      this.router.navigate(["main/sol-vinc-a"])
      
          })
  
    const navigationState = history.state;
    const link = navigationState.link;

  }
}
