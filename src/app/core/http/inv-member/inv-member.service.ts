import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvMemberForm } from 'src/app/types/invMember.types';
import { Usuario } from 'src/app/types/usuario.types';

@Injectable({
  providedIn: 'root'
})
export class InvMemberService {

  private readonly URL = environment.appApiUrl + '/inv-members';

  constructor(private http: HttpClient) {}


  getAll(): Observable<InvMemberForm[]> {
    return this.http.get<InvMemberForm[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<InvMemberForm[]> {
    return this.http.get<InvMemberForm[]>(`${this.URL}/${id}`);
  }

  createInvMemberFormForm(formData: InvMemberForm): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  getByGroup(id:number):Observable<InvMemberForm[]> {
    return this.http.get<InvMemberForm[]>(`${this.URL}/group/${id}`);
  }
  //groupId/65
  getByUsername(username:string):Observable<InvMemberForm[]> {
    return this.http.get<InvMemberForm[]>(`${this.URL}/username/${username}`);
  }
  
  getAllByGroupId(id:number):Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.URL}/groupId/${id}`);
  }
  deleteUserGroup(idUser:number,idGroup:number): Observable<any> {
    return this.http.delete(`${this.URL}/${idUser}/group/${idGroup}`);

  }
  update(idUser:number,idGroup:number,formData:InvMemberForm):Observable<any>{
    return this.http.put(`${this.URL}/update/${idUser}/${idGroup}`,formData);
  }
}
