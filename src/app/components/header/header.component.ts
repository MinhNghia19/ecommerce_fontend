import { Component, OnInit, Inject } from '@angular/core';

import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';

import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
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
  constructor(

    private router:Router,
    private categoryService: CategoryService,

    ) {}

  ngOnInit() {

    this.getCategories();
  }
  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories: any) => {
        debugger
        this.categories = categories.data;
      },
      complete: () => {
        debugger;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
  onSingin() {

    // Điều hướng đến trang detail-product với productId là tham số
    this.router.navigate(['/login']);
  }
}
