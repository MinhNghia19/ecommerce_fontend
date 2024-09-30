// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponsePro, Province, District, Ward } from '../responses/apiprovinces.responses';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://esgoo.net/api-tinhthanh';

  constructor(private http: HttpClient) { }

  // Method to get provinces
  getProvinces(): Observable<ApiResponsePro<Province>> {
    return this.http.get<ApiResponsePro<Province>>(`${this.baseUrl}/1/0.htm`);
  }

  // Method to get districts by province ID
  getDistricts(provinceId: string): Observable<ApiResponsePro<District>> {
    return this.http.get<ApiResponsePro<District>>(`${this.baseUrl}/2/${provinceId}.htm`);
  }

  // Method to get wards by district ID
  getWards(districtId: string): Observable<ApiResponsePro<Ward>> {
    return this.http.get<ApiResponsePro<Ward>>(`${this.baseUrl}/3/${districtId}.htm`);
  }
}
