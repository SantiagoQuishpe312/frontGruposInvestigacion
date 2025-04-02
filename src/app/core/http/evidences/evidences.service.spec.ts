import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Evidences } from 'src/app/types/evidences.types';

@Injectable({
  providedIn: 'root'
})
export class EvidencesService {

  private readonly URL = `${environment.appApiUrl}/evidences`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Evidences[]> {
    return this.http.get<Evidences[]>(`${this.URL}/`);
  }

  getById(id: number): Observable<Evidences> {
    return this.http.get<Evidences>(`${this.URL}/${id}`);
  }

  create(dtoEvidences: Evidences): Observable<number> {
    return this.http.post<number>(`${this.URL}/create`, dtoEvidences);
  }

  update(id: number, dtoEvidences: Evidences): Observable<void> {
    return this.http.put<void>(`${this.URL}/update/${id}`, dtoEvidences);
  }
}
