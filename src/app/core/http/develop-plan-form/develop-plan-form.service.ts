import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { DevelopmentPlanComplete, DevelopmentPlanForms } from 'src/app/types/developPlanForm';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DevelopmentPlanService {

  private readonly URL = environment.appApiUrl + '/development-plan';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DevelopmentPlanForms[]> {
    return this.http.get<DevelopmentPlanForms[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<DevelopmentPlanForms> {
    return this.http.get<DevelopmentPlanForms>(`${this.URL}/${id}`);
  }
  getByIdGroupC(id: number): Observable<DevelopmentPlanForms[]> {
    return this.http.get<DevelopmentPlanForms[]>(`${this.URL}/groupC/${id}`);
  }
  getByIdGroupAndType(id: number,type:string): Observable<DevelopmentPlanForms> {
    return this.http.get<DevelopmentPlanForms>(`${this.URL}/group/${id}/Type/${type}`);
  }

  getAllByIdGroupStateType(id: number,type:string,state:string): Observable<DevelopmentPlanComplete> {
    return this.http.get<DevelopmentPlanComplete>(`${this.URL}/completePlan/group/${id}/type/${type}/state/${state}`);
  }
  create(formData: DevelopmentPlanForms): Observable<any> {
    return this.http.post<any>(`${this.URL}/create`, formData);
  }

  update(id: number, formData: DevelopmentPlanForms): Observable<DevelopmentPlanForms>{
    return this.http.put<DevelopmentPlanForms>(`${this.URL}/update/${id}`, formData);
  }
}




