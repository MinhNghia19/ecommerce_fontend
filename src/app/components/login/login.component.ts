import { Component, OnInit } from '@angular/core';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { GoogleLoginDTO } from '../../dtos/googlelogin.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../responses/api.responses';
import { UserResponse } from '../../responses/user.response';
import { TokenService } from '../../services/token.service'; 
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common';
import { LoginDTO } from '../../dtos/login.dto';
import { CartService } from '../../services/cart.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SocialLoginModule,FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  user: SocialUser | null = null;
  loggedIn: boolean = false;
  userResponse?: UserResponse;
  email: string = '';
  token: string = '';
  constructor(
    private authService: SocialAuthService,
    private router: Router,
    private userService: UserService,
    
    private cartService: CartService,
    private tokenService: TokenService 
  ) { }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
    google.accounts.id.initialize({
      client_id: '970079410939-28ctr6vgasfm4qj2p0nlorainm558e5i.apps.googleusercontent.com',
      callback: this.handleLoginGG.bind(this),
      auto_select: false,
    });

  
  }
  ngAfterViewInit(): void {
    google.accounts.id.renderButton(
      document.getElementById('google-signin-button')!,
      {
        theme: 'outline',
        size: 'medium',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300,
        
      }
    );

    // google.accounts.id.prompt();
    
  }

  handleLoginGG(response: any): void {
    if (response && response.credential) {
      const idToken = response.credential;
      this.userService.authenticateGoogleUser(idToken).subscribe({
        next: (apiResponse : ApiResponse) => {
          const token = apiResponse.data.token
          console.log(token);
          debugger;
                // Check if the token is already valid and exists
          if (apiResponse.message === "Token already exists and is valid") {
            console.log('Token already exists and is valid');
          } else {
            // Store the new token
            this.tokenService.setToken(token);
          }
          debugger;
          this.userService.getUserDetail(token).subscribe({
            next: (response: ApiResponse) => {
              debugger;
              const userResponse = response.data;
              this.userService.saveUserResponseToLocalStorage(userResponse);
  
              if (userResponse.role.name === 'admin') {
                this.router.navigate(['/admin']);
              } else if (userResponse.role.name === 'user') {
                this.router.navigate(['/']);
              }
            },
            complete: () => {
              this.cartService.refreshCart();
              debugger;
            },
            error: (error: HttpErrorResponse) => {
              debugger;
              console.error(error?.error?.message ?? '');
            } 
          });
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
  }
  password: string = '';
  passwordFieldType: 'password' | 'text' = 'password';

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
  onLogin(){
    const loginDTO: LoginDTO = {
      email: this.email,
      password: this.password,
    };
    this.userService.login(loginDTO).subscribe({
      next: (apiResponse: ApiResponse) => {
        debugger;
        const { token } = apiResponse.data;         
          this.tokenService.setToken(token);
          debugger;
          this.userService.getUserDetail(token).subscribe({
            next: (apiResponse2: ApiResponse) => {
              debugger
              this.userResponse = {
                ...apiResponse2.data,
              };    
              this.userService.saveUserResponseToLocalStorage(this.userResponse); 
              if(this.userResponse?.role.name == 'admin') {
                this.router.navigate(['/admin']);    
              } else if(this.userResponse?.role.name == 'user') {
                this.router.navigate(['/']);                      
              }
              
            },
            complete: () => {
              this.cartService.refreshCart();
              debugger;
            },
            error: (error: HttpErrorResponse) => {
              debugger;
              console.error(error?.error?.message ?? '');
            } 
          })                      
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
}
