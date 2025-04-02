import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClosureRequest } from 'src/app/types/closureRequest.types';

@Injectable({
  providedIn: 'root'
})
export class ClosureRequestService {

  private readonly URL = `${environment.appApiUrl}/closureRequest`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClosureRequest[]> {
    return this.http.get<ClosureRequest[]>(`${this.URL}/`);
  }

  getById(id: number): Observable<ClosureRequest> {
    return this.http.get<ClosureRequest>(`${this.URL}/${id}`);
  }

  create(dtoClosureRequest: ClosureRequest): Observable<number> {
    return this.http.post<number>(`${this.URL}/create`, dtoClosureRequest);
  }

  update(id: number, dtoClosureRequest: ClosureRequest): Observable<void> {
    return this.http.put<void>(`${this.URL}/update/${id}`, dtoClosureRequest);
  }
}
