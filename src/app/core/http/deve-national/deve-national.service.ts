import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeveNati,NationalPlanFilter } from 'src/app/types/deveNati.types';
import { NationalPlan } from 'src/app/types/nationalPlan.types';

@Injectable({
  providedIn: 'root'
})
export class DeveNationalService {

  private readonly URL = environment.appApiUrl + '/deve-natis';

  constructor(private http: HttpClient) {}


  getAll(): Observable<DeveNati[]> {
    return this.http.get<DeveNati[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<DeveNati> {
    return this.http.get<DeveNati>(`${this.URL}/${id}`);
  }

  createDevelopNatiForm(formData: DeveNati): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  getByDev(id:number):Observable<NationalPlan[]>{
    return this.http.get<NationalPlan[]>(`${this.URL}/bydev/${id}`);
  }
  delete(id:number,idDev:number):Observable<any>{
    return this.http.delete(`${this.URL}/${id}/dev/${idDev}`);
  }
}
