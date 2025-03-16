import { Component, Inject, LOCALE_ID, OnInit, Renderer2 } from '@angular/core';
import { ConfigService } from '../@vex/config/config.service';
import { Settings } from 'luxon';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { NavigationService } from '../@vex/services/navigation.service';
import { LayoutService } from '../@vex/services/layout.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SplashScreenService } from '../@vex/services/splash-screen.service';
import { VexConfigName } from '../@vex/config/config-name.model';
import { ChangeDetectorRef } from '@angular/core';
import { ColorSchemeName } from '../@vex/config/colorSchemeName';
import {
  MatIconRegistry,
  SafeResourceUrlWithIconOptions
} from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  ColorVariable,
  colorVariables
} from '../@vex/components/config-panel/color-variables';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { GlobalUserService } from 'src/app/core/http/user/global-user.service';
import { UserRolService } from './core/http/userRol/userRol.service';
import { RolService } from './core/http/rol/rol.service';
import { InvGroupService } from './core/http/inv-group/inv-group.service';
import { UsuarioService } from './core/http/usuario/usuario.service';
import { Usuario } from './types/usuario.types';
import { InvGroupForm } from './types/invGroup.types';
@Component({
  selector: 'vex-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isLoggedIn = false;
  userRoles: any[] = [];
  public estado:any
  constructor(
    private cdr: ChangeDetectorRef,
    private configService: ConfigService,
    private renderer: Renderer2,
    private platform: Platform,
    private globalUser: GlobalUserService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) private localeId: string,
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private splashScreenService: SplashScreenService,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private authService: AuthService,
    private router: Router,
    private userRolService: UserRolService,
    private rolService: RolService,
    private invGroupService: InvGroupService,
    private usuarioService: UsuarioService
  ) {
    Settings.defaultLocale = this.localeId;

    if (this.platform.BLINK) {
      this.renderer.addClass(this.document.body, 'is-blink');
    }

    this.matIconRegistry.addSvgIconResolver(
      (
        name: string,
        namespace: string
      ): SafeResourceUrl | SafeResourceUrlWithIconOptions | null => {
        switch (namespace) {
          case 'mat':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/material-design-icons/two-tone/${name}.svg`
            );

          case 'logo':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/logos/${name}.svg`
            );

          case 'flag':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/flags/${name}.svg`
            );
        }
      }
    );

    this.configService.updateConfig({
      style: {
        colorScheme: ColorSchemeName.light,
        colors: {
          primary: colorVariables.espe
        }
      },
      sidenav: {
        title: 'MENÚ',
        imageUrl: 'assets/img/espe/logo-espe.png',
        search: {
          visible: false
        },
        user: {
          visible: false
        }
      },
      footer: {
        visible: true,
        fixed: true
      },
      toolbar: {
        user: {
          visible: true
        }
      }
    });

    this.route.queryParamMap.subscribe((queryParamMap: ParamMap) => {
      if (queryParamMap.has('layout')) {
        this.configService.setConfig(
          queryParamMap.get('layout') as VexConfigName
        );
      }

      if (queryParamMap.has('style')) {
        this.configService.updateConfig({
          style: {
            colorScheme: queryParamMap.get('style') as ColorSchemeName
          }
        });
      }

      this.isLoggedIn = this.authService.isLoggedIn();
      if (!this.isLoggedIn) {
        this.authService.capture(window.location.href);
        this.login();
        return;
      }

      // setTimeout(() => {
      //   this.isLoggedIn = this.authService.isLoggedIn();
      //   if (!this.isLoggedIn) {
      //     this.login();
      //   } else {
      //     if (this.existClaims()) {
      //     this.globalUser.getUserByUsername(this.authService.getUserName());
      //     }

      //   }
      // }, 1000);

      //this.invGroupService.getByUser(id)

      this.authService.redirection();

      if (queryParamMap.has('primaryColor')) {
        const color: ColorVariable =
          colorVariables[queryParamMap.get('primaryColor')];

        if (color) {
          this.configService.updateConfig({
            style: {
              colors: {
                primary: color
              }
            }
          });
        }
      }

      if (queryParamMap.has('rtl')) {
        this.configService.updateConfig({
          direction: coerceBooleanProperty(queryParamMap.get('rtl'))
            ? 'rtl'
            : 'ltr'
        });
      }
    });

    const menuItems = [];

    this.userRolService
      .getUserRolByUsername(this.authService.getUserName())
      .subscribe(
        item => {
          for (let r of item['roles']) {
            let roleItem = {
              type: 'subheading',
              label: `${r.nombreRol}`,
              children: []
            };
            if (r.idRol === 1) {
              roleItem.label;
              roleItem.children.push(
                {
                  type: 'subheading',
                  label: `Procesos de Grupo Investigación`,
                }
                ,
                {
                  type: 'link',
                  label: 'Grupo de Investigación',
                  route: 'main/dashboard',
                  icon: 'mat:groups'
                },
                {
                  type: 'subheading',
                  label: `Seguimiento Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Cargar Documentación Habilitante',
                  route: 'main/seguimiento',
                  icon: 'mat:archive'
                }
               /* {
                  type: 'link',
                  label: 'Reporte de Actividades',
                  route: 'main/reporte-actividades',
                  icon: 'mat:chrome_reader_mode'
                },*/

                
                ,{
                  type: 'link',
                  label: 'Vinculación',
                  route: 'main/vinculacion-form',
                  icon: 'mat:group_add'
                },
                {
                  type: 'link',
                  label: 'Desvinculación',
                  route: 'main/desvinculacion',
                  icon: 'mat:group_remove'
                },
                {
                  type: 'subheading',
                  label: `Ejecución Grupo Investigación`,
                },
              /*
                {
                  type: 'link',
                  label: 'Producción Científica',
                  route: 'main/produccion-cientifica',
                  icon: 'mat:leaderboard'
                },
                */
                {
                  type: 'link',
                  label: 'Reporte de Actividades',
                  route: 'main/ver-reportes',
                  icon: 'mat:description'
                }
                
              );
            } else if (r.idRol === 2) {
              roleItem.children.push(
                {
                  type: 'subheading',
                  label: `Creación Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Solicitudes',
                  route: 'main/solicitudes',
                  icon: 'mat:drafts'
                },
                {
                  type: 'subheading',
                  label: `Seguimiento Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Solicitudes de Vinculación',
                  route: 'main/sol-vinc-c',
                  icon: 'mat:group_add'
                },
                {
                  type: 'link',
                  label: 'Informes de Actividades',
                  route: 'main/reports-c',
                  icon: 'mat:group_remove'
                }

              );
            } else if (r.idRol === 3) {
              roleItem.children.push(
                {
                  type: 'subheading',
                  label: `Creación Grupo Investigación`,
                },
                {
                  type: 'link',
                  label:
                    'Remitir Solicitudes de Conformación de Grupo de Investigación',
                  route: 'main/coord2',
                  icon: 'mat:drafts'
                },
                {
                  type: 'subheading',
                  label: `Seguimiento Grupo Investigación`,
                },
                {
                  type: 'link',
                  label:
                    'Solicitar Documentación',
                  route: 'main/grupos-d',
                  icon: 'mat:description'
                },
                {
                  type: 'link',
                  label:
                    'Solicitudes de Vinculación',
                  route: 'main/sol-vinc-d',
                  icon: 'mat:group_add'
                },
              );
            } else if (r.idRol === 4) {
              roleItem.children.push(
                {
                  type: 'subheading',
                  label: `Creación Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Delegar Revisión de Solicitudes',
                  route: 'main/solicitudesV',
                  icon: 'mat:drafts'
                },
                {
                  type: 'link',
                  label: 'Inscripción de Grupos',
                  route: 'main/solicitudes-V',
                  icon: 'mat:drafts'
                },
                {
                  type: 'link',
                  label: 'Registro de Grupos',
                  route: 'main/solicitud-Inscripcion',
                  icon: 'mat:drafts'
                },
                {
                  type: 'subheading',
                  label: `Seguimiento Grupo Investigación`,
                },
                {
                  type: 'link',
                  label:
                    'Solicitudes de Vinculación',
                  route: 'main/sol-vinc-v',
                  icon: 'mat:group_add'
                },
                {
                  type: 'link',
                  label:
                    'Disponer Actualización de Grupos de Investigación',
                  route: 'main/sol-vinc-V',
                  icon: 'mat:group_add'
                },
                {
                  type: 'subheading',
                  label: `Reportes Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Reportes y Dashboards',
                  route: 'main/reportMenu',
                  icon: 'mat:analytics'
                }
              );
            } else if (r.idRol === 5) {
              roleItem.children.push(
                {
                  type: 'subheading',
                  label: `Creación Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Emitir Criterios de solicitud',
                  route: 'main/solicitudes-t',
                  icon: 'mat:school'
                },
                {
                  type: 'subheading',
                  label: `Seguimiento Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Evaluación de Informes',
                  route: 'main/coord2',
                  icon: 'mat:mark_email_read'
                },
                {
                  type: 'link',
                  label:
                    'Solicitudes de Vinculación',
                  route: 'main/sol-vinc-t',
                  icon: 'mat:group_add'
                },
              );
            } else if (r.idRol === 6) {
              roleItem.children.push(
                {
                  type: 'subheading',
                  label: `Creación Grupo Investigación`,
                },
                {
                
                type: 'link',
                label: 'Resoluciones',
                route: 'main/solicitudes-A',
                icon: 'mat:school'
              });
            } else if (r.idRol === 7) {
              roleItem.children.push(
                {
                  type: 'subheading',
                  label: `Creación Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Inscribir Fichas',
                  route: 'main/solicitudesA',
                  icon: 'mat:school'
                },
                {
                  type: 'subheading',
                  label: `Seguimiento Grupo Investigación`,
                },
                {
                  type: 'link',
                  label: 'Solicitar Informes',
                  route: 'main/grupos-a',
                  icon: 'mat:school'
                },
                {
                  type: 'link',
                  label: 'Actualizar Fichas',
                  route: 'main/sol-vinc-a',
                  icon: 'mat:school'
                },
                {
                  type: 'subheading',
                  label: `Reportes`,
                },
                {
                  type: 'link',
                  label: 'Reportes y Dashboards',
                  route: 'main/reportMenu',
                  icon: 'mat:poll'
                }
              );
            } else if (r.idRol === 8) {
              roleItem.children.push({
                type: 'link',
                label: 'Fase 8',
                route: 'main/fase8',
                icon: 'mat:school'
              });
            } else if (r.idRol === 9) {
              roleItem.children.push({
                type: 'link',
                label: 'Fase 9',
                route: 'main/fase9',
                icon: 'mat:school'
              });
            }else if (r.idRol ===11) {
              roleItem.children.push({
                type: 'link',
                label: 'Cómite de Investigación',
                route: 'main/solicitudes-comite',
                icon: 'mat:school'
              },{
                type: 'link',
                label: 'Remitir Recomendaciones',
                route: 'main/solicitudes-aprobadas',
                icon: 'mat:school'
              });
            } else if (r.idRol === 10) {
              roleItem.children.push(
                {
                  type: 'link',
                  label: 'Módulos de Control',
                  route: 'main/admin',
                  icon: 'mat:school'
                }, 
                {
                  type: 'link',
                  label: 'Gestión Roles',
                  route: 'main/rol-menu',
                  icon: 'mat:groups'
                },
                {
                  type: 'link',
                  label: 'Gestión Grupos de Investigación',
                  route: 'main/grupos-investigacion',
                  icon: 'mat:groups'
                },
                {
                  type: 'link',
                  label: 'Lista GI',
                  route: 'main/ejecucion',
                  icon: 'mat:description'
                },
              );
            }
            menuItems.push(roleItem);
          }
        },
        error => {
          console.log('Error en la función : getRolById ');
        }
      );
    this.navigationService.items = menuItems;
  }

  ngOnInit(): void {
    this.authService.login();
    const currentUser = this.authService.getUserName();
    this.getUserByUsername(currentUser);
  }

  getUserByUsername(username: string): void {
    this.globalUser.getUserByUserName(username).subscribe(
      (usuario: Usuario) => {
        const userId = usuario.id;
        this.getIdGroup(userId);
        sessionStorage.setItem('userId', userId.toString());
        sessionStorage.setItem('departamento', usuario.departamento);
        this.navigationService.items;
      },
      error => {}
    );
  }

invGroup:Boolean=false;

  getIdGroup(user: number): void {
    this.invGroupService.getByUser(user).subscribe(
      (grupo: InvGroupForm) => {
        const IdGroup = grupo.idGrupoInv;

        if (IdGroup) {
          sessionStorage.setItem('invGroup', IdGroup.toString());
          this.invGroup=true;
        } else {
          sessionStorage.removeItem('invGroup');
        }
      },
      error => {
        // Manejar el error si es necesario
      }
    );
  }
  

  login(): void {
    this.authService.obtainAccessToken();
  }
}
