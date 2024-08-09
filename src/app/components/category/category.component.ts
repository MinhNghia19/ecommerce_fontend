import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

import { Category } from '../../models/category';
import { Subcategory } from '../../models/subcategory';

import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { ApiResponse } from '../../responses/api.responses';

import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-category',
  standalone: true,
  imports: [    FooterComponent,
    HeaderComponent,],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {

  categories: Category[] = []; // Dữ liệu động từ categoryService
  subcategories: Subcategory[] = []; // Dữ liệu động từ categoryService
  category_id : number = 0 ;
  currentCategory: string ="";
    buttons = [
    { label: 'Pho bien' },
    { label: 'Moi nhat' },
    { label: 'Ban chay' }
  ];

  activeIndex = 0;
  constructor (
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private activatedRoute: ActivatedRoute,) 
    {
  }
  ngOnInit() {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.category_id = +idParam;
    }
    if (!isNaN(this.category_id)){
      this.getSubcategories(this.category_id);
    }
  }

  getSubcategories(category_id: number) {
    this.subcategoryService.getSubcategories(category_id).subscribe({
      next: (subcategories: ApiResponse) => {
        debugger
        this.subcategories = subcategories.data;
        if (this.subcategories.length > 0) {
          this.currentCategory = this.subcategories[0].category.name;
        }
      },
      complete: () => {
        debugger;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  setActive(category: string): void {
    this.currentCategory = category;
  }
  

  setActiveBT(index: number): void {
    this.activeIndex = index;
  }
}
