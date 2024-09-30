import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ApiResponse } from '../../responses/api.responses';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

import {UserResponse} from '../../responses/user.response'
import { UserService } from '../../services/user.service';
import { inject } from '@angular/core';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [HeaderComponent, CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  userResponse?:UserResponse | null;
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  cart: Map<string, { quantity: number; attributes: { [key: string]: string; }; }> = new Map();
  cartItems: { product: Product; quantity: number; attributes: { [key: string]: string; } }[] = [];
  totalAmount: number = 0; // Total amount

  constructor(private router: Router,    private userService: UserService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    const productIds = Array.from(this.cart.keys())
      .map(key => +key.split('-')[0]);

    if (productIds.length === 0) {
      return;
    }
    console.log(productIds,'productIds')
    console.log(this.cart,'this.cart')
    this.productService.getProductsByIds(productIds).subscribe({
      next: (apiResponse: ApiResponse) => {
        const products: Product[] = apiResponse.data;
        this.cartItems = Array.from(this.cart.entries()).map(([key, value]) => {
          const [productId, attributesString] = key.split('-');
          const attributes = JSON.parse(attributesString);
        
          // Tìm sản phẩm từ danh sách sản phẩm
          const product = products.find(p => p.id === Number(productId));
        
          if (product && !product.thumbnail.startsWith(environment.apiBaseUrl)) {
            product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          }
        
          return {
            product: product!,
            quantity: value.quantity,
            attributes: attributes
          };
        });
        
        console.log('cartItems', this.cartItems);
        
      },
      complete: () => {
        this.calculateTotal();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error?.error?.message ?? '');
      }
    });
    this.userResponse = this.userService.getUserResponseFromLocalStorage(); 
  }

  onCartClick() {
    if(!this.userResponse?.phone_number)
    {
      this.router.navigate(['/account-setting']);
    }

    else{
    
      this.router.navigate(['/orders']);
    }
  }

  decreaseQuantity(index: number): void {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
      this.updateCartFromCartItems();
      this.calculateTotal();
    }
  }

  increaseQuantity(index: number): void {
    this.cartItems[index].quantity++;
    this.updateCartFromCartItems();
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  confirmDelete(index: number): void {
    if (index >= 0 && index < this.cartItems.length) { // Kiểm tra chỉ số hợp lệ
      if (confirm('Are you sure you want to remove this item?')) {
        this.cartItems.splice(index, 1);
        this.updateCartFromCartItems();
        this.calculateTotal();
      }
    } else {
      console.error('Invalid index:', index); 
    }
  }
  

  private updateCartFromCartItems(): void {
    this.cart.clear(); // Xóa giỏ hàng hiện tại
    this.cartItems.forEach(item => {
      this.cart.set(this.cartService.createCartKey(item.product.id, item.attributes), { // Tạo khóa cho mục
        quantity: item.quantity,
        attributes: item.attributes
      });
    });
    this.cartService.setCart(this.cart); // Lưu giỏ hàng mới vào CartService
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }
  getAttributeKeys(attributes: { [key: string]: string }): string[] {
    return Object.keys(attributes);
  }
}
