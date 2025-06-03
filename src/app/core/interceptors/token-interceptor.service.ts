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
      return next.handle(authReq);// Continúa con la solicitud modificada.
    }
    return next.handle(req);//Si no hay token de acceso, continúa con la solicitud original.
  }
}
/*Este interceptor se utiliza para agregar el token de acceso a las solicitudes HTTP salientes, lo que es común en escenarios de autenticación OAuth. La verificación del encabezado "skip" permite excluir ciertas solicitudes de este procesamiento.*/