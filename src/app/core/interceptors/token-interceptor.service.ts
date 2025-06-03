 import {
   HttpEvent,// Clases relacionadas con las solicitudes y respuestas HTTP.
   HttpHandler,
   HttpInterceptor,//Interfaz de Angular para interceptar las solicitudes HTTP.
   HttpRequest,
 } from "@angular/common/http";
 import { Injectable } from "@angular/core";
 import { Observable } from "rxjs";
 import { OAuthService } from "angular-oauth2-oidc";
 // 
 @Injectable({
   providedIn: "root",
 })
 export class TokenInterceptorService implements HttpInterceptor {
   constructor(private authService: OAuthService) {}// Constructor que recibe una instancia de OAuthService a través de la inyección de dependencias.
   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Excluir endpoints de autenticación de la inyección de token
    if (req.url.includes('srvcas.espe.edu.ec/oauth2endpoints/token')) {
      return next.handle(req);
    }
  
    const token = this.authService.getAccessToken();
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
 }
/*Este interceptor se utiliza para agregar el token de acceso a las solicitudes HTTP salientes, lo que es común en escenarios de autenticación OAuth. La verificación del encabezado "skip" permite excluir ciertas solicitudes de este procesamiento.*/


// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
//   HttpErrorResponse
// } from "@angular/common/http";
// import { Injectable } from "@angular/core";
// import { Observable, throwError, BehaviorSubject, from } from "rxjs";
// import { OAuthService } from "angular-oauth2-oidc";
// import { catchError, switchMap, finalize, filter, take } from "rxjs/operators";
// import { AuthService } from "../auth/services/auth.service";

// @Injectable({
//   providedIn: "root",
// })
// export class TokenInterceptorService implements HttpInterceptor {
//   private isRefreshing = false;
//   private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

//   constructor(
//     private oAuthService: OAuthService,
//     private authService: AuthService
//   ) {}

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     // Skip si la request tiene el header "skip"
//     if (req.headers.get("skip")) {
//       return next.handle(req);
//     }

//     return next.handle(this.addTokenHeader(req)).pipe(
//       catchError((error: HttpErrorResponse) => {
//         // Si es error 401 (Unauthorized), intentar refresh del token
//         if (error.status === 401) {
//           return this.handle401Error(req, next);
//         }
//         return throwError(error);
//       })
//     );
//   }

//   private addTokenHeader(request: HttpRequest<any>): HttpRequest<any> {
//     const token = this.oAuthService.getAccessToken();
    
//     if (token) {
//       return request.clone({
//         headers: request.headers.set("Authorization", "Bearer " + token),
//       });
//     }
    
//     return request;
//   }

//   private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     if (!this.isRefreshing) {
//       this.isRefreshing = true;
//       this.refreshTokenSubject.next(null);

//       // Convertir la Promise a Observable usando 'from'
//       return from(this.authService.refreshToken()).pipe(
//         switchMap((success: boolean) => {
//           if (success) {
//             this.refreshTokenSubject.next(this.oAuthService.getAccessToken());
//             return next.handle(this.addTokenHeader(request));
//           } else {
//             // Si falla el refresh, hacer logout
//             this.authService.logout();
//             return throwError('Token refresh failed');
//           }
//         }),
//         catchError(error => {
//           this.authService.logout();
//           return throwError(error);
//         }),
//         finalize(() => {
//           this.isRefreshing = false;
//         })
//       );
//     }

//     // Si ya se está refreshing, esperar a que termine
//     return this.refreshTokenSubject.pipe(
//       filter(token => token !== null),
//       take(1),
//       switchMap(() => next.handle(this.addTokenHeader(request)))
//     );
//   }
// }


// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
//   HttpErrorResponse
// } from "@angular/common/http";
// import { Injectable } from "@angular/core";
// import { from, Observable, throwError } from "rxjs";
// import { catchError, switchMap } from "rxjs/operators";
// import { OAuthService } from "angular-oauth2-oidc";
// import { AuthService } from "../auth/services/auth.service";

// @Injectable({
//   providedIn: "root",
// })
// export class TokenInterceptorService implements HttpInterceptor {
//   private isRefreshing = false;

//   constructor(
//     private authService: OAuthService,
//     private customAuthService: AuthService
//   ) {}

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     if (req.headers.get("skip")) {
//       return next.handle(req);
//     }

//     let token = this.authService.getAccessToken();
    
//     if (token && this.customAuthService.isTokenNearExpiration()) {
//       console.log('Token próximo a expirar, intentando renovar...');
      
//       if (!this.isRefreshing) {
//         this.isRefreshing = true;
        
//         return from(this.customAuthService.refreshToken()).pipe(
//           switchMap(success => {
//             this.isRefreshing = false;
            
//             if (success) {
//               token = this.authService.getAccessToken();
//               const authReq = req.clone({
//                 headers: req.headers.set("Authorization", "Bearer " + token),
//               });
//               return next.handle(authReq);
//             } else {
//               const authReq = req.clone({
//                 headers: req.headers.set("Authorization", "Bearer " + token),
//               });
//               return next.handle(authReq);
//             }
//           }),
//           catchError(error => {
//             this.isRefreshing = false;
//             return throwError(error);
//           })
//         );
//       }
//     }

//     if (token && token !== "") {
//       const authReq = req.clone({
//         headers: req.headers.set("Authorization", "Bearer " + token),
//       });
      
//       return next.handle(authReq).pipe(
//         catchError((error: HttpErrorResponse) => {
//           // Si recibimos un 401, intentar renovar el token
//           if (error.status === 401 && !this.isRefreshing) {
//             return this.handle401Error(req, next);
//           }
          
//           return throwError(error);
//         })
//       );
//     }
    
//     return next.handle(req);
//   }

//   private handle401Error(
//     request: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     if (!this.isRefreshing) {
//       this.isRefreshing = true;

//       return from(this.customAuthService.refreshToken()).pipe(
//         switchMap(success => {
//           this.isRefreshing = false;
          
//           if (success) {
//             const token = this.authService.getAccessToken();
//             const authReq = request.clone({
//               headers: request.headers.set("Authorization", "Bearer " + token),
//             });
            
//             return next.handle(authReq);
//           } else {
//             this.customAuthService.logout();
//             return throwError(new HttpErrorResponse({
//               status: 401,
//               statusText: 'Token expired and refresh failed'
//             }));
//           }
//         }),
//         catchError(error => {
//           this.isRefreshing = false;
//           this.customAuthService.logout();
//           return throwError(error);
//         })
//       );
//     }

//     return next.handle(request);
//   }
// }