import { Injectable, Inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
    private readonly TOKEN_KEY = 'access_token';
    private jwtHelperService = new JwtHelperService();

    constructor(private cookieService: CookieService) {}

    getToken(): string {
        return this.cookieService.get(this.TOKEN_KEY) ?? '';
    }

    setToken(token: string): void {
        this.cookieService.set(this.TOKEN_KEY, token, { 
          expires: 1, // Cookie sẽ hết hạn sau 1 ngày
          secure: true, // Chỉ gửi cookie qua HTTPS
          sameSite: 'Strict' // Ngăn chặn cookie từ các trang khác
        });
      }

    getUserId(): number {
        let token = this.getToken();
        if (!token) {
            return 0;
        }
        let userObject = this.jwtHelperService.decodeToken(token);
        return 'userId' in userObject ? parseInt(userObject['userId']) : 0;
    }

    removeToken(): void {
        this.cookieService.delete(this.TOKEN_KEY);
    }

    isTokenExpired(): boolean { 
        if(this.getToken() == null) {
            return false;
        }       
        return this.jwtHelperService.isTokenExpired(this.getToken()!);
    }
}
