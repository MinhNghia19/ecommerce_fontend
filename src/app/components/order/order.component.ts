import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Product } from '../../models/product';
import { environment } from '../../../environments/environment';

import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { UserResponse } from '../../responses/user.response';
import { ApiResponsePro, Province, District, Ward } from '../../responses/apiprovinces.responses';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService,ToastNoAnimation } from 'ngx-toastr';
import { OrderDTO } from '../../dtos/order/order.dto';
import { CartItemDTO } from '../../dtos/order/cart.item.dto'; // Adjust the path as needed

import { ApiResponse } from '../../responses/api.responses';

import { OrderService } from '../../services/order.service';
import { inject } from '@angular/core';
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule,HeaderComponent,
    FormsModule, 
    ReactiveFormsModule,   ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  userResponse?: UserResponse | null;
  private orderService = inject(OrderService);

  cart: Map<string, { quantity: number; attributes: { [key: string]: string; } }> = new Map();
  cartItems: { product: Product; quantity: number; attributes: { [key: string]: string; } }[] = [];

  totalAmount: number = 0;
  discountedAmount: number = 0; // Tổng tiền sau khi áp dụng mã giảm giá
  selectedPaymentMethod: string = '';

  accountForm: FormGroup;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  selectedProvinceId: string | null = null;
  selectedDistrictId: string | null = null;

  isDiscountSectionVisible = false;
  isAddressPrepopulated = false; // Flag to prevent multiple calls

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private cartService: CartService,
    private productService: ProductService,
    private userService: UserService,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.accountForm = this.fb.group({
      province: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['',Validators.required],
      address: ['', Validators.required],
      discountCode: [''],
      acceptTerms: [false, Validators.requiredTrue] // Add this line
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit started');
    this.loadCartItems();
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    this.loadProvinces();
    console.log('ngOnInit ended');
    
  }
  

// LoadItem
  loadCartItems(): void {
    this.cart = this.cartService.getCart();
    const productIds = Array.from(this.cart.keys()).map(key => +key.split('-')[0]);

  // Kiểm tra nếu giỏ hàng trống và điều hướng về trang giỏ hàng
  if (productIds.length === 0) {
    this.router.navigate(['/cart']); // Điều hướng về trang giỏ hàng hoặc trang khác
    return;
  }

    this.productService.getProductsByIds(productIds).subscribe({
      next: (apiResponse) => {
        const products: Product[] = apiResponse.data;
        this.cartItems = Array.from(this.cart.entries()).map(([key, value]) => {
          const [productId, attributesString] = key.split('-');
          const attributes = JSON.parse(attributesString);
          const product = products.find(p => p.id === Number(productId));

          if (product && !product.thumbnail.startsWith(environment.apiBaseUrl)) {
            product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          }

          return {
            product: product!,
            quantity: value.quantity,
            attributes: attributes,
          };
        });
        this.calculateTotal();
      },
      error: (error) => {
        console.error(error?.error?.message ?? '');
      }
    });
  }
  getAttributeKeys(attributes: { [key: string]: string; }): string[] {
    return Object.keys(attributes);
  }




// thanh toan //
  calculateTotal(): void {
    // Tính tổng tiền tạm tính (trước khi áp dụng mã giảm giá)
    this.totalAmount = this.cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
  
    // Tính tổng tiền đã giảm (sẽ được cập nhật khi áp dụng mã giảm giá)
    this.discountedAmount = this.totalAmount;
  }
  
  applyDiscountCode(): void {
    const discountCode = this.accountForm.get('discountCode')?.value;
  
    // Định nghĩa các mã giảm giá và giá trị tương ứng
    const discountCodes: { [key: string]: number } = {
      DISCOUNT10: 10,
      DISCOUNT20: 20,
      FLAT50: 50
    };
  
    let discountAmount = 0;
  
    // Kiểm tra mã giảm giá có hợp lệ không
    if (discountCode in discountCodes) {
      const discountValue = discountCodes[discountCode];
      if (discountCode.startsWith('FLAT')) {
        // Nếu là giảm giá theo số tiền cụ thể
        discountAmount = discountValue;
      } else {
        // Nếu là giảm giá theo phần trăm
        discountAmount = (this.totalAmount * discountValue) / 100;
      }
  
      // Cập nhật tổng tiền sau khi áp dụng mã giảm giá
      this.discountedAmount = this.totalAmount - discountAmount;
    } else {
      console.log('Mã giảm giá không hợp lệ');
    }
  }  
  
  
  payWithVNPAY(): void {
    console.log('Redirecting to VNPay payment gateway');
  }
  onPaymentMethodChange(method: string): void {
    this.selectedPaymentMethod = method;
  }

  toggleDiscountSection() {
    this.isDiscountSectionVisible = !this.isDiscountSectionVisible;
  }


//Thong tin tai khoan
  prepopulateAddress(): void {
    console.log('prepopulateAddress started');
    const addressParts = this.userResponse?.address.split(', ') || [];
    const wardName = addressParts[0];
    const districtName = addressParts[1];
    const provinceName = addressParts[2];

    console.log('Ward:', wardName);
    console.log('District:', districtName);
    console.log('Province:', provinceName);

    // Find and set the province by name
    const province = this.provinces.find(p => p.full_name === provinceName);
    if (province) {
      this.selectedProvinceId = province.id;

      // Patch the form with province id, not name
      this.accountForm.patchValue({ province: province.id });

      // Load districts for the selected province
      this.loadDistricts(province.id).then(() => {
        const district = this.districts.find(d => d.full_name === districtName);
        if (district) {
          this.selectedDistrictId = district.id;

          // Patch the form with district id, not name
          this.accountForm.patchValue({ district: district.id });

          // Load wards for the selected district
          this.loadWards(district.id).then(() => {
            const ward = this.wards.find(w => w.full_name === wardName);
            if (ward) {
              // Patch the form with ward id
              this.accountForm.patchValue({ ward: ward.id });
            }
          });
        }
      });
    }
    console.log('prepopulateAddress ended');
  }
 
  
  
// Updated loadProvinces method
  loadProvinces(): void {
    this.apiService.getProvinces().subscribe({
      next: (response) => {
        this.provinces = response.data;
        this.prepopulateAddress();
      },
      error: (error) => {
        console.error('Failed to load provinces', error);
      }
    });
  }
  loadDistricts(provinceId: string): Promise<void> {
    console.log('Province ID passed to districts API:', provinceId); // Log the provinceId to ensure it's correct
    return new Promise((resolve, reject) => {
      this.apiService.getDistricts(provinceId).subscribe({
        next: (response) => {
          console.log('API response for districts:', response);
          this.districts = response.data; // Make sure to check the 'data' field
          resolve();
        },
        error: (error) => {
          console.error('Failed to load districts', error);
          reject(error);
        }
      });
    });
  }
  loadWards(districtId: string): Promise<void> {
    console.log('Province ID passed to wards API:', districtId); 
    return new Promise((resolve, reject) => {
      this.apiService.getWards(districtId).subscribe({
        next: (response) => {
          console.log('API response for wards:', response);
          this.wards = response.data;
          resolve();
        },
        error: (error) => {
          console.error('Failed to load wards', error);
          reject(error);
        }
      });
    });
  }
  onProvinceChange(event: Event): void {
    const provinceId = (event.target as HTMLSelectElement).value;
    this.selectedProvinceId = provinceId;
    this.accountForm.patchValue({ district: '', ward: '' }); // Clear district and ward selections
    this.districts = []; // Clear district list
    this.wards = []; // Clear ward list
  
    // Load districts for the selected province and handle it asynchronously
    this.loadDistricts(provinceId).then(() => {
      console.log('Districts loaded:', this.districts);
    }).catch(error => {
      console.error('Failed to load districts:', error);
    });
  }
  onDistrictChange(event: Event): void {
    const districtId = (event.target as HTMLSelectElement).value;
    this.selectedDistrictId = districtId;
    this.accountForm.patchValue({ ward: '' }); // Xóa xã
    this.wards = []; // Clear district list
    this.wards = []; // Xóa danh sách xã
  
    // Tải xã cho huyện đã chọn
    this.loadWards(districtId).then(() => {
      console.log('wards loaded:', this.wards);
    }).catch(error => {
      console.error('Failed to load wards:', error);
    });
  }

  // placeOrder(): void {
  //   // Check if the form is valid
  //   if (this.accountForm.invalid) {
  //     // Display validation errors
  //     this.toastr.error('Vui lòng chọn đầy đủ thông tin.', 'Lỗi', {
  //       timeOut: 3000,
  //       extendedTimeOut: 1000
  //     });
  //     return;
  //   }
  
  //   // Get selected province, district, and ward names
  //   const provinceName = this.provinces.find(p => p.id === this.selectedProvinceId)?.full_name || '';
  //   const districtName = this.districts.find(d => d.id === this.selectedDistrictId)?.full_name || '';
  //   const wardName = this.wards.find(w => w.id === this.accountForm.value.ward)?.full_name || '';
    
  //   // Prepare the address
  //   const fullAddress = `${this.accountForm.value.address}, ${wardName}, ${districtName}, ${provinceName}`;
  
  //   // Prepare the order data
  //   const orderData= {
  //     user_id: this.userResponse?.id || 0,
  //     fullname: this.userResponse?.fullname || '',
  //     phone_number: this.userResponse?.phone_number || '',
  //     address: fullAddress,
  //     status: 'pending',
  //     total_money: this.discountedAmount || 0, // Use discountedAmount for final total
  //     payment_method: this.selectedPaymentMethod || 'cod',
  //     coupon_code: this.accountForm.value.discountCode || '',
  //     items: this.cartItems
  //   };
  
  //   // Log order data for debugging
  //   console.log('Order data:', orderData);
  // }
  placeOrder(): void {
    // Check if the form is valid
    if (this.accountForm.invalid) {
      // Display validation errors
      this.toastr.error('Vui lòng chọn đầy đủ thông tin.', 'Lỗi', {
        timeOut: 3000,
        extendedTimeOut: 1000
      });
      return;
    }
  
    // Get selected province, district, and ward names
    const provinceName = this.provinces.find(p => p.id === this.selectedProvinceId)?.full_name || '';
    const districtName = this.districts.find(d => d.id === this.selectedDistrictId)?.full_name || '';
    const wardName = this.wards.find(w => w.id === this.accountForm.value.ward)?.full_name || '';
  
    // Prepare the full address
    const fullAddress = `${this.accountForm.value.address}, ${wardName}, ${districtName}, ${provinceName}`;
  
    // Prepare the order data
    const orderData = new OrderDTO({
      user_id: this.userResponse?.id || 0,
      fullname: this.userResponse?.fullname || '',
      phone_number: this.userResponse?.phone_number || '',
      address: fullAddress,
      // status: 'pending',
      note: this.accountForm.value.note || '',
      total_money: this.discountedAmount || 0, // Use discountedAmount for final total
      shipping_method: this.accountForm.value.shippingMethod || '', // Add if needed 
      payment_method: this.selectedPaymentMethod || 'cod',
      coupon_code: this.accountForm.value.discountCode || '',
      cart_items: this.cartItems.map(item => new CartItemDTO({
        product: item.product, // Ensure you provide a `Product` object
        quantity: item.quantity,
        attributes: item.attributes
      }))
    });
  
    // Log order data for debugging
    console.log('Order data:', orderData);
  
    this.orderService.placeOrder(orderData).subscribe({
      next: (response: ApiResponse) => {
        console.log('Đặt hàng thành công ',response);
        this.cartService.clearCart();
        this.router.navigate(['/orders-detail']);
      },
      complete: () => {
        this.calculateTotal();
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Lỗi khi đặt hàng: ${error?.error?.message ?? ''}`);
      },
    });
    // Handle the order submission (e.g., send to backend)
    // this.orderService.submitOrder(orderData).subscribe(response => {
    //   // Handle success or error
    // });
  
    // Optionally redirect or show a confirmation message
    // this.router.navigate(['/order-confirmation']); // Replace with your actual route
  }
  
}
