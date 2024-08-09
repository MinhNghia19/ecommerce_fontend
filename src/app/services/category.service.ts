import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category'
import { ApiResponse } from '../responses/api.responses';
@Injectable({
    providedIn: 'root'
  })
  export class CategoryService {
  

  
    constructor(private http: HttpClient) { }
    getCategories():Observable<ApiResponse> {
        const params = new HttpParams()
        
          return this.http.get<ApiResponse>(`${environment.apiBaseUrl}/categories`);           
      }
    // Các phương thức để giao tiếp với API
  }
  