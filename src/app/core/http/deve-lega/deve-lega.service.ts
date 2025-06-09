import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeveLegaForm,LegalFrameworkFilter } from 'src/app/types/deveLega.types';
import { LegalFramework } from 'src/app/types/legalFramework.types';

@Injectable({
  providedIn: 'root'
})
export class DeveLegaService {

  private readonly URL = environment.appApiUrl + '/deve-legas';

  constructor(private http: HttpClient) {}


  getAll(): Observable<DeveLegaForm[]> {
    return this.http.get<[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<DeveLegaForm> {
    return this.http.get<DeveLegaForm>(`${this.URL}/${id}`);
  }

  createDeveLegaForm(formData: DeveLegaForm): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  getByDev(id:number):Observable<LegalFramework[]>{
    return this.http.get<LegalFramework[]>(`${this.URL}/bydev/${id}`);
  }
  delete(id:number,idDev:number):Observable<any>{
    return this.http.delete(`${this.URL}/${id}/dev/${idDev}`);
  }
}
