import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Link  as LinkForm} from 'src/app/types/link.types';;

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  private readonly URL = environment.appApiUrl + '/links';

  constructor(private http: HttpClient) {}


  getAll(): Observable<LinkForm[]> {
    return this.http.get<LinkForm[]>(`${this.URL + "/"}`);
  }

  getById(id: number): Observable<LinkForm> {
    return this.http.get<LinkForm>(`${this.URL}/${id}`);
  }

  createLinkForm(formData: LinkForm): Observable<any> {
    return this.http.post(`${this.URL}/create`, formData);
  }
  update(id:number,formData:LinkForm):Observable<LinkForm> {
    return this.http.put<LinkForm>(`${this.URL}/update/${id}`, formData);
  }

  getByState(estado: string): Observable<LinkForm[]>{
    return this.http.get<LinkForm[]>(`${this.URL}/state/${estado}`);

  }

}
