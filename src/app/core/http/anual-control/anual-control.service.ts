import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AnualControl } from 'src/app/types/anualControl.types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnualControlService {
      private readonly URL = environment.appApiUrl + '/annualControl';
    
    constructor(private http: HttpClient) { }

    getAllByPlanAnual(idPlanAnual: number): Observable<AnualControl[]> {
        return this.http.get<AnualControl[]>(`${this.URL}/anual-control/getAllByPlanAnual/${idPlanAnual}`);
    }

    getByIdPlan(id: number): Observable<AnualControl[]> {
        return this.http.get<AnualControl[]>(`${this.URL}/AnnualPlan/${id}`);
    }
    getByIdPanel(id: number): Observable<AnualControl[]> {
        return this.http.get<AnualControl[]>(`${this.URL}/ControlPanel/${id}`);
    }
    getSpecificByIds(idPlan: number, idPanel: number): Observable<AnualControl> {
        return this.http.get<AnualControl>(`${this.URL}/ap/${idPlan}/pc/${idPanel}`);
    }


    create(anualControl: AnualControl): Observable<AnualControl> {
        return this.http.post<AnualControl>(`${this.URL}/create`, anualControl);
    }

    update(anualControl: AnualControl): Observable<AnualControl> {
        return this.http.put<AnualControl>(`${environment.appApiUrl}/anual-control/update/${anualControl.idPlanAnual}`, anualControl);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${environment.appApiUrl}/anual-control/delete/${id}`);
    }
}