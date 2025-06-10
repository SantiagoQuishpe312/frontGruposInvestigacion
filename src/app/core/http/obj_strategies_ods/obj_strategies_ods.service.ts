import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ObjectiveCompleteOds, Objectives_Strategies_Ods } from 'src/app/types/obj_strategies_ods.types';
@Injectable({
  providedIn: 'root'
})
export class ObjStrategiesODSService {

  private readonly URL = environment.appApiUrl + '/obj_strategies_ods';

  constructor(private http: HttpClient) {}


  getAll(): Observable<Objectives_Strategies_Ods[]> {
    return this.http.get<Objectives_Strategies_Ods[]>(`${this.URL + "/"}`);
  }

  getCompleteByObj(id:number): Observable<ObjectiveCompleteOds>{
    return this.http.get<ObjectiveCompleteOds>(`${this.URL}/all-by-obj/${id}`);
  }

  getById(id: number): Observable<Objectives_Strategies_Ods[]> {
    return this.http.get<Objectives_Strategies_Ods[]>(`${this.URL}/objective/${id}`);
  }
  getByPlan(id:number): Observable<ObjectiveCompleteOds[]>{
    return this.http.get<ObjectiveCompleteOds[]>(`${this.URL}/developmentPlan/${id}`);
  }

  getByPlanRelacion(id:number): Observable<Objectives_Strategies_Ods[]>{
    return this.http.get<Objectives_Strategies_Ods[]>(`${this.URL}/plan_relations/${id}`);
  }
  create(formData: Objectives_Strategies_Ods): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  delete(idObj:number,idStrategy:number,idOds:number){
    return this.http.delete(`${this.URL}/${idObj}/strategy/${idStrategy}/ods/${idOds}`);
  }

}
