import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ControlPanelForm } from 'src/app/types/controlPanel.types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControlPanelService {

  private readonly URL = environment.appApiUrl + '/control-panel';

  constructor(private http: HttpClient) {}


  getAll(): Observable<ControlPanelForm[]> {
    return this.http.get<ControlPanelForm[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<ControlPanelForm> {
    return this.http.get<ControlPanelForm>(`${this.URL}/${id}`);
  }
  getByPlan(id: number): Observable<ControlPanelForm[]> {
    return this.http.get<ControlPanelForm[]>(`${this.URL}/bydev/${id}`);
  }

  createControlPanelForm(formData: ControlPanelForm): Observable<number> {
    return this.http.post<number>(`${this.URL}/create`, formData);
  }

  update(id: number, formData: ControlPanelForm): Observable<ControlPanelForm> {
    return this.http.put<ControlPanelForm>(`${this.URL}/update/${id}`, formData);
  }}

