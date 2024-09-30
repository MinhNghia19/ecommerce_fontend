import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { OrderDetailService } from '../../services/order_detail.service';
import { inject } from '@angular/core';
import { UserResponse } from '../../responses/user.response';
import { ApiResponse } from '../../responses/api.responses';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { OrderDetail} from '../../models/order.detail';
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [HeaderComponent,CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  selectedStatus: string = 'all';
  private orderService = inject(OrderService);
  private orderDetailService = inject(OrderDetailService);
  userResponse?: UserResponse | null;
  // orders = [
  //   {
  //     id: 1,
  //     status: 'completed',
  //     orderDate: '10:23 Thứ Ba, 20/02/2024',
  //     recipient: {
  //       name: 'Anh Nông Minh Nghĩa',
  //       phone: '0375560802',
  //       address: 'Siêu thị 1082 Phú Riềng Đỏ, P.Tân Thiện, Thị xã Đồng Xoài, Bình Phước',
  //       deliveryTime: 'Trước 10:30 - Thứ Ba (20/02)',
  //     },
  //     paymentMethod: 'Thanh toán khi nhận hàng',
  //     products: [
  //       {
  //         name: 'Điện thoại iPhone 15 Pro Max 256GB',
  //         warranty: 'Còn BH đến 19/02/2025',
  //         quantity: 1,
  //         price: 29490000,
  //         thumbnailUrl: '../../../assets/images/smartphone.jpg'
  //       },
  //       {
  //         name: 'Tai nghe Sony WH-1000XM4',
  //         warranty: 'Còn BH đến 15/03/2025',
  //         quantity: 2,
  //         price: 8900000,
  //         thumbnailUrl: '../../../assets/images/headphone.jpg'
  //       }
  //     ],
  //     totalAmount: 47290000,
  //     amountPaid: 47290000,
  //   },
  //   {
  //     id: 1,
  //     status: 'pending',
  //     orderDate: '10:23 Thứ Ba, 20/02/2024',
  //     recipient: {
  //       name: 'Anh Nông Minh Nghĩa',
  //       phone: '0375560802',
  //       address: 'Siêu thị 1082 Phú Riềng Đỏ, P.Tân Thiện, Thị xã Đồng Xoài, Bình Phước',
  //       deliveryTime: 'Trước 10:30 - Thứ Ba (20/02)',
  //     },
  //     paymentMethod: 'Thanh toán khi nhận hàng',
  //     products: [
  //       {
  //         name: 'Tai nghe Sony WH-1000XM4',
  //         warranty: 'Còn BH đến 15/03/2025',
  //         quantity: 2,
  //         price: 8900000,
  //         thumbnailUrl: '../../../assets/images/headphone.jpg'
  //       }
  //     ],
  //     totalAmount: 47290000,
  //     amountPaid: 47290000,
  //   },
  //   // Thêm nhiều đơn hàng khác nếu cần
  // ];

  orders: any[] = [];  
  filteredOrders: any[] = [];



  selectedOrderId: number | null = null;

  userId?: number | null;

  // ngOnInit(): void {
  
  //   this.setStatus('pending');  

  //   if (this.userResponse) {
  //     this.userId = this.userResponse.id;
  //   }
  //   this.orderService.getOrders(this.userId!).subscribe({
  //     next: (response: ApiResponse) => {
  
  //     },
  //     complete: () => {

  //     },
  //     error: (error: HttpErrorResponse) => {
  //       console.error(`Lỗi khi đặt hàng: ${error?.error?.message ?? ''}`);
  //     },
  //   });
  // }

  constructor(
    private userService: UserService,
    private router: Router,

  ) {

  }


  ngOnInit(): void {
    // Set initial order status to 'pending'
    this.setStatus('pending');  
    this.userResponse = this.userService.getUserResponseFromLocalStorage();

    // Fetch the userId safely after userResponse is available
    if (this.userResponse) {
      this.userId = this.userResponse.id;
    }
   
    
  
    // Fetch orders based on the userId
    if (this.userId) {
      this.orderService.getOrders(this.userId).subscribe({
        next: (response: ApiResponse) => {
          // Assuming response.data.orders is the list of orders
          this.orders = response.data.orders;
          console.log('hehie')
          console.log(this.orders)
          // Optionally filter pending orders if needed
          this.filterOrders();
          
          // After fetching orders, fetch order details for each order
          this.orders.forEach(order => {
            this.fetchOrderDetails(order.id);
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error(`Error fetching orders: ${error?.error?.message ?? ''}`);
        }
      });
    }
  }
  
  fetchOrderDetails(orderId: number): void {
    this.orderDetailService.getOrdersDetail(orderId).subscribe({
      next: (response: ApiResponse) => {
        const orderDetails: OrderDetail[] = response.data;
  
        // Iterate over each detail in the order
        orderDetails.forEach((detail: OrderDetail) => {
          // Parse attributes JSON string to object if needed
          if (typeof detail.attributes === 'string') {
            detail.attributes = JSON.parse(detail.attributes);
          }
  
          // Update product thumbnail URL if necessary
          if (detail.product_thumbnail && !detail.product_thumbnail.startsWith(environment.apiBaseUrl)) {
            detail.product_thumbnail = `${environment.apiBaseUrl}/products/images/${detail.product_thumbnail}`;

            console.log(detail.product_thumbnail )
          }
        });
  
        // Find the order and attach details to it
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.details = orderDetails;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Error fetching order details: ${error?.error?.message ?? ''}`);
      }
    });
  }
  getAttributeEntries(attributes: any): { key: string, value: any }[] {
    if (!attributes) return [];
    return Object.entries(attributes).map(([key, value]) => ({ key, value }));
  }
  
  

  setStatus(status: string): void {
    this.selectedStatus = status;
    // Logic để lọc đơn hàng theo trạng thái có thể được thêm vào đây
    this.filterOrders();
  }
  filterOrders(): void {
    if (this.selectedStatus === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.selectedStatus);
    }
  }
  toggleOrderDetails(orderId: number): void {
    this.selectedOrderId = this.selectedOrderId === orderId ? null : orderId;
  }
  
  
}

