import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Unsatisfactory } from 'src/app/types/unsatisfactory.types';

@Injectable({
  providedIn: 'root'
})
export class UnsatisfactoryService {

  private readonly URL = `${environment.appApiUrl}/unsatisfactory`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Unsatisfactory[]> {
    return this.http.get<Unsatisfactory[]>(`${this.URL}/`);
  }

  getById(id: number): Observable<Unsatisfactory> {
    return this.http.get<Unsatisfactory>(`${this.URL}/${id}`);
  }

  create(dtoUnsatisfactory: Unsatisfactory): Observable<number> {
    return this.http.post<number>(`${this.URL}/create`, dtoUnsatisfactory);
  }

  update(id: number, dtoUnsatisfactory: Unsatisfactory): Observable<void> {
    return this.http.put<void>(`${this.URL}/update/${id}`, dtoUnsatisfactory);
  }
}
