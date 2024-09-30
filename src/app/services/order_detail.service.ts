import { ProductService } from './product.service';
import { Injectable } from '@angular/core';
import { 
  HttpClient, 
  HttpParams, 
  HttpHeaders 
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderDTO } from '../dtos/order/order.dto';
import { OrderResponse } from '../responses/order/order.response';
import { ApiResponse } from '../responses/api.responses';

@Injectable({
  providedIn: 'root',
})
export class OrderDetailService {
  constructor(private http: HttpClient) {}

  getOrdersDetail(order_id : number) : Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.apiBaseUrl}/order_details/order/${order_id }`);           
  }
}
