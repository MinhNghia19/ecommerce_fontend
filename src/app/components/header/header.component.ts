import { Component, OnInit, Inject } from '@angular/core';

import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';

import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

import {UserResponse} from '../../responses/user.response'
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule,  FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  categories: Category[] = []; // Dữ liệu động từ categoryService

  selectedCategoryId: number  = 0; // Giá trị category được chọn

  userResponse?:UserResponse | null;

  mobileMenuOpen: boolean = false; // State for mobile menu

  itemCount: number = 0;

  constructor(
    private userService: UserService,  
    private router:Router,
    private categoryService: CategoryService,
    private cartService: CartService,
    private tokenService: TokenService
    ) {}

  ngOnInit() {

    this.getCategories();
    this.userResponse = this.userService.getUserResponseFromLocalStorage(); 
    this.cartService.getCartObservable().subscribe(cart => {
      this.updateItemCount(cart);
    });
  }
  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories: any) => {
        
        this.categories = categories.data;
      },
      complete: () => {
      
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  private updateItemCount(cart: Map<string, { quantity: number; attributes: { [key: string]: string } }>): void {
    this.itemCount = Array.from(cart.values()).reduce((total, item) => total + item.quantity, 0);
  }
  onCategoryClick(category: Category ) {
    this.router.navigate(['/products', `${category.name}-cat`, category.id]);
  }
  
  onSignin() {

    // Điều hướng đến trang detail-product với productId là tham số
    this.router.navigate(['/login']);
  }
  onSignup() {

    // Điều hướng đến trang detail-product với productId là tham số
    this.router.navigate(['/register']);
  }
  onAccountSettings() {
    // Navigate to account settings page
    this.router.navigate(['/account-setting']);
  }

  onLogout() {
    this.userService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse = this.userService.getUserResponseFromLocalStorage(); 
 // Reset giỏ hàng
    this.cartService.clearCart();
    this.router.navigate(['']);
  }
  onCartClick() {
    this.router.navigate(['/cart']);
  }
  onOrderDetail() {
    this.router.navigate(['/orders-detail']);
  }
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
