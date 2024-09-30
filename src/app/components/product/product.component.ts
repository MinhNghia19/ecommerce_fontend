import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

import { Category } from '../../models/category';
import { Subcategory } from '../../models/subcategory';

import { Product } from '../../models/product';

import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { ApiResponse } from '../../responses/api.responses';

import { Router, ActivatedRoute } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { UtilityService } from '../../services/utility.service'; // Đường dẫn tới service của bạn

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [    FooterComponent,
    HeaderComponent,],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
 
})
export class ProductComponent {

  categories: Category[] = []; // Dữ liệu động từ categoryService
  subcategories: Subcategory[] = []; 
  products: Product[] = [];
  category_id : number = 0 ;
  subcategory_id :number = 0;
  currentCategory: string ="";
  currentsubCategory: string ="";
  apiBaseUrl = environment.apiBaseUrl;
    buttons = [
    { label: 'Pho bien' },
    { label: 'Moi nhat' },
    { label: 'Ban chay' }
  ];

  activeIndex = 0;
  constructor (
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private utilityService: UtilityService,
      private router:Router,) 
    {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const categoryName = params.get('categoryName');
      const categoryId = params.get('categoryId');
      const subcategoryName = params.get('subcategoryName');
      const subcategoryId = params.get('subcategoryId');
      console.log( categoryName,'1');
      console.log(categoryId,'2');
      console.log(subcategoryName,'3');
      console.log(subcategoryId,'4');
      if (categoryId) {
        this.category_id = +categoryId;
        this.getSubcategories(this.category_id);
        this.getProductsByCategoryId(this.category_id);
      }
    });

  }
  
  getSubcategories(category_id: number) {
    this.subcategoryService.getSubcategories(category_id).subscribe({
      next: (subcategories: ApiResponse) => {
        debugger
        this.subcategories = subcategories.data;
        this.currentCategory =  this.subcategories[0].category.name;

      },
      complete: () => {
        debugger;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  getProductsByCategoryId(category_id: number) {
    this.productService.getProductsByCategoryId(category_id).subscribe({
      next: (response: ApiResponse) => {
        debugger;
        response.data.forEach((product: Product) => {          
          product.url = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
        });
        this.products = response.data;

      },
      complete: () => {
        debugger;
      },
      error: (error: HttpErrorResponse) => {
        debugger;
        console.error(error?.error?.message ?? '');
      }
    });    
  }

  getProductsBySubCategoryId(subcategory_id: number) {
    this.productService.getProductsBySubCategoryId(subcategory_id).subscribe({
      next: (response: ApiResponse) => {
        debugger;
        response.data.forEach((product: Product) => {          
          product.url = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
        });
        this.products = response.data;

      },
      complete: () => {
        debugger;
      },
      error: (error: HttpErrorResponse) => {
        debugger;
        console.error(error?.error?.message ?? '');
      }
    });    
  }

  setActive(category: string): void {
    this.currentCategory = category;
    
   
  }
  
  setActiveBT(index: number): void {
    this.activeIndex = index;
    
  }
  onProductClick(product:Product) {
    debugger;
    const productName = this.utilityService.createFriendlyUrl(product.name);
    // Điều hướng đến trang detail-product với productId là tham số
    this.router.navigate(['/products-detail', `${productName}`,product.id]);
  }
 

  
   onCategoryClick(subcategory: Subcategory) {
  
    // const categoryName = this.utilityService.createFriendlyUrl(subcategory.category.name);
    this.router.navigate(['/products', `${subcategory.category.name}-cat`, subcategory.category.id]).then(() => {
      this.getSubcategories(subcategory.category.id);

      this.getProductsByCategoryId(subcategory.category.id);
   
    });
  }
  onSubcategoryClick(subcategory: Subcategory) {
    const subcategoryName = this.utilityService.createFriendlyUrl(subcategory.name);
    this.router.navigate(['/products', `${subcategory.category.name}-cat`, subcategory.category.id,`${subcategoryName}`, subcategory.id]).then(() => {
      this.getProductsBySubCategoryId(subcategory.id);
      
    });
    console.log(subcategory.id)
  }
  
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }
}
