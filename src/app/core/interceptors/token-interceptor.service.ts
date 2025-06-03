import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, from, throwError } from "rxjs";
import { OAuthService } from "angular-oauth2-oidc";
import { catchError, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private authService: OAuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Si la solicitud tiene encabezado "skip" no agregamos token ni refrescamos
    if (req.headers.get("skip")) return next.handle(req);

    // Verificamos si el token es válido (no expirado)
    if (this.authService.hasValidAccessToken()) {
      // Token válido, agregarlo a la solicitud
      const token = this.authService.getAccessToken();
      const authReq = req.clone({
        headers: req.headers.set("Authorization", "Bearer " + token),
      });
      // Manejamos la solicitud con el token y capturamos errores
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Si recibimos 401 (token expirado o inválido), intentamos refrescar token
            return this.handleRefreshToken(req, next);
          }
          return throwError(() => error);
        })
      );
    } else {
      // Token expirado o no válido, intentamos refrescar antes de hacer la solicitud
      return this.handleRefreshToken(req, next);
    }
  }

  private handleRefreshToken(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Refrescamos el token (devuelve Promise), convertimos a Observable con from()
    return from(this.authService.refreshToken()).pipe(
      switchMap(() => {
        // Después de refrescar, obtenemos el nuevo token y reintentamos la solicitud original
        const token = this.authService.getAccessToken();
        const authReq = req.clone({
          headers: req.headers.set("Authorization", "Bearer " + token),
        });
        return next.handle(authReq);
      }),
      catchError((err) => {
        // Si refrescar token falla, cerramos sesión (o redirigir a login)
        this.authService.logOut();
        return throwError(() => err);
      })
    );
  }
}
