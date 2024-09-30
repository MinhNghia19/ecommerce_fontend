import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { ProductComponent  } from './components/product/product.component';
import {LoginComponent } from './components/login/login.component';
import {CartComponent } from './components/cart/cart.component';
import {OrderComponent } from './components/order/order.component';
import {OrderDetailComponent } from './components/order-detail/order-detail.component';
import {AccountSettingComponent } from './components/account-setting/account-setting.component';
import {RegisterComponent } from './components/register/register.component';
import { AuthGuardFn } from './guards/auth.guard';
import { AdminGuardFn } from './guards/admin.guard';
import { 
    ProductDetailComponent 
  } from './components/product-detail/product-detail.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },  
    { path: 'register', component: RegisterComponent },  
  
    { 
      path: 'products/:categoryName/:categoryId', 
      component: ProductComponent,
      children: [
          { 
              path: ':subcategoryName/:subcategoryId', 
              component: ProductComponent 
          }
      ]
    },
    
    
    { path: 'products-detail/:categoryName/:productId', component: ProductDetailComponent},
    { path: 'cart', component: CartComponent ,canActivate:[AuthGuardFn]},
    { path: 'account-setting', component: AccountSettingComponent },  
    { path: 'orders', component: OrderComponent,canActivate:[AuthGuardFn]},  
    { path: 'orders-detail', component: OrderDetailComponent,canActivate:[AuthGuardFn] },  
    
];
