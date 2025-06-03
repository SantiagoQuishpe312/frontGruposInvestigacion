// //Importa los módulos y servicios necesarios para implementar la lógica de autenticación, como OAuthService para OAuth 2.0 y otros servicios relacionados con la autenticación de usuarios.
// import { Injectable } from '@angular/core';
// import { OAuthService } from 'angular-oauth2-oidc';
// import { authConfig } from 'src/app/core/auth/oauth.config';
// import { TokenClaim } from 'src/app/types/token-claim.types';
// import { GlobalUserService } from 'src/app/core/http/user/global-user.service';
// import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
// import { GlobalUser } from 'src/app/types/user.types';
// import { HttpClient } from '@angular/common/http';
// import { Usuario } from 'src/app/types/usuario.types';
// import { environment } from 'src/environments/environment';
// import { MatDialog } from '@angular/material/dialog';
// import { TokenExpirationDialogComponent } from '../../interceptors/token-expiration-dialog.component';

// //Indica que la clase AuthService es un servicio inyectable en la aplicación Angular y se puede proporcionar a través del sistema de inyección de dependencias.
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private readonly URL = environment.appApiUrl + '/user';

//   private readonly WARNING_TIME_MINUTES = 2;
//   // Tiempo en minutos antes de la expiración para renovar automáticamente
//   private readonly AUTO_REFRESH_TIME_MINUTES = 1;
  
//   private tokenExpirationTimer: Subscription;
//   private warningShown = false;
  

//   //globalUserSubject: Un sujeto de RxJS (BehaviorSubject) que emite eventos cuando cambia el usuario global. Se utiliza para mantener un seguimiento del estado del usuario actual.
//   private globalUserSubject: BehaviorSubject<GlobalUser> =
//     new BehaviorSubject<GlobalUser>(null);
//   //globalUser$: Un observable que emite eventos cuando cambia el usuario global. Permite a otros componentes o servicios suscribirse a cambios en el usuario.
//   globalUser$: Observable<GlobalUser> = this.globalUserSubject.asObservable();

//   constructor(
//     private oAuthService: OAuthService,
//     private globalUserService: GlobalUserService,
//     private http: HttpClient,
//     private dialog: MatDialog

//   ) {
//     //configureOauthService(): Configura el servicio OAuth (OAuthService) utilizando la configuración definida en authConfig. Intenta iniciar sesión automáticamente si ya hay un token válido.
//     this.configureOauthService();
//     this.startTokenExpirationMonitoring();
//   }

//   get tokenClaims(): TokenClaim {
//     return {
//       familyName: this.oAuthService.getIdentityClaims()['family_name'],
//       email: this.oAuthService.getIdentityClaims()['email'],
//       givenName: this.oAuthService.getIdentityClaims()['given_name'],
//       name: this.oAuthService.getIdentityClaims()['name'],
//       username: this.oAuthService.getIdentityClaims()['sub'],
//       preferredUsername:
//         this.oAuthService.getIdentityClaims()['preferred_username']
//     };
//   }

//   get username(): string {
//     return this.oAuthService.getIdentityClaims()['sub'];
//   }

//   getByUserName(userName: string): Observable<Usuario> {
//     return this.http.get<Usuario>(`${this.URL}/userName/${userName}`);
//   }
//   //Inicia el flujo de inicio de sesión implícito si no hay un token de acceso válido. Si ya hay un token válido, obtiene la información del usuario global.
//   login() {
//     if (!this.oAuthService.hasValidAccessToken()) {
//       this.oAuthService.initImplicitFlow();
//       return;
//     }
//     //
//     if (this.oAuthService.getIdentityClaims()) {
//       this.getGlobalUser();
//     }
//   }
//   //Cierra la sesión del usuario mediante el servicio OAuth.
//   logout() {
//     this.stopTokenExpirationMonitoring();
//     this.oAuthService.logOut();
//   }
//   //Configura el servicio OAuth (OAuthService) utilizando la configuración definida en authConfig. Intenta iniciar sesión automáticamente si ya hay un token válido.
//   private configureOauthService() {
//     this.oAuthService.configure(authConfig);
//     this.oAuthService.tryLogin({
//       onTokenReceived: () => {
//         this.getGlobalUser();
//         this.startTokenExpirationMonitoring();
//       }
//     });
//   }
//   //getGlobalUser(): Obtiene la información del usuario global haciendo una llamada al servicio GlobalUserService utilizando el nombre de usuario extraído del token.
//   private getGlobalUser() {
//     this.globalUserService
//       .getUserByUsername(this.tokenClaims.username)
//       .subscribe(user => {
//         this.setGlobalUser(user);
//       });
//   }
//   //setGlobalUser(user: GlobalUser): Establece el usuario global utilizando el sujeto globalUserSubject. En este caso, parece haber un ajuste temporal (TODO) que agrega un pidm al usuario global.
//   private setGlobalUser(user: GlobalUser) {
//     // TODO: Remove this when the backend is fixed
//     // user.pidm = 289444; //director
//     //    user.pidm = 8014; //coordinador
//     this.globalUserSubject.next(user);
//   } // Inicia un flujo de inicio de sesión implícito con una redirección específica.
//   public capture(redirectable: string): void {
//     this.oAuthService.initImplicitFlow(redirectable);
//   }
//   //Redirige después de un intento de inicio de sesión, aprovechando la información del estado.
//   public redirection(): void {
//     this.oAuthService.tryLogin({
//       onTokenReceived: info => {
//         window.location.href = info.state;
//       }
//     });
//   }
//   //Inicia el flujo de obtención de token de acceso implícito.
//   public obtainAccessToken() {
//     this.oAuthService.initImplicitFlow();
//   }

//   public refreshToken(): Promise<any> {
//     return this.oAuthService.refreshToken()
//       .then(() => {
//         console.log('Token renovado exitosamente');
//         this.warningShown = false;
//         this.startTokenExpirationMonitoring();
//         return true;
//       })
//       .catch(error => {
//         console.error('Error al renovar token:', error);
//         this.handleTokenRefreshError();
//         return false;
//       });
//   }

//   //Verifica si el usuario está autenticado comprobando la existencia del token de acceso.
//   public isLoggedIn(): boolean {
//     if (this.oAuthService.getAccessToken() === null) {
//       return false;
//     }
//     return true;
//   }
//   //Obtiene el nombre de usuario del token de identificación.
//   public getUserName(): string {
//     const claims = this.getUserClaims();
//     this.getUserInfo();
//     if (claims === null) {
//       // return ''
//       // window.location.reload()
//     } else {
//       return claims['sub'].split('@')[0];
//     }
//   }
//   //Obtiene las reclamaciones del usuario del token de identidad.
//   public getUserClaims(): object {
//     return this.oAuthService.getIdentityClaims();
//   }
//   // Obtiene información del usuario del token de identificación.
//   public getUserInfo(): string {
//     const idToken = this.oAuthService.getIdToken();
//     if (idToken === null) {
//       // window.location.reload();
//     } else {
//       return typeof idToken['sub'] !== 'undefined'
//         ? idToken['sub'].toString()
//         : '';
//     }
//   }
//   private startTokenExpirationMonitoring(): void {
//     this.stopTokenExpirationMonitoring();
    
//     if (!this.isLoggedIn()) {
//       return;
//     }

//     const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//     if (!tokenExpiresAt) {
//       return;
//     }

//     const now = Date.now();
//     const expiresIn = tokenExpiresAt - now;
    
//     // Configurar timer para advertencia
//     const warningTime = expiresIn - (this.WARNING_TIME_MINUTES * 60 * 1000);
//     if (warningTime > 0) {
//       timer(warningTime).subscribe(() => {
//         this.showExpirationWarning();
//       });
//     }

//     // Configurar timer para renovación automática
//     const autoRefreshTime = expiresIn - (this.AUTO_REFRESH_TIME_MINUTES * 60 * 1000);
//     if (autoRefreshTime > 0) {
//       timer(autoRefreshTime).subscribe(() => {
//         this.attemptAutoRefresh();
//       });
//     }
//   }

//   private stopTokenExpirationMonitoring(): void {
//     if (this.tokenExpirationTimer) {
//       this.tokenExpirationTimer.unsubscribe();
//     }
//   }

//   private showExpirationWarning(): void {
//     if (this.warningShown || !this.isLoggedIn()) {
//       return;
//     }

//     this.warningShown = true;
//     const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//     const now = Date.now();
//     const minutesLeft = Math.floor((tokenExpiresAt - now) / (60 * 1000));

//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '400px',
//       disableClose: true,
//       data: {
//         minutesLeft: minutesLeft
//       }
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       if (result === 'refresh') {
//         this.refreshToken();
//       } else if (result === 'logout') {
//         this.logout();
//       }
//     });
//   }

//   private attemptAutoRefresh(): void {
//     if (!this.isLoggedIn()) {
//       return;
//     }

//     console.log('Intentando renovar token automáticamente...');
//     this.refreshToken().then(success => {
//       if (!success) {
//         // Si falla la renovación automática, mostrar diálogo de logout
//         this.showForceLogoutDialog();
//       }
//     });
//   }

//   private handleTokenRefreshError(): void {
//     console.error('No se pudo renovar el token. Cerrando sesión...');
//     this.showForceLogoutDialog();
//   }

//   private showForceLogoutDialog(): void {
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '400px',
//       disableClose: true,
//       data: {
//         minutesLeft: 0,
//         forceLogout: true
//       }
//     });

//     dialogRef.afterClosed().subscribe(() => {
//       this.logout();
//     });
//   }

//   // Método público para verificar el tiempo restante del token
//   public getTokenTimeRemaining(): number {
//     if (!this.isLoggedIn()) {
//       return 0;
//     }

//     const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//     if (!tokenExpiresAt) {
//       return 0;
//     }

//     const now = Date.now();
//     return Math.max(0, Math.floor((tokenExpiresAt - now) / (60 * 1000)));
//   }

//   // Método público para verificar si el token está próximo a expirar
//   public isTokenNearExpiration(): boolean {
//     const timeRemaining = this.getTokenTimeRemaining();
//     return timeRemaining <= this.WARNING_TIME_MINUTES && timeRemaining > 0;
//   }
// }







//FUNCIONA PARA DOS MINUTOS
// import { Injectable } from '@angular/core';
// import { OAuthService } from 'angular-oauth2-oidc';
// import { authConfig } from 'src/app/core/auth/oauth.config';
// import { TokenClaim } from 'src/app/types/token-claim.types';
// import { GlobalUserService } from 'src/app/core/http/user/global-user.service';
// import { BehaviorSubject, Observable, Subscription, timer, Subject } from 'rxjs';
// import { GlobalUser } from 'src/app/types/user.types';
// import { HttpClient } from '@angular/common/http';
// import { Usuario } from 'src/app/types/usuario.types';
// import { environment } from 'src/environments/environment';
// import { MatDialog } from '@angular/material/dialog';
// import { TokenExpirationDialogComponent } from '../../interceptors/token-expiration-dialog.component';
// import { takeUntil } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private readonly URL = environment.appApiUrl + '/user';

//   // 🧪 CONFIGURACIÓN PARA TESTING - Simular token de 2 minutos
//   private readonly TESTING_MODE = true; // ⚠️ Cambiar a false para producción
//   private readonly SIMULATED_TOKEN_DURATION_MINUTES = 3;
//   private readonly WARNING_TIME_MINUTES = 2; // 30 segundos antes
//   private readonly AUTO_REFRESH_TIME_MINUTES = 1; // 15 segundos antes
  
//   // Variables para simulación
//   private simulatedTokenStartTime: number = 0;
  
//   // Mejor gestión de subscripciones
//   private destroy$ = new Subject<void>();
//   private warningTimer: Subscription;
//   private autoRefreshTimer: Subscription;
//   private warningShown = false;
//   private isRefreshing = false;

//   private globalUserSubject: BehaviorSubject<GlobalUser> = new BehaviorSubject<GlobalUser>(null);
//   globalUser$: Observable<GlobalUser> = this.globalUserSubject.asObservable();

//   constructor(
//     private oAuthService: OAuthService,
//     private globalUserService: GlobalUserService,
//     private http: HttpClient,
//     private dialog: MatDialog
//   ) {
//     this.configureOauthService();
//     this.startTokenExpirationMonitoring();
//   }

//   get tokenClaims(): TokenClaim {
//     return {
//       familyName: this.oAuthService.getIdentityClaims()['family_name'],
//       email: this.oAuthService.getIdentityClaims()['email'],
//       givenName: this.oAuthService.getIdentityClaims()['given_name'],
//       name: this.oAuthService.getIdentityClaims()['name'],
//       username: this.oAuthService.getIdentityClaims()['sub'],
//       preferredUsername: this.oAuthService.getIdentityClaims()['preferred_username']
//     };
//   }

//   get username(): string {
//     return this.oAuthService.getIdentityClaims()['sub'];
//   }

//   getByUserName(userName: string): Observable<Usuario> {
//     return this.http.get<Usuario>(`${this.URL}/userName/${userName}`);
//   }

//   login() {
//     if (!this.oAuthService.hasValidAccessToken()) {
//       this.oAuthService.initImplicitFlow();
//       return;
//     }
    
//     if (this.oAuthService.getIdentityClaims()) {
//       this.getGlobalUser();
//     }
//   }

//   logout() {
//     // Limpiar todas las subscripciones antes del logout
//     this.stopTokenExpirationMonitoring();
//     this.destroy$.next();
//     this.oAuthService.logOut();
//   }

//   private configureOauthService() {
//     this.oAuthService.configure(authConfig);
//     this.oAuthService.tryLogin({
//       onTokenReceived: () => {
//         console.log('Token recibido, configurando monitoreo');
//         // Inicializar tiempo de simulación
//         if (this.TESTING_MODE) {
//           this.simulatedTokenStartTime = Date.now();
//         }
//         this.getGlobalUser();
//         this.startTokenExpirationMonitoring();
//       }
//     });
//   }

//   private getGlobalUser() {
//     this.globalUserService
//       .getUserByUsername(this.tokenClaims.username)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(user => {
//         this.setGlobalUser(user);
//       });
//   }

//   private setGlobalUser(user: GlobalUser) {
//     this.globalUserSubject.next(user);
//   }

//   public capture(redirectable: string): void {
//     this.oAuthService.initImplicitFlow(redirectable);
//   }

//   public redirection(): void {
//     this.oAuthService.tryLogin({
//       onTokenReceived: info => {
//         window.location.href = info.state;
//       }
//     });
//   }

//   public obtainAccessToken() {
//     this.oAuthService.initImplicitFlow();
//   }

//   public refreshToken(): Promise<any> {
//     if (this.isRefreshing) {
//       console.log('Ya se está renovando el token, esperando...');
//       return Promise.resolve(false);
//     }

//     this.isRefreshing = true;
//     console.log('Iniciando renovación de token...');

//     // En modo testing, simular renovación exitosa
//     if (this.TESTING_MODE) {
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           console.log('🧪 Token renovado exitosamente (simulado)');
//           this.isRefreshing = false;
//           this.warningShown = false;
//           this.simulatedTokenStartTime = Date.now(); // Reiniciar contador
          
//           setTimeout(() => {
//             this.startTokenExpirationMonitoring();
//           }, 1000);
          
//           resolve(true);
//         }, 1000); // Simular delay de red
//       });
//     }

//     return this.oAuthService.refreshToken()
//       .then(() => {
//         console.log('Token renovado exitosamente');
//         this.isRefreshing = false;
//         this.warningShown = false;
        
//         // Reiniciar monitoreo con el nuevo token
//         setTimeout(() => {
//           this.startTokenExpirationMonitoring();
//         }, 1000);
        
//         return true;
//       })
//       .catch(error => {
//         console.error('Error al renovar token:', error);
//         this.isRefreshing = false;
        
//         // Verificar si es un error de CORS
//         if (this.isCorsError(error)) {
//           console.log('Error CORS detectado - intentando renovación mediante redirect');
//           this.handleCorsRefreshError();
//           return false;
//         } else {
//           this.handleTokenRefreshError();
//           return false;
//         }
//       });
//   }

//   private isCorsError(error: any): boolean {
//     return error.status === 0 || 
//            error.status === 302 ||
//            (error.message && error.message.includes('CORS')) ||
//            (error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0);
//   }

//   private handleCorsRefreshError(): void {
//     console.log('Manejando error CORS - ofreciendo opciones al usuario');
    
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '450px',
//       disableClose: true,
//       data: {
//         minutesLeft: this.getTokenTimeRemaining(),
//         corsError: true
//       }
//     });

//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(result => {
//         if (result === 'redirect-refresh') {
//           this.refreshTokenViaRedirect();
//         } else if (result === 'manual-refresh') {
//           this.openRefreshInNewTab();
//         } else {
//           this.logout();
//         }
//       });
//   }

//   private refreshTokenViaRedirect(): void {
//     console.log('Renovando token mediante redirect...');
//     // Guardar la URL actual para regresar después
//     localStorage.setItem('preRefreshUrl', window.location.href);
//     this.oAuthService.initImplicitFlow();
//   }

//   private openRefreshInNewTab(): void {
//     console.log('Abriendo renovación en nueva pestaña...');
//     const refreshUrl = this.oAuthService.issuer + '/oauth2endpoints/authz?' + 
//       'client_id=' + encodeURIComponent(this.oAuthService.clientId) +
//       '&response_type=token' +
//       '&scope=' + encodeURIComponent(this.oAuthService.scope) +
//       '&redirect_uri=' + encodeURIComponent(this.oAuthService.redirectUri);
    
//     window.open(refreshUrl, '_blank', 'width=600,height=600');
    
//     // Mostrar instrucciones al usuario
//     this.showManualRefreshInstructions();
//   }

//   private showManualRefreshInstructions(): void {
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '500px',
//       disableClose: true,
//       data: {
//         minutesLeft: this.getTokenTimeRemaining(),
//         manualRefreshInstructions: true
//       }
//     });

//     dialogRef.afterClosed().subscribe(() => {
//       // Verificar si el token se renovó
//       if (this.oAuthService.hasValidAccessToken()) {
//         console.log('Token renovado manualmente con éxito');
//         this.warningShown = false;
//         this.startTokenExpirationMonitoring();
//       } else {
//         this.logout();
//       }
//     });
//   }

//   public isLoggedIn(): boolean {
//     return this.oAuthService.getAccessToken() !== null;
//   }

//   public getUserName(): string {
//     const claims = this.getUserClaims();
//     if (claims === null) {
//       return '';
//     } else {
//       return claims['sub'].split('@')[0];
//     }
//   }

//   public getUserClaims(): object {
//     return this.oAuthService.getIdentityClaims();
//   }

//   public getUserInfo(): string {
//     const idToken = this.oAuthService.getIdToken();
//     if (idToken === null) {
//       return '';
//     } else {
//       return typeof idToken['sub'] !== 'undefined' ? idToken['sub'].toString() : '';
//     }
//   }

//   private startTokenExpirationMonitoring(): void {
//     console.log('Iniciando monitoreo de expiración de token');
    
//     // Detener monitoreo anterior
//     this.stopTokenExpirationMonitoring();
    
//     if (!this.isLoggedIn()) {
//       console.log('No hay token válido, saltando monitoreo');
//       return;
//     }

//     let expiresIn: number;
    
//     if (this.TESTING_MODE) {
//       // Simular token de 2 minutos
//       if (!this.simulatedTokenStartTime) {
//         this.simulatedTokenStartTime = Date.now();
//       }
//       expiresIn = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//       console.log(`🧪 MODO TESTING - Token simulado expira en: ${this.SIMULATED_TOKEN_DURATION_MINUTES} minutos`);
//     } else {
//       // Usar token real
//       const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//       if (!tokenExpiresAt) {
//         console.log('No se pudo obtener fecha de expiración del token');
//         return;
//       }
//       const now = Date.now();
//       expiresIn = tokenExpiresAt - now;
//       console.log(`Token expira en: ${Math.floor(expiresIn / 60000)} minutos`);
//     }
    
//     if (expiresIn <= 0) {
//       console.log('Token ya expirado');
//       this.handleTokenRefreshError();
//       return;
//     }

//     // Timer para advertencia
//     const warningTime = expiresIn - (this.WARNING_TIME_MINUTES * 60 * 1000);
//     if (warningTime > 0) {
//       console.log(`Advertencia programada en: ${Math.floor(warningTime / 60000)} minutos (${Math.floor(warningTime / 1000)} segundos)`);
//       this.warningTimer = timer(warningTime)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe(() => {
//           console.log('⚠️ Mostrando advertencia de expiración');
//           this.showExpirationWarning();
//         });
//     } else {
//       console.log('Tiempo de advertencia ya pasó, mostrando inmediatamente');
//       this.showExpirationWarning();
//     }

//     // Timer para renovación automática
//     const autoRefreshTime = expiresIn - (this.AUTO_REFRESH_TIME_MINUTES * 60 * 1000);
//     if (autoRefreshTime > 0) {
//       console.log(`Renovación automática programada en: ${Math.floor(autoRefreshTime / 60000)} minutos (${Math.floor(autoRefreshTime / 1000)} segundos)`);
//       this.autoRefreshTimer = timer(autoRefreshTime)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe(() => {
//           console.log('🔄 Ejecutando renovación automática');
//           this.attemptAutoRefresh();
//         });
//     } else if (!this.warningShown) {
//       console.log('Tiempo de renovación automática ya pasó, intentando inmediatamente');
//       this.attemptAutoRefresh();
//     }
//   }

//   private stopTokenExpirationMonitoring(): void {
//     console.log('Deteniendo monitoreo de expiración');
    
//     if (this.warningTimer) {
//       this.warningTimer.unsubscribe();
//       this.warningTimer = null;
//     }
    
//     if (this.autoRefreshTimer) {
//       this.autoRefreshTimer.unsubscribe();
//       this.autoRefreshTimer = null;
//     }
//   }

//   private showExpirationWarning(): void {
//     if (this.warningShown || !this.isLoggedIn()) {
//       console.log('Advertencia ya mostrada o no hay sesión válida');
//       return;
//     }
  
//     this.warningShown = true;
//     const minutesLeft = this.getTokenTimeRemaining();
  
//     console.log(`⚠️ Mostrando diálogo de expiración. Minutos restantes: ${minutesLeft}`);
  
//     // Asegurar que tenemos al menos 1 minuto para mostrar
//     const adjustedMinutes = Math.max(1, minutesLeft);
  
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '450px',
//       disableClose: true,
//       data: {
//         minutesLeft: adjustedMinutes
//       }
//     });
  
//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(result => {
//         console.log(`Resultado del diálogo: ${result}`);
//         if (result === 'refresh') {
//           this.refreshToken();
//         } else if (result === 'logout') {
//           this.logout();
//         }
//         // Reset la bandera para permitir futuras advertencias
//         this.warningShown = false;
//       });
//   }

//   private attemptAutoRefresh(): void {
//     if (!this.isLoggedIn()) {
//       console.log('No hay sesión válida para renovación automática');
//       return;
//     }

//     console.log('🔄 Intentando renovar token automáticamente...');
//     this.refreshToken().then(success => {
//       if (!success) {
//         console.log('Falló la renovación automática, mostrando diálogo de logout');
//         this.showForceLogoutDialog();
//       }
//     });
//   }

//   private handleTokenRefreshError(): void {
//     console.error('❌ No se pudo renovar el token. Cerrando sesión...');
//     this.showForceLogoutDialog();
//   }

//   private showForceLogoutDialog(): void {
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '400px',
//       disableClose: true,
//       data: {
//         minutesLeft: 0,
//         forceLogout: true
//       }
//     });

//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.logout();
//       });
//   }

//   public getTokenTimeRemaining(): number {
//   if (!this.isLoggedIn()) {
//     console.log('No hay sesión válida');
//     return 0;
//   }

//   if (this.TESTING_MODE) {
//     // Calcular tiempo simulado restante
//     if (!this.simulatedTokenStartTime) {
//       console.log('No hay tiempo de inicio simulado');
//       return 0;
//     }
    
//     const elapsed = Date.now() - this.simulatedTokenStartTime;
//     const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//     const remaining = totalDuration - elapsed;
//     const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
    
//     console.log('🧪 Tiempo simulado:', {
//       elapsed: Math.floor(elapsed / 1000) + 's',
//       totalDuration: this.SIMULATED_TOKEN_DURATION_MINUTES + 'min',
//       remaining: Math.floor(remaining / 1000) + 's',
//       minutesRemaining: minutesRemaining + 'min'
//     });
    
//     return minutesRemaining;
//   }

//   const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//   if (!tokenExpiresAt) {
//     console.log('No se pudo obtener fecha de expiración del token');
//     return 0;
//   }

//   const now = Date.now();
//   const remaining = tokenExpiresAt - now;
//   const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
  
//   console.log('Token real:', {
//     expiresAt: new Date(tokenExpiresAt).toLocaleTimeString(),
//     now: new Date(now).toLocaleTimeString(),
//     remaining: Math.floor(remaining / 1000) + 's',
//     minutesRemaining: minutesRemaining + 'min'
//   });
  
//   return minutesRemaining;
// }

// public getTokenSecondsRemaining(): number {
//   if (!this.isLoggedIn()) {
//     return 0;
//   }

//   if (this.TESTING_MODE) {
//     if (!this.simulatedTokenStartTime) {
//       return 0;
//     }
    
//     const elapsed = Date.now() - this.simulatedTokenStartTime;
//     const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//     const remaining = totalDuration - elapsed;
//     return Math.max(0, Math.floor(remaining / 1000));
//   }

//   const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//   if (!tokenExpiresAt) {
//     return 0;
//   }

//   const now = Date.now();
//   const remaining = tokenExpiresAt - now;
//   return Math.max(0, Math.floor(remaining / 1000));
// }


//   public isTokenNearExpiration(): boolean {
//     const timeRemaining = this.getTokenTimeRemaining();
//     return timeRemaining <= this.WARNING_TIME_MINUTES && timeRemaining > 0;
//   }

//   // Método para debugging
//   public getTokenExpirationInfo(): any {
//     if (!this.isLoggedIn()) {
//       return { valid: false };
//     }
  
//     const minutesLeft = this.getTokenTimeRemaining();
//     const secondsLeft = this.getTokenSecondsRemaining();
    
//     return {
//       valid: true,
//       testingMode: this.TESTING_MODE,
//       simulatedDuration: this.TESTING_MODE ? this.SIMULATED_TOKEN_DURATION_MINUTES : null,
//       simulatedStartTime: this.TESTING_MODE ? new Date(this.simulatedTokenStartTime) : null,
//       expiresAt: this.TESTING_MODE ? 
//         new Date(this.simulatedTokenStartTime + (this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000)) :
//         new Date(this.oAuthService.getAccessTokenExpiration()),
//       minutesLeft: minutesLeft,
//       secondsLeft: secondsLeft,
//       warningShown: this.warningShown,
//       isRefreshing: this.isRefreshing,
//       currentTime: new Date()
//     };
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//     this.stopTokenExpirationMonitoring();
//   }
// }


//valores reales
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { OAuthService } from 'angular-oauth2-oidc';
// import { HttpClient } from '@angular/common/http';
// import { MatDialog } from '@angular/material/dialog';

// import { environment } from 'src/environments/environment';
// import { GlobalUser } from 'src/app/types/user.types';
// import { GlobalUserService } from '../../http/user/global-user.service';
// import { TokenClaim } from 'src/app/types/token-claim.types';
// import { Usuario } from 'src/app/types/usuario.types';
// import { authConfig } from '../oauth.config';
// import { TokenExpirationDialogComponent } from '../../interceptors/token-expiration-dialog.component';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private readonly URL = environment.appApiUrl + '/user';

//   // 🧪 CONFIGURACIÓN PARA TESTING - Simular token de 2 minutos
//   private readonly TESTING_MODE = false; // ⚠️ Cambiar a true para testing
//   private readonly SIMULATED_TOKEN_DURATION_MINUTES = 2;
//   // private readonly WARNING_TIME_MINUTES = 0.5; // 30 segundos antes
//   // private readonly AUTO_REFRESH_TIME_MINUTES = 0.25; // 15 segundos antes
//   private readonly WARNING_TIME_MINUTES = 45;
// private readonly AUTO_REFRESH_TIME_MINUTES = 10;
//   // Variables para simulación
//   private simulatedTokenStartTime: number = 0;
  
//   // Mejor gestión de subscripciones
//   private destroy$ = new Subject<void>();
//   private warningTimer: Subscription;
//   private autoRefreshTimer: Subscription;
//   private warningShown = false;
//   private isRefreshing = false;

//   private globalUserSubject: BehaviorSubject<GlobalUser> = new BehaviorSubject<GlobalUser>(null);
//   globalUser$: Observable<GlobalUser> = this.globalUserSubject.asObservable();

//   constructor(
//     private oAuthService: OAuthService,
//     private globalUserService: GlobalUserService,
//     private http: HttpClient,
//     private dialog: MatDialog
//   ) {
//     this.configureOauthService();
//     this.startTokenExpirationMonitoring();
//   }

//   get tokenClaims(): TokenClaim {
//     return {
//       familyName: this.oAuthService.getIdentityClaims()['family_name'],
//       email: this.oAuthService.getIdentityClaims()['email'],
//       givenName: this.oAuthService.getIdentityClaims()['given_name'],
//       name: this.oAuthService.getIdentityClaims()['name'],
//       username: this.oAuthService.getIdentityClaims()['sub'],
//       preferredUsername: this.oAuthService.getIdentityClaims()['preferred_username']
//     };
//   }

//   get username(): string {
//     return this.oAuthService.getIdentityClaims()['sub'];
//   }

//   getByUserName(userName: string): Observable<Usuario> {
//     return this.http.get<Usuario>(`${this.URL}/userName/${userName}`);
//   }

//   login() {
//     if (!this.oAuthService.hasValidAccessToken()) {
//       this.oAuthService.initImplicitFlow();
//       return;
//     }
    
//     if (this.oAuthService.getIdentityClaims()) {
//       this.getGlobalUser();
//     }
//   }

//   logout() {
//     // Limpiar todas las subscripciones antes del logout
//     this.stopTokenExpirationMonitoring();
//     this.destroy$.next();
//     this.oAuthService.logOut();
//   }

//   private configureOauthService() {
//     this.oAuthService.configure(authConfig);
//     this.oAuthService.tryLogin({
//       onTokenReceived: () => {
//         console.log('Token recibido, configurando monitoreo');
//         // Inicializar tiempo de simulación
//         if (this.TESTING_MODE) {
//           this.simulatedTokenStartTime = Date.now();
//         }
//         this.getGlobalUser();
//         this.startTokenExpirationMonitoring();
//       }
//     });
//   }

//   private getGlobalUser() {
//     this.globalUserService
//       .getUserByUsername(this.tokenClaims.username)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(user => {
//         this.setGlobalUser(user);
//       });
//   }

//   private setGlobalUser(user: GlobalUser) {
//     this.globalUserSubject.next(user);
//   }

//   public capture(redirectable: string): void {
//     this.oAuthService.initImplicitFlow(redirectable);
//   }

//   public redirection(): void {
//     this.oAuthService.tryLogin({
//       onTokenReceived: info => {
//         window.location.href = info.state;
//       }
//     });
//   }

//   public obtainAccessToken() {
//     this.oAuthService.initImplicitFlow();
//   }

//   /**
//    * Obtiene los valores de expiración desde sessionStorage
//    */
//   private getTokenExpirationFromStorage(): { expiresAt: number; idTokenExpiresAt: number; storedAt: number } | null {
//     try {
//       const expiresAt = sessionStorage.getItem('expires_at');
//       const idTokenExpiresAt = sessionStorage.getItem('id_token_expires_at');
//       const storedAt = sessionStorage.getItem('id_token_stored_at');

//       if (!expiresAt || !idTokenExpiresAt || !storedAt) {
//         console.log('No se encontraron todos los valores de expiración en sessionStorage');
//         return null;
//       }

//       return {
//         expiresAt: parseInt(expiresAt, 10),
//         idTokenExpiresAt: parseInt(idTokenExpiresAt, 10),
//         storedAt: parseInt(storedAt, 10)
//       };
//     } catch (error) {
//       console.error('Error al leer valores de sessionStorage:', error);
//       return null;
//     }
//   }

//   public refreshToken(): Promise<any> {
//     if (this.isRefreshing) {
//       console.log('Ya se está renovando el token, esperando...');
//       return Promise.resolve(false);
//     }

//     this.isRefreshing = true;
//     console.log('Iniciando renovación de token...');

//     // En modo testing, simular renovación exitosa
//     if (this.TESTING_MODE) {
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           console.log('🧪 Token renovado exitosamente (simulado)');
//           this.isRefreshing = false;
//           this.warningShown = false;
//           this.simulatedTokenStartTime = Date.now(); // Reiniciar contador
          
//           setTimeout(() => {
//             this.startTokenExpirationMonitoring();
//           }, 1000);
          
//           resolve(true);
//         }, 1000); // Simular delay de red
//       });
//     }

//     return this.oAuthService.refreshToken()
//       .then(() => {
//         console.log('Token renovado exitosamente');
//         this.isRefreshing = false;
//         this.warningShown = false;
        
//         // Reiniciar monitoreo con el nuevo token
//         setTimeout(() => {
//           this.startTokenExpirationMonitoring();
//         }, 1000);
        
//         return true;
//       })
//       .catch(error => {
//         console.error('Error al renovar token:', error);
//         this.isRefreshing = false;
        
//         // Verificar si es un error de CORS
//         if (this.isCorsError(error)) {
//           console.log('Error CORS detectado - intentando renovación mediante redirect');
//           this.handleCorsRefreshError();
//           return false;
//         } else {
//           this.handleTokenRefreshError();
//           return false;
//         }
//       });
//   }

//   private isCorsError(error: any): boolean {
//     return error.status === 0 || 
//            error.status === 302 ||
//            (error.message && error.message.includes('CORS')) ||
//            (error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0);
//   }

//   private handleCorsRefreshError(): void {
//     console.log('Manejando error CORS - ofreciendo opciones al usuario');
    
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '450px',
//       disableClose: true,
//       data: {
//         minutesLeft: this.getTokenTimeRemaining(),
//         corsError: true
//       }
//     });

//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(result => {
//         if (result === 'redirect-refresh') {
//           this.refreshTokenViaRedirect();
//         } else if (result === 'manual-refresh') {
//           this.openRefreshInNewTab();
//         } else {
//           this.logout();
//         }
//       });
//   }

//   private refreshTokenViaRedirect(): void {
//     console.log('Renovando token mediante redirect...');
//     // Guardar la URL actual para regresar después
//     localStorage.setItem('preRefreshUrl', window.location.href);
//     this.oAuthService.initImplicitFlow();
//   }

//   private openRefreshInNewTab(): void {
//     console.log('Abriendo renovación en nueva pestaña...');
//     const refreshUrl = this.oAuthService.issuer + '/oauth2endpoints/authz?' + 
//       'client_id=' + encodeURIComponent(this.oAuthService.clientId) +
//       '&response_type=token' +
//       '&scope=' + encodeURIComponent(this.oAuthService.scope) +
//       '&redirect_uri=' + encodeURIComponent(this.oAuthService.redirectUri);
    
//     window.open(refreshUrl, '_blank', 'width=600,height=600');
    
//     // Mostrar instrucciones al usuario
//     this.showManualRefreshInstructions();
//   }

//   private showManualRefreshInstructions(): void {
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '500px',
//       disableClose: true,
//       data: {
//         minutesLeft: this.getTokenTimeRemaining(),
//         manualRefreshInstructions: true
//       }
//     });

//     dialogRef.afterClosed().subscribe(() => {
//       // Verificar si el token se renovó
//       if (this.oAuthService.hasValidAccessToken()) {
//         console.log('Token renovado manualmente con éxito');
//         this.warningShown = false;
//         this.startTokenExpirationMonitoring();
//       } else {
//         this.logout();
//       }
//     });
//   }

//   public isLoggedIn(): boolean {
//     return this.oAuthService.getAccessToken() !== null;
//   }

//   public getUserName(): string {
//     const claims = this.getUserClaims();
//     if (claims === null) {
//       return '';
//     } else {
//       return claims['sub'].split('@')[0];
//     }
//   }

//   public getUserClaims(): object {
//     return this.oAuthService.getIdentityClaims();
//   }

//   public getUserInfo(): string {
//     const idToken = this.oAuthService.getIdToken();
//     if (idToken === null) {
//       return '';
//     } else {
//       return typeof idToken['sub'] !== 'undefined' ? idToken['sub'].toString() : '';
//     }
//   }

//   private startTokenExpirationMonitoring(): void {
//     console.log('Iniciando monitoreo de expiración de token');
    
//     // Detener monitoreo anterior
//     this.stopTokenExpirationMonitoring();
    
//     if (!this.isLoggedIn()) {
//       console.log('No hay token válido, saltando monitoreo');
//       return;
//     }

//     let expiresIn: number;
    
//     if (this.TESTING_MODE) {
//       // Simular token de 2 minutos
//       if (!this.simulatedTokenStartTime) {
//         this.simulatedTokenStartTime = Date.now();
//       }
//       expiresIn = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//       console.log(`🧪 MODO TESTING - Token simulado expira en: ${this.SIMULATED_TOKEN_DURATION_MINUTES} minutos`);
//     } else {
//       // Usar valores reales del sessionStorage
//       const storageTokenInfo = this.getTokenExpirationFromStorage();
      
//       if (storageTokenInfo) {
//         // Usar el expires_at del sessionStorage
//         const now = Date.now();
//         expiresIn = storageTokenInfo.expiresAt - now;
        
//         console.log('📦 Usando valores del sessionStorage:', {
//           expiresAt: new Date(storageTokenInfo.expiresAt).toLocaleString(),
//           idTokenExpiresAt: new Date(storageTokenInfo.idTokenExpiresAt).toLocaleString(),
//           storedAt: new Date(storageTokenInfo.storedAt).toLocaleString(),
//           now: new Date(now).toLocaleString(),
//           expiresInMinutes: Math.floor(expiresIn / 60000)
//         });
//       } else {
//         // Fallback al método tradicional de angular-oauth2-oidc
//         const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//         if (!tokenExpiresAt) {
//           console.log('No se pudo obtener fecha de expiración del token');
//           return;
//         }
//         const now = Date.now();
//         expiresIn = tokenExpiresAt - now;
//         console.log(`📅 Usando OAuth Service - Token expira en: ${Math.floor(expiresIn / 60000)} minutos`);
//       }
//     }
    
//     if (expiresIn <= 0) {
//       console.log('Token ya expirado');
//       this.handleTokenRefreshError();
//       return;
//     }

//     // Timer para advertencia
//     const warningTime = expiresIn - (this.WARNING_TIME_MINUTES * 60 * 1000);
//     if (warningTime > 0) {
//       console.log(`Advertencia programada en: ${Math.floor(warningTime / 60000)} minutos (${Math.floor(warningTime / 1000)} segundos)`);
//       this.warningTimer = timer(warningTime)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe(() => {
//           console.log('⚠️ Mostrando advertencia de expiración');
//           this.showExpirationWarning();
//         });
//     } else {
//       console.log('Tiempo de advertencia ya pasó, mostrando inmediatamente');
//       this.showExpirationWarning();
//     }

//     // Timer para renovación automática
//     const autoRefreshTime = expiresIn - (this.AUTO_REFRESH_TIME_MINUTES * 60 * 1000);
//     if (autoRefreshTime > 0) {
//       console.log(`Renovación automática programada en: ${Math.floor(autoRefreshTime / 60000)} minutos (${Math.floor(autoRefreshTime / 1000)} segundos)`);
//       this.autoRefreshTimer = timer(autoRefreshTime)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe(() => {
//           console.log('🔄 Ejecutando renovación automática');
//           this.attemptAutoRefresh();
//         });
//     } else if (!this.warningShown) {
//       console.log('Tiempo de renovación automática ya pasó, intentando inmediatamente');
//       this.attemptAutoRefresh();
//     }
//   }

//   private stopTokenExpirationMonitoring(): void {
//     console.log('Deteniendo monitoreo de expiración');
    
//     if (this.warningTimer) {
//       this.warningTimer.unsubscribe();
//       this.warningTimer = null;
//     }
    
//     if (this.autoRefreshTimer) {
//       this.autoRefreshTimer.unsubscribe();
//       this.autoRefreshTimer = null;
//     }
//   }

//   private showExpirationWarning(): void {
//     if (this.warningShown || !this.isLoggedIn()) {
//       console.log('Advertencia ya mostrada o no hay sesión válida');
//       return;
//     }
  
//     this.warningShown = true;
//     const minutesLeft = this.getTokenTimeRemaining();
  
//     console.log(`⚠️ Mostrando diálogo de expiración. Minutos restantes: ${minutesLeft}`);
  
//     // Asegurar que tenemos al menos 1 minuto para mostrar
//     const adjustedMinutes = Math.max(1, minutesLeft);
  
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '450px',
//       disableClose: true,
//       data: {
//         minutesLeft: adjustedMinutes
//       }
//     });
  
//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(result => {
//         console.log(`Resultado del diálogo: ${result}`);
//         if (result === 'refresh') {
//           this.refreshToken();
//         } else if (result === 'logout') {
//           this.logout();
//         }
//         // Reset la bandera para permitir futuras advertencias
//         this.warningShown = false;
//       });
//   }

//   private attemptAutoRefresh(): void {
//     if (!this.isLoggedIn()) {
//       console.log('No hay sesión válida para renovación automática');
//       return;
//     }

//     console.log('🔄 Intentando renovar token automáticamente...');
//     this.refreshToken().then(success => {
//       if (!success) {
//         console.log('Falló la renovación automática, mostrando diálogo de logout');
//         this.showForceLogoutDialog();
//       }
//     });
//   }

//   private handleTokenRefreshError(): void {
//     console.error('❌ No se pudo renovar el token. Cerrando sesión...');
//     this.showForceLogoutDialog();
//   }

//   private showForceLogoutDialog(): void {
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '400px',
//       disableClose: true,
//       data: {
//         minutesLeft: 0,
//         forceLogout: true
//       }
//     });

//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.logout();
//       });
//   }

//   public getTokenTimeRemaining(): number {
//     if (!this.isLoggedIn()) {
//       console.log('No hay sesión válida');
//       return 0;
//     }

//     if (this.TESTING_MODE) {
//       // Calcular tiempo simulado restante
//       if (!this.simulatedTokenStartTime) {
//         console.log('No hay tiempo de inicio simulado');
//         return 0;
//       }
      
//       const elapsed = Date.now() - this.simulatedTokenStartTime;
//       const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//       const remaining = totalDuration - elapsed;
//       const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
      
//       console.log('🧪 Tiempo simulado:', {
//         elapsed: Math.floor(elapsed / 1000) + 's',
//         totalDuration: this.SIMULATED_TOKEN_DURATION_MINUTES + 'min',
//         remaining: Math.floor(remaining / 1000) + 's',
//         minutesRemaining: minutesRemaining + 'min'
//       });
      
//       return minutesRemaining;
//     }

//     // Usar valores reales del sessionStorage
//     const storageTokenInfo = this.getTokenExpirationFromStorage();
    
//     if (storageTokenInfo) {
//       const now = Date.now();
//       const remaining = storageTokenInfo.expiresAt - now;
//       const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
      
//       console.log('📦 Tiempo desde sessionStorage:', {
//         expiresAt: new Date(storageTokenInfo.expiresAt).toLocaleTimeString(),
//         now: new Date(now).toLocaleTimeString(),
//         remaining: Math.floor(remaining / 1000) + 's',
//         minutesRemaining: minutesRemaining + 'min'
//       });
      
//       return minutesRemaining;
//     }

//     // Fallback al método tradicional
//     const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//     if (!tokenExpiresAt) {
//       console.log('No se pudo obtener fecha de expiración del token');
//       return 0;
//     }

//     const now = Date.now();
//     const remaining = tokenExpiresAt - now;
//     const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
    
//     console.log('📅 Tiempo desde OAuth Service:', {
//       expiresAt: new Date(tokenExpiresAt).toLocaleTimeString(),
//       now: new Date(now).toLocaleTimeString(),
//       remaining: Math.floor(remaining / 1000) + 's',
//       minutesRemaining: minutesRemaining + 'min'
//     });
    
//     return minutesRemaining;
//   }

//   public getTokenSecondsRemaining(): number {
//     if (!this.isLoggedIn()) {
//       return 0;
//     }

//     if (this.TESTING_MODE) {
//       if (!this.simulatedTokenStartTime) {
//         return 0;
//       }
      
//       const elapsed = Date.now() - this.simulatedTokenStartTime;
//       const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//       const remaining = totalDuration - elapsed;
//       return Math.max(0, Math.floor(remaining / 1000));
//     }

//     // Usar valores reales del sessionStorage
//     const storageTokenInfo = this.getTokenExpirationFromStorage();
    
//     if (storageTokenInfo) {
//       const now = Date.now();
//       const remaining = storageTokenInfo.expiresAt - now;
//       return Math.max(0, Math.floor(remaining / 1000));
//     }

//     // Fallback al método tradicional
//     const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//     if (!tokenExpiresAt) {
//       return 0;
//     }

//     const now = Date.now();
//     const remaining = tokenExpiresAt - now;
//     return Math.max(0, Math.floor(remaining / 1000));
//   }

//   public isTokenNearExpiration(): boolean {
//     const timeRemaining = this.getTokenTimeRemaining();
//     return timeRemaining <= this.WARNING_TIME_MINUTES && timeRemaining > 0;
//   }

//   // Método para debugging
//   public getTokenExpirationInfo(): any {
//     if (!this.isLoggedIn()) {
//       return { valid: false };
//     }
  
//     const minutesLeft = this.getTokenTimeRemaining();
//     const secondsLeft = this.getTokenSecondsRemaining();
//     const storageTokenInfo = this.getTokenExpirationFromStorage();
    
//     return {
//       valid: true,
//       testingMode: this.TESTING_MODE,
//       simulatedDuration: this.TESTING_MODE ? this.SIMULATED_TOKEN_DURATION_MINUTES : null,
//       simulatedStartTime: this.TESTING_MODE ? new Date(this.simulatedTokenStartTime) : null,
//       sessionStorageInfo: storageTokenInfo ? {
//         expiresAt: new Date(storageTokenInfo.expiresAt),
//         idTokenExpiresAt: new Date(storageTokenInfo.idTokenExpiresAt),
//         storedAt: new Date(storageTokenInfo.storedAt)
//       } : null,
//       oauthServiceExpiresAt: this.oAuthService.getAccessTokenExpiration() ? 
//         new Date(this.oAuthService.getAccessTokenExpiration()) : null,
//       minutesLeft: minutesLeft,
//       secondsLeft: secondsLeft,
//       warningShown: this.warningShown,
//       isRefreshing: this.isRefreshing,
//       currentTime: new Date()
//     };
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//     this.stopTokenExpirationMonitoring();
//   }
// }




//casi
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { OAuthService } from 'angular-oauth2-oidc';
// import { HttpClient } from '@angular/common/http';
// import { MatDialog } from '@angular/material/dialog';

// import { environment } from 'src/environments/environment';
// import { GlobalUser } from 'src/app/types/user.types';
// import { GlobalUserService } from '../../http/user/global-user.service';
// import { TokenClaim } from 'src/app/types/token-claim.types';
// import { Usuario } from 'src/app/types/usuario.types';
// import { authConfig } from '../oauth.config';
// import { TokenExpirationDialogComponent } from '../../interceptors/token-expiration-dialog.component';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private readonly URL = environment.appApiUrl + '/user';

//   // 🧪 CONFIGURACIÓN PARA TESTING - Simular token de 2 minutos
//   private readonly TESTING_MODE = false; // ⚠️ Cambiar a true para testing
//   private readonly SIMULATED_TOKEN_DURATION_MINUTES = 45;
//   // ⚠️ ALARMA CONFIGURADA PARA 55 MINUTOS ANTES DE EXPIRAR
//   private readonly WARNING_TIME_MINUTES = 3; // Cambiado de 5 a 55 minutos
//   private readonly AUTO_REFRESH_TIME_MINUTES = 1;
//   // Variables para simulación
//   private simulatedTokenStartTime: number = 0;
  
//   // Mejor gestión de subscripciones
//   private destroy$ = new Subject<void>();
//   private warningTimer: Subscription;
//   private autoRefreshTimer: Subscription;
//   private warningShown = false;
//   private isRefreshing = false;

//   private globalUserSubject: BehaviorSubject<GlobalUser> = new BehaviorSubject<GlobalUser>(null);
//   globalUser$: Observable<GlobalUser> = this.globalUserSubject.asObservable();

//   constructor(
//     private oAuthService: OAuthService,
//     private globalUserService: GlobalUserService,
//     private http: HttpClient,
//     private dialog: MatDialog
//   ) {
//     this.configureOauthService();
//     this.startTokenExpirationMonitoring();
//   }

//   get tokenClaims(): TokenClaim {
//     return {
//       familyName: this.oAuthService.getIdentityClaims()['family_name'],
//       email: this.oAuthService.getIdentityClaims()['email'],
//       givenName: this.oAuthService.getIdentityClaims()['given_name'],
//       name: this.oAuthService.getIdentityClaims()['name'],
//       username: this.oAuthService.getIdentityClaims()['sub'],
//       preferredUsername: this.oAuthService.getIdentityClaims()['preferred_username']
//     };
//   }

//   get username(): string {
//     return this.oAuthService.getIdentityClaims()['sub'];
//   }

//   getByUserName(userName: string): Observable<Usuario> {
//     return this.http.get<Usuario>(`${this.URL}/userName/${userName}`);
//   }

//   login() {
//     if (!this.oAuthService.hasValidAccessToken()) {
//       this.oAuthService.initImplicitFlow();
//       return;
//     }
    
//     if (this.oAuthService.getIdentityClaims()) {
//       this.getGlobalUser();
//     }
//   }

//   logout() {
//     // Limpiar todas las subscripciones antes del logout
//     this.stopTokenExpirationMonitoring();
//     this.destroy$.next();
//     this.oAuthService.logOut();
//   }

//   private configureOauthService() {
//     // Configuración mejorada para CORS
//     const corsConfig = {
//       ...authConfig,
//       // Usar silent refresh para evitar redirects completos
//       silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
//       silentRefreshTimeout: 5000,
//       // Configurar para manejar errores CORS
//       clearHashAfterLogin: false,
//       // Usar PKCE si está disponible
//       useSilentRefresh: true
//     };

//     this.oAuthService.configure(corsConfig);
    
//     // Configurar manejo de eventos
//     this.oAuthService.events.subscribe(event => {
//       if (event.type === 'silent_refresh_error') {
//         console.log('Silent refresh falló, usando redirect');
//         this.handleSilentRefreshError();
//       }
//     });

//     this.oAuthService.tryLogin({
//       onTokenReceived: () => {
//         console.log('Token recibido, configurando monitoreo');
//         if (this.TESTING_MODE) {
//           this.simulatedTokenStartTime = Date.now();
//         }
//         this.getGlobalUser();
//         this.startTokenExpirationMonitoring();
//       }
//     });
//   }

//   public async refreshToken(): Promise<boolean> {
//     if (this.isRefreshing) {
//       console.log('Refresco ya en progreso, esperando...');
//       return false;
//     }
  
//     this.isRefreshing = true;
    
//     // Modo testing - Simular refresco exitoso
//     if (this.TESTING_MODE) {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       this.isRefreshing = false;
//       this.warningShown = false;
//       this.simulatedTokenStartTime = Date.now();
//       this.startTokenExpirationMonitoring();
//       return true;
//     }
  
//     try {
//       this.refreshTokenViaRedirect();
//       return true;
//   } catch (error) {
//       console.error('Error en renovación:', error);
//       return false;
//   } finally {
//       this.isRefreshing = false;
//   }
//   }
  
//   private async handleCorsWithIframe(): Promise<boolean> {
//     try {
//       console.log('Iniciando refresco con iframe...');
//       const iframe = document.createElement('iframe');
//       iframe.style.display = 'none';
//       iframe.src = this.buildAuthUrl() + '&prompt=none';
      
//       const result = await new Promise<boolean>((resolve) => {
//         iframe.onload = () => {
//           setTimeout(() => {
//             document.body.removeChild(iframe);
//             if (this.oAuthService.hasValidAccessToken()) {
//               console.log('Refresco con iframe exitoso');
//               this.warningShown = false;
//               this.startTokenExpirationMonitoring();
//               resolve(true);
//             } else {
//               console.log('Refresco con iframe falló');
//               resolve(false);
//             }
//           }, 2000);
//         };
        
//         iframe.onerror = () => {
//           document.body.removeChild(iframe);
//           console.log('Error en iframe');
//           resolve(false);
//         };
        
//         document.body.appendChild(iframe);
//       });
      
//       this.isRefreshing = false;
//       return result;
      
//     } catch (error) {
//       console.error('Error en refresco con iframe:', error);
//       this.isRefreshing = false;
//       this.handleCorsRefreshError();
//       return false;
//     }
//   }
  
//   private buildAuthUrl(): string {
//     const params = new URLSearchParams({
//       client_id: this.oAuthService.clientId,
//       response_type: 'token',
//       scope: this.oAuthService.scope,
//       redirect_uri: this.oAuthService.redirectUri,
//       state: Math.random().toString(36).substring(2),
//       nonce: Math.random().toString(36).substring(2)
//     });
    
//     return `${this.oAuthService.issuer}?${params.toString()}`;
//   }

//   // 3. Nuevo método para manejar errores de silent refresh
//   private handleSilentRefreshError(): void {
//     console.log('Silent refresh error - usando estrategia de fallback');
//     this.handleCorsRefreshError();
//   }

//   // 4. Mejorar el manejo de CORS con más opciones
//   private handleCorsRefreshError(): void {
//     console.log('Manejando error CORS - ofreciendo opciones al usuario');
    
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '500px',
//       disableClose: true,
//       data: {
//         minutesLeft: this.getTokenTimeRemaining(),
//         corsError: true,
//         corsOptions: {
//           canUseSilentRefresh: this.canUseSilentRefresh(),
//           canUsePopup: this.canUsePopup(),
//           canUseRedirect: true
//         }
//       }
//     });

//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(result => {
//         switch (result) {
//           case 'popup-refresh':
//             this.refreshTokenViaPopup();
//             break;
//           case 'redirect-refresh':
//             this.refreshTokenViaRedirect();
//             break;
//           case 'manual-refresh':
//             this.openRefreshInNewTab();
//             break;
//           case 'iframe-refresh':
//             this.refreshTokenViaIframe();
//             break;
//           default:
//             this.logout();
//         }
//       });
//   }

//   // 5. Nuevos métodos alternativos para renovación
//   private canUseSilentRefresh(): boolean {
//     return this.oAuthService.silentRefreshRedirectUri !== null;
//   }

//   private canUsePopup(): boolean {
//     // Verificar si el navegador permite popups
//     return !window.navigator.userAgent.includes('Mobile');
//   }

//   private refreshTokenViaPopup(): void {
//     console.log('Renovando token mediante popup...');
    
//     const popup = window.open(
//       this.buildAuthUrl(),
//       'oauth-refresh',
//       'width=500,height=600,scrollbars=yes,resizable=yes'
//     );

//     if (!popup) {
//       console.log('Popup bloqueado, usando redirect');
//       this.refreshTokenViaRedirect();
//       return;
//     }

//     // Monitorear el popup
//     const checkClosed = setInterval(() => {
//       if (popup.closed) {
//         clearInterval(checkClosed);
//         // Verificar si el token se renovó
//         setTimeout(() => {
//           if (this.oAuthService.hasValidAccessToken()) {
//             console.log('Token renovado via popup');
//             this.warningShown = false;
//             this.startTokenExpirationMonitoring();
//           } else {
//             console.log('Renovación via popup falló');
//             this.refreshTokenViaRedirect();
//           }
//         }, 1000);
//       }
//     }, 1000);
//   }

//   private refreshTokenViaIframe(): void {
//     console.log('Intentando renovación via iframe...');
    
//     const iframe = document.createElement('iframe');
//     iframe.style.display = 'none';
//     iframe.src = this.buildAuthUrl() + '&prompt=none';
    
//     iframe.onload = () => {
//       try {
//         // Verificar si el token se renovó
//         setTimeout(() => {
//           document.body.removeChild(iframe);
//           if (this.oAuthService.hasValidAccessToken()) {
//             console.log('Token renovado via iframe');
//             this.warningShown = false;
//             this.startTokenExpirationMonitoring();
//           } else {
//             console.log('Renovación via iframe falló, usando redirect');
//             this.refreshTokenViaRedirect();
//           }
//         }, 2000);
//       } catch (error) {
//         console.log('Error en iframe refresh:', error);
//         document.body.removeChild(iframe);
//         this.refreshTokenViaRedirect();
//       }
//     };

//     iframe.onerror = () => {
//       console.log('Error cargando iframe, usando redirect');
//       document.body.removeChild(iframe);
//       this.refreshTokenViaRedirect();
//     };

//     document.body.appendChild(iframe);
//   }

 
//   // 6. Mejorar la renovación via redirect
//   private refreshTokenViaRedirect(): void {
//     console.log('Renovando token mediante redirect...');
    
//     // Guardar estado actual antes de redirigir
//     const currentState = {
//         url: window.location.href,
//         timestamp: Date.now(),
//         reason: 'cors-refresh'
//     };
//     sessionStorage.setItem('preRefreshState', JSON.stringify(currentState));
    
//     // Parámetros para renovación silenciosa
//     this.oAuthService.initImplicitFlow(
//         undefined,
//         { 
//             prompt: 'none', // Evita mostrar la pantalla de login
//             max_age: '0'    // Fuerza verificación de sesión SSO
//         }
//     );
// }

//   // 7. Método para recuperar estado después de redirect
//   public handlePostRefreshRedirect(): void {
//     const savedState = sessionStorage.getItem('preRefreshState');
//     if (savedState) {
//         const state = JSON.parse(savedState);
//         sessionStorage.removeItem('preRefreshState');
        
//         if (this.oAuthService.hasValidAccessToken()) {
//             // Restaurar la ubicación original
//             if (state.url !== window.location.href) {
//                 window.location.href = state.url;
//             }
//         }
//     }
// }

//   // 8. Método para verificar y manejar CORS en el inicio
//   public async initializeWithCorsCheck(): Promise<void> {
//     try {
//       // Verificar conectividad con el servidor OAuth
//       const response = await fetch(this.oAuthService.issuer + '/.well-known/openid_configuration', {
//         method: 'HEAD',
//         mode: 'cors'
//       });
      
//       if (!response.ok) {
//         console.warn('Posibles problemas de CORS detectados');
//       }
//     } catch (error) {
//       console.warn('Error de conectividad o CORS:', error);
//       // Configurar modo de compatibilidad con CORS
//       this.enableCorsCompatibilityMode();
//     }
//   }

//   private enableCorsCompatibilityMode(): void {
//     console.log('Habilitando modo de compatibilidad CORS');
    
//     // Configurar opciones más permisivas
//     this.oAuthService.configure({
//       ...authConfig,
//       // Desactivar verificaciones que pueden fallar con CORS
//       disableAtHashCheck: true,
//       skipIssuerCheck: true,
//       // Usar timeouts más largos
//       timeoutFactor: 0.8,
//       // Configurar para manejar redirects
//       clearHashAfterLogin: false
//     });
//   }

//   private getGlobalUser() {
//     this.globalUserService
//       .getUserByUsername(this.tokenClaims.username)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(user => {
//         this.setGlobalUser(user);
//       });
//   }

//   private setGlobalUser(user: GlobalUser) {
//     this.globalUserSubject.next(user);
//   }

//   public capture(redirectable: string): void {
//     this.oAuthService.initImplicitFlow(redirectable);
//   }

//   public redirection(): void {
//     this.oAuthService.tryLogin({
//       onTokenReceived: info => {
//         window.location.href = info.state;
//       }
//     });
//   }

//   public obtainAccessToken() {
//     this.oAuthService.initImplicitFlow();
//   }

//   /**
//    * Obtiene los valores de expiración desde sessionStorage
//    */
//   private getTokenExpirationFromStorage(): { expiresAt: number; idTokenExpiresAt: number; storedAt: number } | null {
//     try {
//       const expiresAt = sessionStorage.getItem('expires_at');
//       const idTokenExpiresAt = sessionStorage.getItem('id_token_expires_at');
//       const storedAt = sessionStorage.getItem('id_token_stored_at');

//       if (!expiresAt || !idTokenExpiresAt || !storedAt) {
//         console.log('No se encontraron todos los valores de expiración en sessionStorage');
//         return null;
//       }

//       return {
//         expiresAt: parseInt(expiresAt, 10),
//         idTokenExpiresAt: parseInt(idTokenExpiresAt, 10),
//         storedAt: parseInt(storedAt, 10)
//       };
//     } catch (error) {
//       console.error('Error al leer valores de sessionStorage:', error);
//       return null;
//     }
//   }


//   private isCorsError(error: any): boolean {
//     return error.status === 0 || 
//            error.status === 302 ||
//            (error.message && error.message.includes('CORS')) ||
//            (error.error && typeof error.error === 'object' && Object.keys(error.error).length === 0);
//   }

  


//   private openRefreshInNewTab(): void {
//     console.log('Abriendo renovación en nueva pestaña...');
//     const refreshUrl = this.oAuthService.issuer + '/oauth2endpoints/authz?' + 
//       'client_id=' + encodeURIComponent(this.oAuthService.clientId) +
//       '&response_type=token' +
//       '&scope=' + encodeURIComponent(this.oAuthService.scope) +
//       '&redirect_uri=' + encodeURIComponent(this.oAuthService.redirectUri);
    
//     window.open(refreshUrl, '_blank', 'width=600,height=600');
    
//     // Mostrar instrucciones al usuario
//     this.showManualRefreshInstructions();
//   }

//   private showManualRefreshInstructions(): void {
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '500px',
//       disableClose: true,
//       data: {
//         minutesLeft: this.getTokenTimeRemaining(),
//         manualRefreshInstructions: true
//       }
//     });

//     dialogRef.afterClosed().subscribe(() => {
//       // Verificar si el token se renovó
//       if (this.oAuthService.hasValidAccessToken()) {
//         console.log('Token renovado manualmente con éxito');
//         this.warningShown = false;
//         this.startTokenExpirationMonitoring();
//       } else {
//         this.logout();
//       }
//     });
//   }

//   public isLoggedIn(): boolean {
//     return this.oAuthService.getAccessToken() !== null;
//   }

//   public getUserName(): string {
//     const claims = this.getUserClaims();
//     if (claims === null) {
//       return '';
//     } else {
//       return claims['sub'].split('@')[0];
//     }
//   }

//   public getUserClaims(): object {
//     return this.oAuthService.getIdentityClaims();
//   }

//   public getUserInfo(): string {
//     const idToken = this.oAuthService.getIdToken();
//     if (idToken === null) {
//       return '';
//     } else {
//       return typeof idToken['sub'] !== 'undefined' ? idToken['sub'].toString() : '';
//     }
//   }

//   private startTokenExpirationMonitoring(): void {
//     console.log('Iniciando monitoreo de expiración de token');
    
//     // Detener monitoreo anterior
//     this.stopTokenExpirationMonitoring();
    
//     if (!this.isLoggedIn()) {
//       console.log('No hay token válido, saltando monitoreo');
//       return;
//     }

//     let expiresIn: number;
    
//     if (this.TESTING_MODE) {
//       // Simular token de 2 minutos
//       if (!this.simulatedTokenStartTime) {
//         this.simulatedTokenStartTime = Date.now();
//       }
//       expiresIn = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//       console.log(`🧪 MODO TESTING - Token simulado expira en: ${this.SIMULATED_TOKEN_DURATION_MINUTES} minutos`);
//     } else {
//       // Usar valores reales del sessionStorage
//       const storageTokenInfo = this.getTokenExpirationFromStorage();
      
//       if (storageTokenInfo) {
//         // Usar el expires_at del sessionStorage
//         const now = Date.now();
//         expiresIn = storageTokenInfo.expiresAt - now;
        
//         console.log('📦 Usando valores del sessionStorage:', {
//           expiresAt: new Date(storageTokenInfo.expiresAt).toLocaleString(),
//           idTokenExpiresAt: new Date(storageTokenInfo.idTokenExpiresAt).toLocaleString(),
//           storedAt: new Date(storageTokenInfo.storedAt).toLocaleString(),
//           now: new Date(now).toLocaleString(),
//           expiresInMinutes: Math.floor(expiresIn / 60000)
//         });
//       } else {
//         // Fallback al método tradicional de angular-oauth2-oidc
//         const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//         if (!tokenExpiresAt) {
//           console.log('No se pudo obtener fecha de expiración del token');
//           return;
//         }
//         const now = Date.now();
//         expiresIn = tokenExpiresAt - now;
//         console.log(`📅 Usando OAuth Service - Token expira en: ${Math.floor(expiresIn / 60000)} minutos`);
//       }
//     }
    
//     if (expiresIn <= 0) {
//       console.log('Token ya expirado');
//       this.handleTokenRefreshError();
//       return;
//     }

//     // Timer para advertencia - AHORA SE ACTIVA 55 MINUTOS ANTES
//     const warningTime = expiresIn - (this.WARNING_TIME_MINUTES * 60 * 1000);
//     if (warningTime > 0) {
//       console.log(`🚨 ALARMA programada en: ${Math.floor(warningTime / 60000)} minutos (${Math.floor(warningTime / 1000)} segundos) - Se activará cuando falten ${this.WARNING_TIME_MINUTES} minutos`);
//       this.warningTimer = timer(warningTime)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe(() => {
//           console.log(`⚠️ 🚨 ALARMA ACTIVADA - Faltan ${this.WARNING_TIME_MINUTES} minutos para expirar el token`);
//           this.showExpirationWarning();
//         });
//     } else {
//       console.log('Tiempo de advertencia ya pasó, mostrando inmediatamente');
//       this.showExpirationWarning();
//     }

//     // Timer para renovación automática
//     const autoRefreshTime = expiresIn - (this.AUTO_REFRESH_TIME_MINUTES * 60 * 1000);
//     if (autoRefreshTime > 0) {
//       console.log(`Renovación automática programada en: ${Math.floor(autoRefreshTime / 60000)} minutos (${Math.floor(autoRefreshTime / 1000)} segundos)`);
//       this.autoRefreshTimer = timer(autoRefreshTime)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe(() => {
//           console.log('🔄 Ejecutando renovación automática');
//           this.attemptAutoRefresh();
//         });
//     } else if (!this.warningShown) {
//       console.log('Tiempo de renovación automática ya pasó, intentando inmediatamente');
//       this.attemptAutoRefresh();
//     }
//   }

//   private stopTokenExpirationMonitoring(): void {
//     console.log('Deteniendo monitoreo de expiración');
    
//     if (this.warningTimer) {
//       this.warningTimer.unsubscribe();
//       this.warningTimer = null;
//     }
    
//     if (this.autoRefreshTimer) {
//       this.autoRefreshTimer.unsubscribe();
//       this.autoRefreshTimer = null;
//     }
//   }

//   private showExpirationWarning(): void {
//     if (this.warningShown || !this.isLoggedIn()) {
//       console.log('Advertencia ya mostrada o no hay sesión válida');
//       return;
//     }
  
//     this.warningShown = true;
//     const minutesLeft = this.getTokenTimeRemaining();
  
//     console.log(`⚠️ 🚨 ALARMA ACTIVADA - Mostrando diálogo de expiración. Minutos restantes: ${minutesLeft}`);
  
//     // Asegurar que tenemos al menos 1 minuto para mostrar
//     const adjustedMinutes = Math.max(1, minutesLeft);
  
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '450px',
//       disableClose: true,
//       data: {
//         minutesLeft: adjustedMinutes
//       }
//     });
  
//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(result => {
//         console.log(`Resultado del diálogo: ${result}`);
//         if (result === 'refresh') {
//           this.refreshToken();
//         } else if (result === 'logout') {
//           this.logout();
//         }
//         // Reset la bandera para permitir futuras advertencias
//         this.warningShown = false;
//       });
//   }

//   private attemptAutoRefresh(): void {
//     if (!this.isLoggedIn()) {
//       console.log('No hay sesión válida para renovación automática');
//       return;
//     }

//     console.log('🔄 Intentando renovar token automáticamente...');
//     this.refreshToken().then(success => {
//       if (!success) {
//         console.log('Falló la renovación automática, mostrando diálogo de logout');
//         this.showForceLogoutDialog();
//       }
//     });
//   }

//   private handleTokenRefreshError(): void {
//     console.error('❌ No se pudo renovar el token. Cerrando sesión...');
//     this.showForceLogoutDialog();
//   }

//   private showForceLogoutDialog(): void {
//     const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
//       width: '400px',
//       disableClose: true,
//       data: {
//         minutesLeft: 0,
//         forceLogout: true
//       }
//     });

//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.logout();
//       });
//   }

//   public getTokenTimeRemaining(): number {
//     if (!this.isLoggedIn()) {
//       console.log('No hay sesión válida');
//       return 0;
//     }

//     if (this.TESTING_MODE) {
//       // Calcular tiempo simulado restante
//       if (!this.simulatedTokenStartTime) {
//         console.log('No hay tiempo de inicio simulado');
//         return 0;
//       }
      
//       const elapsed = Date.now() - this.simulatedTokenStartTime;
//       const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//       const remaining = totalDuration - elapsed;
//       const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
      
//       console.log('🧪 Tiempo simulado:', {
//         elapsed: Math.floor(elapsed / 1000) + 's',
//         totalDuration: this.SIMULATED_TOKEN_DURATION_MINUTES + 'min',
//         remaining: Math.floor(remaining / 1000) + 's',
//         minutesRemaining: minutesRemaining + 'min'
//       });
      
//       return minutesRemaining;
//     }

//     // Usar valores reales del sessionStorage
//     const storageTokenInfo = this.getTokenExpirationFromStorage();
    
//     if (storageTokenInfo) {
//       const now = Date.now();
//       const remaining = storageTokenInfo.expiresAt - now;
//       const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
      
//       console.log('📦 Tiempo desde sessionStorage:', {
//         expiresAt: new Date(storageTokenInfo.expiresAt).toLocaleTimeString(),
//         now: new Date(now).toLocaleTimeString(),
//         remaining: Math.floor(remaining / 1000) + 's',
//         minutesRemaining: minutesRemaining + 'min'
//       });
      
//       return minutesRemaining;
//     }

//     // Fallback al método tradicional
//     const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//     if (!tokenExpiresAt) {
//       console.log('No se pudo obtener fecha de expiración del token');
//       return 0;
//     }

//     const now = Date.now();
//     const remaining = tokenExpiresAt - now;
//     const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
    
//     console.log('📅 Tiempo desde OAuth Service:', {
//       expiresAt: new Date(tokenExpiresAt).toLocaleTimeString(),
//       now: new Date(now).toLocaleTimeString(),
//       remaining: Math.floor(remaining / 1000) + 's',
//       minutesRemaining: minutesRemaining + 'min'
//     });
    
//     return minutesRemaining;
//   }

//   public getTokenSecondsRemaining(): number {
//     if (!this.isLoggedIn()) {
//       return 0;
//     }

//     if (this.TESTING_MODE) {
//       if (!this.simulatedTokenStartTime) {
//         return 0;
//       }
      
//       const elapsed = Date.now() - this.simulatedTokenStartTime;
//       const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
//       const remaining = totalDuration - elapsed;
//       return Math.max(0, Math.floor(remaining / 1000));
//     }

//     // Usar valores reales del sessionStorage
//     const storageTokenInfo = this.getTokenExpirationFromStorage();
    
//     if (storageTokenInfo) {
//       const now = Date.now();
//       const remaining = storageTokenInfo.expiresAt - now;
//       return Math.max(0, Math.floor(remaining / 1000));
//     }

//     // Fallback al método tradicional
//     const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
//     if (!tokenExpiresAt) {
//       return 0;
//     }

//     const now = Date.now();
//     const remaining = tokenExpiresAt - now;
//     return Math.max(0, Math.floor(remaining / 1000));
//   }

//   public isTokenNearExpiration(): boolean {
//     const timeRemaining = this.getTokenTimeRemaining();
//     return timeRemaining <= this.WARNING_TIME_MINUTES && timeRemaining > 0;
//   }

//   // Método para debugging
//   public getTokenExpirationInfo(): any {
//     if (!this.isLoggedIn()) {
//       return { valid: false };
//     }
  
//     const minutesLeft = this.getTokenTimeRemaining();
//     const secondsLeft = this.getTokenSecondsRemaining();
//     const storageTokenInfo = this.getTokenExpirationFromStorage();
    
//     return {
//       valid: true,
//       testingMode: this.TESTING_MODE,
//       simulatedDuration: this.TESTING_MODE ? this.SIMULATED_TOKEN_DURATION_MINUTES : null,
//       simulatedStartTime: this.TESTING_MODE ? new Date(this.simulatedTokenStartTime) : null,
//       sessionStorageInfo: storageTokenInfo ? {
//         expiresAt: new Date(storageTokenInfo.expiresAt),
//         idTokenExpiresAt: new Date(storageTokenInfo.idTokenExpiresAt),
//         storedAt: new Date(storageTokenInfo.storedAt)
//       } : null,
//       oauthServiceExpiresAt: this.oAuthService.getAccessTokenExpiration() ? 
//         new Date(this.oAuthService.getAccessTokenExpiration()) : null,
//       minutesLeft: minutesLeft,
//       secondsLeft: secondsLeft,
//       warningShown: this.warningShown,
//       isRefreshing: this.isRefreshing,
//       currentTime: new Date(),
//       // Información adicional sobre la alarma
//       warningTimeMinutes: this.WARNING_TIME_MINUTES,
//       autoRefreshTimeMinutes: this.AUTO_REFRESH_TIME_MINUTES
//     };
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//     this.stopTokenExpirationMonitoring();
//   }
// }





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
  private readonly TESTING_MODE = false; // ⚠️ Cambiar a true para testing
  private readonly SIMULATED_TOKEN_DURATION_MINUTES = 2;
// Cambia estas constantes
private readonly WARNING_TIME_MINUTES = 50; // Primera alarma a 5 minutos
private readonly SECOND_WARNING_TIME_MINUTES = 49; // Segunda alarma a 3 minutos
private readonly FINAL_WARNING_TIME_MINUTES = 45; // Alarma final a 1 minuto
private readonly AUTO_REFRESH_TIME_MINUTES = 0.5; // 30 segundos antes para renovación automática
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
        console.log('Token recibido, configurando monitoreo');
        // Inicializar tiempo de simulación
        if (this.TESTING_MODE) {
          this.simulatedTokenStartTime = Date.now();
        }
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
        console.log('No se encontraron todos los valores de expiración en sessionStorage');
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
      console.log('Ya se está renovando el token, esperando...');
      return Promise.resolve(false);
    }

    this.isRefreshing = true;
    console.log('Iniciando renovación de token...');

    // En modo testing, simular renovación exitosa
    if (this.TESTING_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('🧪 Token renovado exitosamente (simulado)');
          this.isRefreshing = false;
          this.warningShown = false;
          this.simulatedTokenStartTime = Date.now(); // Reiniciar contador
          
          setTimeout(() => {
            this.startTokenExpirationMonitoring();
          }, 1000);
          
          resolve(true);
        }, 1000); // Simular delay de red
      });
    }

    return this.oAuthService.refreshToken()
      .then(() => {
        console.log('Token renovado exitosamente');
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
          console.log('Error CORS detectado - intentando renovación mediante redirect');
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
    console.log('Manejando error CORS - ofreciendo opciones al usuario');
    
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
    console.log('Renovando token mediante redirect...');
    // Guardar la URL actual para regresar después
    localStorage.setItem('preRefreshUrl', window.location.href);
    this.oAuthService.initImplicitFlow();
  }

  private openRefreshInNewTab(): void {
    console.log('Abriendo renovación en nueva pestaña...');
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
        console.log('Token renovado manualmente con éxito');
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
    console.log('⏱️ Iniciando monitoreo de expiración de token');
    
    // Detener monitoreo anterior
    this.stopTokenExpirationMonitoring();
    
    if (!this.isLoggedIn()) {
      console.log('🔴 No hay token válido, saltando monitoreo');
      return;
    }

    let expiresIn: number;
    
    if (this.TESTING_MODE) {
      if (!this.simulatedTokenStartTime) {
        this.simulatedTokenStartTime = Date.now();
      }
      expiresIn = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
      console.log(`🧪 MODO TESTING - Token simulado expira en: ${this.SIMULATED_TOKEN_DURATION_MINUTES} minutos`);
    } else {
      const storageTokenInfo = this.getTokenExpirationFromStorage();
      
      if (storageTokenInfo) {
        const now = Date.now();
        expiresIn = storageTokenInfo.expiresAt - now;
        
        console.log('📦 Usando valores del sessionStorage:', {
          expiresAt: new Date(storageTokenInfo.expiresAt).toLocaleString(),
          idTokenExpiresAt: new Date(storageTokenInfo.idTokenExpiresAt).toLocaleString(),
          storedAt: new Date(storageTokenInfo.storedAt).toLocaleString(),
          now: new Date(now).toLocaleString(),
          expiresInMinutes: Math.floor(expiresIn / 60000)
        });
      } else {
        const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
        if (!tokenExpiresAt) {
          console.log('❌ No se pudo obtener fecha de expiración del token');
          return;
        }
        const now = Date.now();
        expiresIn = tokenExpiresAt - now;
        console.log(`📅 Usando OAuth Service - Token expira en: ${Math.floor(expiresIn / 60000)} minutos`);
      }
    }
    
    if (expiresIn <= 0) {
      console.log('⏰ Token ya expirado');
      this.handleTokenRefreshError();
      return;
    }

    // Configurar timers para las 3 alarmas
    const warningTime1 = expiresIn - (this.WARNING_TIME_MINUTES * 60 * 1000);
    const warningTime2 = expiresIn - (this.SECOND_WARNING_TIME_MINUTES * 60 * 1000);
    const warningTime3 = expiresIn - (this.FINAL_WARNING_TIME_MINUTES * 60 * 1000);

    console.log('⏰ Configurando alarmas:', {
      primeraAlarma: `${this.WARNING_TIME_MINUTES} min (en ${Math.floor(warningTime1 / 60000)} min)`,
      segundaAlarma: `${this.SECOND_WARNING_TIME_MINUTES} min (en ${Math.floor(warningTime2 / 60000)} min)`,
      alarmaFinal: `${this.FINAL_WARNING_TIME_MINUTES} min (en ${Math.floor(warningTime3 / 60000)} min)`
    });

    // Primera alarma (5 minutos)
    if (warningTime1 > 0) {
      this.warningTimer = timer(warningTime1)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('🔔 Primera advertencia - 5 minutos restantes');
          this.showExpirationWarning(this.WARNING_TIME_MINUTES);
        });
    } else {
      console.log('⏩ Primera alarma (5 min) ya debería haberse mostrado');
    }

    // Segunda alarma (3 minutos)
    if (warningTime2 > 0) {
      this.secondWarningTimer = timer(warningTime2)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('🔔 Segunda advertencia - 3 minutos restantes');
          this.showExpirationWarning(this.SECOND_WARNING_TIME_MINUTES);
        });
    } else {
      console.log('⏩ Segunda alarma (3 min) ya debería haberse mostrado');
    }

    // Tercera alarma (1 minuto)
    if (warningTime3 > 0) {
      this.finalWarningTimer = timer(warningTime3)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('🔔 Advertencia final - 1 minuto restante');
          this.showExpirationWarning(this.FINAL_WARNING_TIME_MINUTES);
        });
    } else {
      console.log('⏩ Alarma final (1 min) ya debería haberse mostrado');
    }

    // Timer para renovación automática (30 segundos antes)
    const autoRefreshTime = expiresIn - (this.AUTO_REFRESH_TIME_MINUTES * 60 * 1000);
    if (autoRefreshTime > 0) {
      console.log(`🔄 Renovación automática programada en: ${Math.floor(autoRefreshTime / 60000)} minutos (${Math.floor(autoRefreshTime / 1000)} segundos)`);
      this.autoRefreshTimer = timer(autoRefreshTime)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('🔄 Ejecutando renovación automática');
          this.attemptAutoRefresh();
        });
    } else if (!this.warningShown) {
      console.log('⏩ Tiempo de renovación automática ya pasó, intentando inmediatamente');
      this.attemptAutoRefresh();
    }
  }
  private stopTokenExpirationMonitoring(): void {
    console.log('🛑 Deteniendo monitoreo de expiración');
    
    if (this.warningTimer) {
      console.log('🛑 Cancelando timer de primera alarma');
      this.warningTimer.unsubscribe();
      this.warningTimer = null;
    }
    
    if (this.secondWarningTimer) {
      console.log('🛑 Cancelando timer de segunda alarma');
      this.secondWarningTimer.unsubscribe();
      this.secondWarningTimer = null;
    }
    
    if (this.finalWarningTimer) {
      console.log('🛑 Cancelando timer de alarma final');
      this.finalWarningTimer.unsubscribe();
      this.finalWarningTimer = null;
    }
    
    if (this.autoRefreshTimer) {
      console.log('🛑 Cancelando timer de renovación automática');
      this.autoRefreshTimer.unsubscribe();
      this.autoRefreshTimer = null;
    }
  }
  private showExpirationWarning(minutesLeft: number): void {
    if (this.warningShown || !this.isLoggedIn()) {
      console.log('🚨 Advertencia ya mostrada o no hay sesión válida');
      return;
    }
  
    this.warningShown = true;
    console.log(`⚠️ Mostrando diálogo de expiración. Minutos restantes: ${minutesLeft}`);
    
    const adjustedMinutes = Math.max(1, minutesLeft);
    
    const dialogRef = this.dialog.open(TokenExpirationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        minutesLeft: adjustedMinutes
      }
    });
    
    console.log('🖥️ Diálogo de expiración mostrado');
    
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        console.log(`🔘 Resultado del diálogo: ${result}`);
        if (result === 'logout') {
          console.log('👋 Usuario eligió cerrar sesión');
          this.logout();
        } else {
          console.log('✅ Usuario aceptó el diálogo');
        }
        // Reset la bandera para permitir futuras advertencias
        this.warningShown = false;
      });
  }

  private attemptAutoRefresh(): void {
    if (!this.isLoggedIn()) {
      console.log('🔴 No hay sesión válida para renovación automática');
      return;
    }

    console.log('🔄 Intentando renovar token automáticamente...');
    this.refreshToken().then(success => {
      if (!success) {
        console.log('❌ Falló la renovación automática, mostrando diálogo de logout');
        this.showForceLogoutDialog();
      } else {
        console.log('🔄✅ Token renovado automáticamente con éxito');
      }
    });
  }

  private handleTokenRefreshError(): void {
    console.error('❌ No se pudo renovar el token. Cerrando sesión...');
    this.showForceLogoutDialog();
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
      console.log('No hay sesión válida');
      return 0;
    }

    if (this.TESTING_MODE) {
      // Calcular tiempo simulado restante
      if (!this.simulatedTokenStartTime) {
        console.log('No hay tiempo de inicio simulado');
        return 0;
      }
      
      const elapsed = Date.now() - this.simulatedTokenStartTime;
      const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
      const remaining = totalDuration - elapsed;
      const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
      
      console.log('🧪 Tiempo simulado:', {
        elapsed: Math.floor(elapsed / 1000) + 's',
        totalDuration: this.SIMULATED_TOKEN_DURATION_MINUTES + 'min',
        remaining: Math.floor(remaining / 1000) + 's',
        minutesRemaining: minutesRemaining + 'min'
      });
      
      return minutesRemaining;
    }

    // Usar valores reales del sessionStorage
    const storageTokenInfo = this.getTokenExpirationFromStorage();
    
    if (storageTokenInfo) {
      const now = Date.now();
      const remaining = storageTokenInfo.expiresAt - now;
      const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
      
      console.log('📦 Tiempo desde sessionStorage:', {
        expiresAt: new Date(storageTokenInfo.expiresAt).toLocaleTimeString(),
        now: new Date(now).toLocaleTimeString(),
        remaining: Math.floor(remaining / 1000) + 's',
        minutesRemaining: minutesRemaining + 'min'
      });
      
      return minutesRemaining;
    }

    // Fallback al método tradicional
    const tokenExpiresAt = this.oAuthService.getAccessTokenExpiration();
    if (!tokenExpiresAt) {
      console.log('No se pudo obtener fecha de expiración del token');
      return 0;
    }

    const now = Date.now();
    const remaining = tokenExpiresAt - now;
    const minutesRemaining = Math.max(0, Math.ceil(remaining / (60 * 1000)));
    
    console.log('📅 Tiempo desde OAuth Service:', {
      expiresAt: new Date(tokenExpiresAt).toLocaleTimeString(),
      now: new Date(now).toLocaleTimeString(),
      remaining: Math.floor(remaining / 1000) + 's',
      minutesRemaining: minutesRemaining + 'min'
    });
    
    return minutesRemaining;
  }

  public getTokenSecondsRemaining(): number {
    if (!this.isLoggedIn()) {
      return 0;
    }

    if (this.TESTING_MODE) {
      if (!this.simulatedTokenStartTime) {
        return 0;
      }
      
      const elapsed = Date.now() - this.simulatedTokenStartTime;
      const totalDuration = this.SIMULATED_TOKEN_DURATION_MINUTES * 60 * 1000;
      const remaining = totalDuration - elapsed;
      return Math.max(0, Math.floor(remaining / 1000));
    }

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
      testingMode: this.TESTING_MODE,
      simulatedDuration: this.TESTING_MODE ? this.SIMULATED_TOKEN_DURATION_MINUTES : null,
      simulatedStartTime: this.TESTING_MODE ? new Date(this.simulatedTokenStartTime) : null,
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