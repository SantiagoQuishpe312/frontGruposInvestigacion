import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AssetesDetails } from 'src/app/types/assetesDetails.types';

@Injectable({
  providedIn: 'root'
})
export class AssetsDetailsService {
  private readonly URL = environment.appApiUrl + '/assetsDetails'
  
  constructor(private http: HttpClient) { }

  getAll(): Observable<AssetesDetails[]>{
    return this.http.get<AssetesDetails[]>(`${this.URL}/`)
  }

  getById(id: number):Observable<AssetesDetails>{
    return this.http.get<AssetesDetails>(`${this.URL}/${id}`)
  }

  createAssetesDetails(formData: AssetesDetails): Observable<any>{
    return this.http.post(`${this.URL}/create`, formData)
  }

  updateAssetsReport(id: number, formData:AssetesDetails): Observable<any>{
    return this.http.put(`${this.URL}/update/${id}`,formData)
  }

}
