// user.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../responses/api.responses';
import { UserResponse } from '../responses/user.response';
import { GoogleLoginDTO } from '../dtos/googlelogin.dto';
import { ContactInfoDTO } from '../dtos/order/contact.info.dto';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO } from '../dtos/login.dto';
import { isPlatformBrowser } from '@angular/common';
import {  inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {  HttpHeaders } from '@angular/common/http';
import { HttpUtilService } from './http.util.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private httpUtilService = inject(HttpUtilService);  

  localStorage?:Storage;
  private apiConfig = {
    headers: this.httpUtilService.createHeaders(),
  }
  constructor(        
    @Inject(DOCUMENT) private document: Document
  ) { 
    this.localStorage = document.defaultView?.localStorage;
  }

  authenticateGoogleUser(idToken: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiBaseUrl}/auth/google/code`, { idToken },this.apiConfig);
  }

  register(registerDTO: RegisterDTO):Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiBaseUrl}/users/register`,registerDTO,this.apiConfig);
  }
  verifyOTP(otp: string, registerDTO: RegisterDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiBaseUrl}/users/verify-otp?otp=${otp}`,registerDTO,this.apiConfig );
  }
  login(loginDTO: LoginDTO): Observable<ApiResponse> {    
    return this.http.post<ApiResponse>(`${environment.apiBaseUrl}/users/login`, loginDTO,this.apiConfig);
  }

  getUserDetail(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiBaseUrl}/users/details`, {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }
  
  
  

  
  getTokenFromCookies(): string | null {
    const name = 'access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookiesArray = decodedCookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
      let cookie = cookiesArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return "khong co access_token";
  }

  saveUserResponseToLocalStorage(userResponse?: UserResponse): void {
    if (userResponse) {
      const userResponseJSON = JSON.stringify(userResponse);
      localStorage.setItem('user', userResponseJSON);
    }
  }

  // getUserResponseFromLocalStorage(): UserResponse | null {
  //   const userResponseJSON = localStorage.getItem('user');
  //   return userResponseJSON ? JSON.parse(userResponseJSON) : null;
  // }

  getUserResponseFromLocalStorage():UserResponse | null {
    try {
      // Retrieve the JSON string from local storage using the key
      const userResponseJSON = this.localStorage?.getItem('user'); 
      if(userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back to an object
      const userResponse = JSON.parse(userResponseJSON!);  
      console.log('User response retrieved from local storage.');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null; // Return null or handle the error as needed
    }
  }

  removeUserFromLocalStorage(): void {
    localStorage.removeItem('user');
  }

  updateContactinfo(contactInfoDTO: ContactInfoDTO,token: string): Observable<any> {
    const userResponse = this.getUserResponseFromLocalStorage();
    return this.http.put<ApiResponse>(`${environment.apiBaseUrl}/users/details/${userResponse?.id}`, contactInfoDTO, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }
}
