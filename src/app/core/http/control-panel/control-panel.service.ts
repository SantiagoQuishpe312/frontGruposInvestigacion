import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ControlPanelComplete, ControlPanelForm } from 'src/app/types/controlPanel.types';
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
  getCompleteByPlan(id: number): Observable<ControlPanelComplete[]> {
    return this.http.get<ControlPanelComplete[]>(`${this.URL}/bycontrl/${id}`);
  }
  getBySpecificObjetive(id: number): Observable<ControlPanelForm[]> {
    return this.http.get<ControlPanelForm[]>(`${this.URL}/bySpecificObj/${id}`);
  }

  createControlPanelForm(formData: ControlPanelForm): Observable<number> {
    return this.http.post<number>(`${this.URL}/create`, formData);
  }

  update(id: number, formData: ControlPanelForm): Observable<ControlPanelForm> {
    return this.http.put<ControlPanelForm>(`${this.URL}/update/${id}`, formData);
  }
delete(id:number){
  return this.http.delete(`${this.URL}/delete/${id}`);}
}

