import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvGroupForm , InvGroupCompleteForm} from 'src/app/types/invGroup.types';

@Injectable({
  providedIn: 'root'
})
export class InvGroupService {

  private readonly URL = environment.appApiUrl + '/inv-group';

  constructor(private http: HttpClient) {}


  getAll(): Observable<InvGroupForm[]> {
    return this.http.get<InvGroupForm[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<InvGroupForm> {
    return this.http.get<InvGroupForm>(`${this.URL}/${id}`);
  }

  getByIdAll(id: number): Observable<InvGroupCompleteForm> {
    return this.http.get<InvGroupCompleteForm>(`${this.URL}/all/${id}`);
  }
  getByProcess(process: string): Observable<InvGroupCompleteForm[]> {
    return this.http.get<InvGroupCompleteForm[]>(`${this.URL}/process/${process}`);
  }
  getByProcessDepartment(process: string, department: string): Observable<InvGroupCompleteForm[]> {
    const encodedDepartment = encodeURIComponent(department);  // Codificar el parámetro `department`
    return this.http.get<InvGroupCompleteForm[]>(`${this.URL}/getprocessDepartment?process=${process}&department=${encodedDepartment}`);
  }
  createInvGroupForm(formData: InvGroupForm): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  
  getByUser(id:number):Observable<InvGroupForm> {
    return this.http.get<InvGroupForm>(`${this.URL}/user/${id}`);
  }
  update(id:number,formData: InvGroupForm): Observable<InvGroupForm> {
    return this.http.put<InvGroupForm>(`${this.URL}/update/${id}`, formData);
  }
}
