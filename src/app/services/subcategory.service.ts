import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category'
import { Subcategory } from '../models/subcategory'
import { ApiResponse } from '../responses/api.responses';
@Injectable({
    providedIn: 'root'
  })
  export class SubcategoryService {
  

  
    constructor(private http: HttpClient) { }
    getSubcategories(category_id: number):Observable<ApiResponse> {
        const params = new HttpParams()

          return this.http.get<ApiResponse>(`${environment.apiBaseUrl}/subcategories/category/${category_id}`);           
      }
    // Các phương thức để giao tiếp với API
  }
  