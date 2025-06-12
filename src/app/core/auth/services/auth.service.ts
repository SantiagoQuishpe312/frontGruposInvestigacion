
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { environment } from 'src/environments/environment';
import { GlobalUser } from 'src/app/types/user.types';
import { GlobalUserService } from '../../http/user/global-user.service';
import { TokenClaim } from 'src/app/types/token-claim.types';
import { Usuario } from 'src/app/types/usuario.types';
import { authConfig } from '../oauth.config';
import { TokenExpirationDialogComponent } from '../../interceptors/token-expiration-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly URL = environment.appApiUrl + '/user';

  // 🧪 CONFIGURACIÓN PARA TESTING - Simular token de 2 minutos
 // private readonly TESTING_MODE = false; // ⚠️ Cambiar a true para testing
 // private readonly SIMULATED_TOKEN_DURATION_MINUTES = 2;
// Cambia estas constantes
private readonly WARNING_TIME_MINUTES = 10; // Primera alarma a 5 minutos
private readonly SECOND_WARNING_TIME_MINUTES = 5; // Segunda alarma a 3 minutos
private readonly FINAL_WARNING_TIME_MINUTES = 1; // Alarma final a 1 minuto
//private readonly AUTO_REFRESH_TIME_MINUTES = 0.5; // 30 segundos antes para renovación automática
  private simulatedTokenStartTime: number = 0;
  
  // Mejor gestión de subscripciones
  private destroy$ = new Subject<void>();
  private warningTimer: Subscription;
  private secondWarningTimer: Subscription;
  private finalWarningTimer: Subscription;

    private autoRefreshTimer: Subscription;
  private warningShown = false;
  private isRefreshing = false;


  private globalUserSubject: BehaviorSubject<GlobalUser> = new BehaviorSubject<GlobalUser>(null);
  globalUser$: Observable<GlobalUser> = this.globalUserSubject.asObservable();

  constructor(
    private oAuthService: OAuthService,
    private globalUserService: GlobalUserService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.configureOauthService();
    this.startTokenExpirationMonitoring();
  }

  get tokenClaims(): TokenClaim {
    return {
      familyName: this.oAuthService.getIdentityClaims()['family_name'],
      email: this.oAuthService.getIdentityClaims()['email'],
      givenName: this.oAuthService.getIdentityClaims()['given_name'],
      name: this.oAuthService.getIdentityClaims()['name'],
      username: this.oAuthService.getIdentityClaims()['sub'],
      preferredUsername: this.oAuthService.getIdentityClaims()['preferred_username']
    };
  }

  get username(): string {
    return this.oAuthService.getIdentityClaims()['sub'];
  }

  getByUserName(userName: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.URL}/userName/${userName}`);
  }

  login() {
    if (!this.oAuthService.hasValidAccessToken()) {
      this.oAuthService.initImplicitFlow();
      return;
    }
    
    if (this.oAuthService.getIdentityClaims()) {
      this.getGlobalUser();
    }
  }

  logout() {
    // Limpiar todas las subscripciones antes del logout
    this.stopTokenExpirationMonitoring();
    this.destroy$.next();
    this.oAuthService.logOut();
  }

  private configureOauthService() {
    this.oAuthService.configure(authConfig);
    this.oAuthService.tryLogin({
      onTokenReceived: () => {
        // Inicializar tiempo de simulación
        // if (this.TESTING_MODE) {
        //   this.simulatedTokenStartTime = Date.now();
        // }
        this.getGlobalUser();
        this.startTokenExpirationMonitoring();
      }
    });
  }

  private getGlobalUser() {
    this.globalUserService
      .getUserByUsername(this.tokenClaims.username)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.setGlobalUser(user);
      });
  }

  private setGlobalUser(user: GlobalUser) {
    this.globalUserSubject.next(user);
  }

  public capture(redirectable: string): void {
    this.oAuthService.initImplicitFlow(redirectable);
  }

  public redirection(): void {
    this.oAuthService.tryLogin({
      onTokenReceived: info => {
        window.location.href = info.state;
      }
    });
  }

  public obtainAccessToken() {
    this.oAuthService.initImplicitFlow();
  }

  /**
   * Obtiene los valores de expiración desde sessionStorage
   */
  private getTokenExpirationFromStorage(): { expiresAt: number; idTokenExpiresAt: number; storedAt: number } | null {
    try {
      const expiresAt = sessionStorage.getItem('expires_at');
      const idTokenExpiresAt = sessionStorage.getItem('id_token_expires_at');
      const storedAt = sessionStorage.getItem('id_token_stored_at');

      if (!expiresAt || !idTokenExpiresAt || !storedAt) {
        return null;
      }

      return {
        expiresAt: parseInt(expiresAt, 10),
        idTokenExpiresAt: parseInt(idTokenExpiresAt, 10),
        storedAt: parseInt(storedAt, 10)
      };
    } catch (error) {
      console.error('Error al leer valores de sessionStorage:', error);
      return null;
    }
  }

  public refreshToken(): Promise<any> {
    if (this.isRefreshing) {
      return Promise.resolve(false);
    }

    this.isRefreshing = true;

    // En modo testing, simular renovación exitosa
    // if (this.TESTING_MODE) {
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       this.isRefreshing = false;
    //       this.warningShown = false;
    //       this.simulatedTokenStartTime = Date.now(); // Reiniciar contador
          
    //       setTimeout(() => {
    //         this.startTokenExpirationMonitoring();
    //       }, 1000);
          
    //       resolve(true);
    //     }, 1000); // Simular delay de red
    //   });
    // }

    return this.oAuthService.refreshToken()
      .then(() => {
        this.isRefreshing = false;
        this.warningShown = false;
        
        // Reiniciar monitoreo con el nuevo token
        setTimeout(() => {
          this.startTokenExpirationMonitoring();
        }, 1000);
        
        return true;
      })
      .catch(error => {
        console.error('Error al renovar token:', error);
        this.isRefreshing = false;
        
        // Verificar si es un error de CORS
        if (this.isCorsError(error)) {
          this.handleCorsRefreshError();
          return false;
        } else {
          this.handleTokenRefreshError();
          return false;
        }
      });
  }

  private isCorsError(error: any): boolean {
    return error.status === 0 || 
           error.status === 302 ||
           (error.message && error.message.includes('CORS')) ||
           (error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0);
  }

  private handleCorsRefreshError(): void {
    
    const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        minutesLeft: this.getTokenTimeRemaining(),
        corsError: true
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === 'redirect-refresh') {
          this.refreshTokenViaRedirect();
        } else if (result === 'manual-refresh') {
          this.openRefreshInNewTab();
        } else {
          this.logout();
        }
      });
  }

  private refreshTokenViaRedirect(): void {
    // Guardar la URL actual para regresar después
    localStorage.setItem('preRefreshUrl', window.location.href);
    this.oAuthService.initImplicitFlow();
  }

  private openRefreshInNewTab(): void {
    const refreshUrl = this.oAuthService.issuer + '/oauth2endpoints/authz?' + 
      'client_id=' + encodeURIComponent(this.oAuthService.clientId) +
      '&response_type=token' +
      '&scope=' + encodeURIComponent(this.oAuthService.scope) +
      '&redirect_uri=' + encodeURIComponent(this.oAuthService.redirectUri);
    
    window.open(refreshUrl, '_blank', 'width=600,height=600');
    
    // Mostrar instrucciones al usuario
    this.showManualRefreshInstructions();
  }

  private showManualRefreshInstructions(): void {
    const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        minutesLeft: this.getTokenTimeRemaining(),
        manualRefreshInstructions: true
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Verificar si el token se renovó
      if (this.oAuthService.hasValidAccessToken()) {
        this.warningShown = false;
        this.startTokenExpirationMonitoring();
      } else {
        this.logout();
      }
    });
  }

  public isLoggedIn(): boolean {
    return this.oAuthService.getAccessToken() !== null;
  }

  public getUserName(): string {
    const claims = this.getUserClaims();
    if (claims === null) {
      return '';
    } else {
      return claims['sub'].split('@')[0];
    }
  }

  public getUserClaims(): object {
    return this.oAuthService.getIdentityClaims();
  }

  public getUserInfo(): string {
    const idToken = this.oAuthService.getIdToken();
    if (idToken === null) {
      return '';
    } else {
      return typeof idToken['sub'] !== 'undefined' ? idToken['sub'].toString() : '';
    }
  }

  private startTokenExpirationMonitoring(): void {
    
    // Detener monitoreo anterior
    this.stopTokenExpirationMonitoring();
    
    if (!this.isLoggedIn()) {
      return;
    }

    let expiresIn: number;
    
    // if (this.TESTING_MODE) {
    //   if (!this.simulatedTokenStartTime) {
    //     this.simulatedTokenStartTime = Date.now();
    //   }
    //   expiresIn = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
    // } else {
      const storageTokenInfo = this.getTokenExpirationFromStorage();
      
      if (storageTokenInfo) {
        const now = Date.now();
        expiresIn = storageTokenInfo.expiresAt - now;
      } else {
        const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
        if (!tokenExpiresAt) {
          return;
        }
        const now = Date.now();
        expiresIn = tokenExpiresAt - now;
      }
    //}
    
    if (expiresIn <= 0) {
      this.handleTokenRefreshError();
      return;
    }

    // Configurar timers para las 3 alarmas
    const warningTime1 = expiresIn - (this.WARNING_TIME_MINUTES * 60 * 1000);
    const warningTime2 = expiresIn - (this.SECOND_WARNING_TIME_MINUTES * 60 * 1000);
    const warningTime3 = expiresIn - (this.FINAL_WARNING_TIME_MINUTES * 60 * 1000);
   if (warningTime1 > 0) {
      this.warningTimer = timer(warningTime1)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.showExpirationWarning(this.WARNING_TIME_MINUTES);
        });
    } else {
    }

    if (warningTime2 > 0) {
      this.secondWarningTimer = timer(warningTime2)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.showExpirationWarning(this.SECOND_WARNING_TIME_MINUTES);
        });
    } else {
    }

    if (warningTime3 > 0) {
      this.finalWarningTimer = timer(warningTime3)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.showExpirationWarning(this.FINAL_WARNING_TIME_MINUTES);
        });
    } else {
    }

    // Timer para renovación automática (30 segundos antes)
    // const autoRefreshTime = expiresIn - (this.AUTO_REFRESH_TIME_MINUTES * 60 * 1000);
    // if (autoRefreshTime > 0) {
    //   this.autoRefreshTimer = timer(autoRefreshTime)
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe(() => {
    //       this.attemptAutoRefresh();
    //     });
    // } else if (!this.warningShown) {
    //   this.attemptAutoRefresh();
    // }
  }
  private stopTokenExpirationMonitoring(): void {
    
    if (this.warningTimer) {
      this.warningTimer.unsubscribe();
      this.warningTimer = null;
    }
    
    if (this.secondWarningTimer) {
      this.secondWarningTimer.unsubscribe();
      this.secondWarningTimer = null;
    }
    
    if (this.finalWarningTimer) {
      this.finalWarningTimer.unsubscribe();
      this.finalWarningTimer = null;
    }
    
    if (this.autoRefreshTimer) {
      this.autoRefreshTimer.unsubscribe();
      this.autoRefreshTimer = null;
    }
  }
  private showExpirationWarning(minutesLeft: number): void {
    if (this.warningShown || !this.isLoggedIn()) {
      return;
    }
  
    this.warningShown = true;
    
    const adjustedMinutes = Math.max(1, minutesLeft);
    
    const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        minutesLeft: adjustedMinutes
      }
    });
    
    
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === 'logout') {
          this.logout();
        } else {
        }
        // Reset la bandera para permitir futuras advertencias
        this.warningShown = false;
      });
  }

  private attemptAutoRefresh(): void {
    if (!this.isLoggedIn()) {
      return;
    }

    this.refreshToken().then(success => {
      if (!success) {
        //this.showForceLogoutDialog();
        this.logout();
      } else {
      }
    });
  }

  private handleTokenRefreshError(): void {
    console.error('❌ No se pudo renovar el token. Cerrando sesión...');
    this.logout();
    //this.showForceLogoutDialog();
  }

  private showForceLogoutDialog(): void {
    const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        minutesLeft: 0,
        forceLogout: true
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.logout();
      });
  }

  public getTokenTimeRemaining(): number {
    if (!this.isLoggedIn()) {
      return 0;
    }

    // if (this.TESTING_MODE) {
    //   // Calcular tiempo simulado restante
    //   if (!this.simulatedTokenStartTime) {
    //     return 0;
    //   }
      
    //   const elapsed = Date.now() - this.simulatedTokenStartTime;
    //   const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
    //   const remaining = totalDuration - elapsed;
    //   const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
      
      
     // return minutesRemaining;
    //}

    // Usar valores reales del sessionStorage
    const storageTokenInfo = this.getTokenExpirationFromStorage();
    
    if (storageTokenInfo) {
      const now = Date.now();
      const remaining = storageTokenInfo.expiresAt - now;
      const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
           
      return minutesRemaining;
    }

    // Fallback al método tradicional
    const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
    if (!tokenExpiresAt) {
      return 0;
    }

    const now = Date.now();
    const remaining = tokenExpiresAt - now;
    const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
    
    return minutesRemaining;
  }

  public getTokenSecondsRemaining(): number {
    if (!this.isLoggedIn()) {
      return 0;
    }

    // if (this.TESTING_MODE) {
    //   if (!this.simulatedTokenStartTime) {
    //     return 0;
    //   }
      
    //   const elapsed = Date.now() - this.simulatedTokenStartTime;
    //   const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
    //   const remaining = totalDuration - elapsed;
    //   return Math.max(0, Math.floor(remaining / 1000));
    // }

    // Usar valores reales del sessionStorage
    const storageTokenInfo = this.getTokenExpirationFromStorage();
    
    if (storageTokenInfo) {
      const now = Date.now();
      const remaining = storageTokenInfo.expiresAt - now;
      return Math.max(0, Math.floor(remaining / 1000));
    }

    // Fallback al método tradicional
    const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
    if (!tokenExpiresAt) {
      return 0;
    }

    const now = Date.now();
    const remaining = tokenExpiresAt - now;
    return Math.max(0, Math.floor(remaining / 1000));
  }

  public isTokenNearExpiration(): boolean {
    const timeRemaining = this.getTokenTimeRemaining();
    return timeRemaining <= this.WARNING_TIME_MINUTES && timeRemaining > 0;
  }

  // Método para debugging
  public getTokenExpirationInfo(): any {
    if (!this.isLoggedIn()) {
      return { valid: false };
    }
  
    const minutesLeft = this.getTokenTimeRemaining();
    const secondsLeft = this.getTokenSecondsRemaining();
    const storageTokenInfo = this.getTokenExpirationFromStorage();
    
    return {
      valid: true,
      // testingMode: this.TESTING_MODE,
      // simulatedDuration: this.TESTING_MODE ? this.SIMULATED_TOKEN_DURATION_MINUTES : null,
      // simulatedStartTime: this.TESTING_MODE ? new Date(this.simulatedTokenStartTime) : null,
       sessionStorageInfo: storageTokenInfo ? {
        expiresAt: new Date(storageTokenInfo.expiresAt),
        idTokenExpiresAt: new Date(storageTokenInfo.idTokenExpiresAt),
        storedAt: new Date(storageTokenInfo.storedAt)
      } : null,
      oauthServiceExpiresAt: this.oAuthService.getAccessTokenExpiration() ? 
        new Date(this.oAuthService.getAccessTokenExpiration()) : null,
      minutesLeft: minutesLeft,
      secondsLeft: secondsLeft,
      warningShown: this.warningShown,
      isRefreshing: this.isRefreshing,
      currentTime: new Date()
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTokenExpirationMonitoring();
  }
}