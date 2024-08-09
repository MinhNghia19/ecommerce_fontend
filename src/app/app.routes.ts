import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { CategoryComponent  } from './components/category/category.component';
import {LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },  
    { path: 'subcategories/category/:id', component: CategoryComponent },
];
