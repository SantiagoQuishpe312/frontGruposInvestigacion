import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/types/usuario.types';
import { UserApp } from 'src/app/types/userApp.types';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly URL = environment.appApiUrl + '/user';
  private readonly appUser = environment.appUsers;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Usuario[]> {
    console.log("Obteniendo todos los usuarios...");

    return this.http.get<Usuario[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.URL}/${id}`);
  }

  getByUserName(userName: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.URL}/userName/${userName}`);
  }

  getUserApp(userName: string, token: string): Observable<UserApp> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = {
      headers: headers
    };

    return this.http.get<UserApp>(`${this.appUser}${userName}`, options);
  }
  createUser(formData: Usuario): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  update(id: number, formData: Usuario): Observable<any> {
    return this.http.put(`${this.URL}/update/${id}`, formData);
  }
}
