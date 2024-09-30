import { AfterViewInit, Component,OnInit ,CUSTOM_ELEMENTS_SCHEMA,} from '@angular/core';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, DOCUMENT } from '@angular/common';


import { RouterModule } from '@angular/router'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';
import { Subcategory } from '../../models/subcategory';

import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { ApiResponse } from '../../responses/api.responses';

import {isPlatformBrowser} from "@angular/common"; // update this
import { Inject, PLATFORM_ID } from '@angular/core';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,RouterModule,  FormsModule,

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit,AfterViewInit {


  categories: Category[] = []; // Dữ liệu động từ categoryService
  subcategories: Subcategory[] = []; // Dữ liệu động từ categoryService
  images = [
    '../../../assets/images/banner-iphone.jpg',
    '../../../assets/images/banner-laptop.jpg',
    '../../../assets/images/banner-cooker.jpg'
  ];
  currentSlide:number = 0;

  isBrowser: boolean;

  constructor(

    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
    ) {  this.isBrowser = isPlatformBrowser(this.platformId);}

    ngOnInit() {
      this.getCategories();

       console.log('ngOnInit');

      // window.setInterval(()=>{ this.nextSlide();},5000);

    
      // setInterval(() => {
      //   this.nextSlide();
      // }, 4000); // Đổi slide mỗi 4 giây
   
    }
    ngAfterViewInit(): void {
      if(this.isBrowser) { // check it where you want to write setTimeout or setInterval
        setInterval(()=> {
          this.nextSlide();
        }, 5000)
      }


    }
    
  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories: ApiResponse) => {
      
        this.categories = categories.data;
      },
      complete: () => {
        
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
  getSubcategories(category_id: number) {
  
    this.subcategoryService.getSubcategories(category_id).subscribe({
      next: (subcategories: ApiResponse) => {
        
        this.subcategories = subcategories.data;
      },
      complete: () => {
        
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.images.length) % this.images.length;

  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;

  }

  onCategoryClick(category: Category ) {
    this.router.navigate(['/products', `${category.name}-cat`, category.id]);
  }
  
  
}
