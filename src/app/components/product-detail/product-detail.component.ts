import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ProductImage } from '../../models/product.image';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../responses/api.responses';

import { ToastrService,ToastNoAnimation } from 'ngx-toastr';
import { CartService } from '../../services/cart.service'
import { UserService } from '../../services/user.service'
import {UserResponse} from '../../responses/user.response'

import { FormsModule } from '@angular/forms'; // Nhập khẩu FormsModule

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [ CommonModule,FormsModule,   FooterComponent,
    HeaderComponent,],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  productId: number = 0;

  userResponse?:UserResponse | null;
  currentImageIndex: number = 0;
  quantity: number = 1;
  isPressedAddToCart:boolean = false;
  formattedPrice: string = '';

  attributeEntries: Array<{ key: string, values: string[] }> = []; // Mảng các đối tượng khóa-giá trị

  selectedAttributes: { [key: string]: string } = {}; // Lưu giá trị được chọn cho mỗi thuộc tính

    constructor(
    private productService: ProductService,

      private activatedRoute: ActivatedRoute,
      private router: Router,
      private toastr: ToastrService,
      private userService: UserService,

      private cartservice: CartService

    ) {
      
    }
    ngOnInit() {
      const idParam = this.activatedRoute.snapshot.paramMap.get('productId');
      if (idParam !== null) {
        this.productId = +idParam;
      }
      if (!isNaN(this.productId)) {
        this.productService.getDetailProduct(this.productId).subscribe({
          next: (apiResponse: ApiResponse) => {
            const response = apiResponse.data;
            if (response.product_images && response.product_images.length > 0) {
              response.product_images.forEach((product_image: ProductImage) => {
                if (!product_image.image_url.startsWith(environment.apiBaseUrl)) {
                  product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
                }
              });
            }
            this.product = response;
            // nhom attribute 
            if (this.product?.product_attributes) {
              this.transformAttributesToEntries(this.product.product_attributes);
          }

            // dinh dang
            this.formattedPrice = this.formatPrice(this.product?.price ?? 0);
            this.showImage(0);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error?.error?.message ?? '');
          }
        });
      } else {
        console.error('Invalid productId:', idParam);
      }
      
      this.userResponse = this.userService.getUserResponseFromLocalStorage(); 
    }
  // Hàm chuyển đổi thuộc tính thành mảng các đối tượng khóa-giá trị
  transformAttributesToEntries(attributes: { value: string; attribute_name: string }[]): void {
    const groupedAttributes = attributes.reduce((acc, attr) => {
      if (!acc[attr.attribute_name]) {
        acc[attr.attribute_name] = [];
      }
      if (!acc[attr.attribute_name].includes(attr.value)) {
        acc[attr.attribute_name].push(attr.value);
      }
      return acc;
      
    }, {} as { [key: string]: string[] });
    console.log(groupedAttributes)
    this.attributeEntries = Object.entries(groupedAttributes).map(([key, values]) => ({ key, values }));
    console.log(this.attributeEntries)
  }



    onSelectAttribute(attributeName: string, value: string): void {
       this.selectedAttributes[attributeName] = value;
       console.log('Selected Attributes:', attributeName); 
       console.log('Selected Attributes:', this.selectedAttributes); // In giá trị đã chọn
    }
    formatPrice(price: number): string {
      return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }
    
    showImage(index: number): void {
      if (this.product && this.product.product_images && this.product.product_images.length > 0) {
        const totalImages = this.product.product_images.length;
        this.currentImageIndex = (index + totalImages) % totalImages;
      }
    }
  
    thumbnailClick(index: number) {
      // Cập nhật currentImageIndex khi một thumbnail được nhấp
      this.currentImageIndex = index;
    }
  
    nextImage(): void {
      this.showImage(this.currentImageIndex + 1);
    }
  
    previousImage(): void {
      this.showImage(this.currentImageIndex - 1);
    }
    
 
    addToCart(): boolean {
      if (!this.userResponse) {
        this.router.navigate(['/login']);
        return false;
      }
      const allAttributesSelected = this.attributeEntries.every(entry => 
        !!this.selectedAttributes[entry.key]
      );
    
      if (!allAttributesSelected) {
        this.toastr.error('Vui lòng chọn đầy đủ các thuộc tính sản phẩm.', 'Lỗi', {
          timeOut: 3000,
          extendedTimeOut: 1000
        });
        return false; // Indicate failure
      }
    
      if (this.product) {
        // Gọi dịch vụ giỏ hàng để thêm sản phẩm vào giỏ hàng
        this.cartservice.addToCart(this.product.id, this.quantity, this.selectedAttributes);
    
        // Hiển thị thông báo thành công
        this.toastr.success('Đã thêm vào giỏ hàng', 'Thành công', {
          timeOut: 3000,
          extendedTimeOut: 1000
        });
    
        // Đặt trạng thái của isPressedAddToCart để tránh nhấn nút nhiều lần
        this.isPressedAddToCart = true;
      } 
      return true; 
    }
    
      
  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  getTotalPrice(): number {
    if (this.product) {
      return this.product.price * this.quantity;
    }
    return 0;
  }
  buyNow(): void {
    
    const success = this.addToCart();
    if (success) {
      this.router.navigate(['/cart']);
    }
  }
}

