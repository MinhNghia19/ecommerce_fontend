import { Component,OnInit  } from '@angular/core';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';

import { Router } from '@angular/router';
declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SocialLoginModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  user: SocialUser | null = null;
  loggedIn: boolean = false;

  constructor(private authService: SocialAuthService,private router: Router) { }

  ngOnInit(): void {

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }
  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '970079410939-28ctr6vgasfm4qj2p0nlorainm558e5i.apps.googleusercontent.com',
      callback: this.handleLogin.bind(this),
      auto_select: false // Prevent automatic sign-in
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button')!,
      {
        theme: 'outline',
        size: 'medium',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300
      }
    );
    // google.accounts.id.prompt();
  }
  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  handleLogin(response: any): void {
    // Handle the response here
    // this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    if(response) {

      const payload =this.decodeToken(response.credential);
      const userId = payload.sub; // Google user ID
      const userName = payload.name; // User's full name
      const userEmail = payload.email; // User's email
  
      // Optionally, store user info in session storage or a service
      sessionStorage.setItem('loggedInUser', JSON.stringify({
        id: userId,
        name: userName,
        email: userEmail
      }));
      console.log(userId);
      console.log(userName);
      console.log(userEmail);
      sessionStorage.setItem("loggedInUser",JSON.stringify(payload));
      this.router.navigate(['']);

    }
  }
}