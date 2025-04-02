import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EvaluationsReport } from 'src/app/types/evaluationReports.types';

@Injectable({
  providedIn: 'root'
})
export class EvaluationsReportService {

  private readonly URL = `${environment.appApiUrl}/evaluationsreport`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EvaluationsReport[]> {
    return this.http.get<EvaluationsReport[]>(`${this.URL}/`);
  }

  getById(id: number): Observable<EvaluationsReport> {
    return this.http.get<EvaluationsReport>(`${this.URL}/${id}`);
  }

  create(dtoEvaluationsReport: EvaluationsReport): Observable<number> {
    return this.http.post<number>(`${this.URL}/create`, dtoEvaluationsReport);
  }

  update(id: number, dtoEvaluationsReport: EvaluationsReport): Observable<void> {
    return this.http.put<void>(`${this.URL}/update/${id}`, dtoEvaluationsReport);
  }
}
