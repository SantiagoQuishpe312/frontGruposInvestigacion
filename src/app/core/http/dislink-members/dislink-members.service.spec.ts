import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DislinkMembers } from 'src/app/types/dislinkMembers.types';
import { Usuario } from 'src/app/types/usuario.types';

@Injectable({
  providedIn: 'root'
})
export class DislinkMembersService {

  private readonly URL = environment.appApiUrl + '/dislinks-members';

  constructor(private http: HttpClient) {}


  getAll(): Observable<DislinkMembers[]> {
    return this.http.get<DislinkMembers[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<DislinkMembers[]> {
    return this.http.get<DislinkMembers[]>(`${this.URL}/${id}`);
  }

  createDislinkMember(formData: DislinkMembers): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  getByGroup(id:number):Observable<DislinkMembers[]> {
    return this.http.get<DislinkMembers[]>(`${this.URL}/group/${id}`);
  }
  //groupId/65
  getByUsername(username:string):Observable<DislinkMembers[]> {
    return this.http.get<DislinkMembers[]>(`${this.URL}/username/${username}`);
  }
  
  getAllByGroupId(id:number):Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.URL}/groupId/${id}`);
  }
  deleteUserGroup(idUser:number,idGroup:number): Observable<any> {
    return this.http.delete(`${this.URL}/${idUser}/group/${idGroup}`);

  }
}
