import { ObserversModule } from '@angular/cdk/observers';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnnualOperativePlan, DocAnnualOperativePlan } from 'src/app/types/annualOperativePlan.types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnualOperativePlanService {
  private readonly URL = environment.appApiUrl + '/annualOperativePlan';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AnnualOperativePlan[]>{
    return this.http.get<AnnualOperativePlan[]>(`${this.URL + "/"}`);
  }

  getById(id:number): Observable<AnnualOperativePlan> {
    return this.http.get<AnnualOperativePlan>(`${this.URL}/${id}`);
  }
  getAllById(id:number):Observable<DocAnnualOperativePlan>{
    return this.http.get<DocAnnualOperativePlan>(`${this.URL}/allReport/${id}`);
  } 

  getAllByIdGroup(id:number):Observable<DocAnnualOperativePlan>{
    return this.http.get<DocAnnualOperativePlan>(`${this.URL}/allReportByGroup/${id}`);
  }
  createForm(formData: AnnualOperativePlan):Observable<any>{
    return this.http.post(`${this.URL}/created`, formData);
  }

  update(id:number, formData: AnnualOperativePlan): Observable<AnnualOperativePlan>{
    return this.http.put<AnnualOperativePlan>(`${this.URL}/update/${id}`, formData);

  }
}