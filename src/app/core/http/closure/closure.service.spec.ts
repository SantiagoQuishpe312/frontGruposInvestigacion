import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Closure } from 'src/app/types/closure.types';

@Injectable({
  providedIn: 'root'
})
export class ClosureService {

  private readonly URL = `${environment.appApiUrl}/closure`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Closure[]> {
    return this.http.get<Closure[]>(`${this.URL}/`);
  }

  getById(id: number): Observable<Closure> {
    return this.http.get<Closure>(`${this.URL}/${id}`);
  }

  createClosure(dtoClosure: Closure): Observable<number> {
    return this.http.post<number>(`${this.URL}/create`, dtoClosure);
  }

  update(id: number, dtoClosure: Closure): Observable<void> {
    return this.http.put<void>(`${this.URL}/update/${id}`, dtoClosure);
  }
}
