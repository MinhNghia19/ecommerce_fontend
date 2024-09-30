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
export class OrderService {
  private apiUrl = `${environment.apiBaseUrl}/orders`;
  private apiGetAllOrders = `${environment.apiBaseUrl}/orders/get-orders-by-keyword`;

  constructor(private http: HttpClient) {}

  placeOrder(orderData: OrderDTO): Observable<ApiResponse> {    
    // Gửi yêu cầu đặt hàng
    return this.http.post<ApiResponse>(this.apiUrl, orderData);
  }

  getOrders(user_id : number) : Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.apiBaseUrl}/orders/user/${user_id}`);           
  }
}
