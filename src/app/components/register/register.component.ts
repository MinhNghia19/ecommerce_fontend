import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import NgForm
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RegisterDTO } from '../../dtos/register.dto';
import {  HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../responses/api.responses';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm; // Sử dụng @ViewChild để truy cập NgForm
  phoneNumber: string = '';
  password: string = '';
  retypePassword: string = '';
  fullName: string = '';
  email: string = '';
  errorToast: string = ''; // Ensure this is a primitive string

  passwordFieldType: string = 'password'; // Mặc định là 'password'
  confirmPasswordFieldType: string = 'password'; // Mặc định là 'password'

  isLoading: boolean = false; // Add this property
  otp: string = ''; // OTP nhập từ người dùng
  isOTPScreenVisible: boolean = false; // Quản lý việc hiển thị bảng OTP
  countdown = 120; // Đếm ngược 120 giây
  countdownInterval: any; // Để lưu lại bộ đếm thời gian

  private registerDTO?: RegisterDTO; 
  constructor(

      private router: Router,
      private userService: UserService,
      private toastr: ToastrService,

    ) {
    }
  // Xử lý việc gửi form
  onSubmit() {
    // Đánh dấu tất cả các trường là "touched" để hiển thị lỗi xác thực
    this.registerForm.form.markAllAsTouched();

    if (this.registerForm.invalid) {
      return; // Nếu form không hợp lệ, không gửi dữ liệu
    } 

    this.registerDTO = {
      fullname: this.fullName,
      phone_number: this.phoneNumber,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
    };
    this.isLoading = true;
    this.userService.register(this.registerDTO).subscribe({
      
      next: (apiResponse: ApiResponse) => {
    
        console.log(apiResponse)
       
        this.showOTPScreen();
        this.isLoading = false;
      },
      complete: () => {
  
      },
      error: (error: HttpErrorResponse) => {
        debugger;
        this.isLoading = false;
        this.errorToast = error?.error?.message ?? '';
        this.toastr.error(this.errorToast , 'Lỗi!', {
          timeOut: 3000,
          extendedTimeOut: 1000
        });
        console.error(error?.error?.message ?? '');
      } 
  })   
}

  // Hiển thị bảng nhập OTP và bắt đầu đếm ngược
// Hiển thị bảng nhập OTP và bắt đầu đếm ngược
showOTPScreen() {
  this.isOTPScreenVisible = true;
  this.resetCountdown(); // Đặt lại thời gian đếm ngược
  this.startCountdown();
}

// Đặt lại thời gian đếm ngược về giá trị mặc định
resetCountdown() {
  this.countdown = 120; // Hoặc giá trị mặc định bạn muốn
  if (this.countdownInterval) {
    clearInterval(this.countdownInterval); // Xóa bộ đếm thời gian hiện tại nếu có
  }
}

// Bắt đầu đếm ngược
startCountdown() {
  this.countdownInterval = setInterval(() => {
    if (this.countdown > 0) {
      this.countdown--;
    } else {
      clearInterval(this.countdownInterval);
      this.hideOTPScreen(); // Ẩn bảng OTP khi hết thời gian
    }
  }, 1000);
}

  
  // Phương thức để ẩn bảng OTP khi hết thời gian đếm ngược
  hideOTPScreen() {
    this.isOTPScreenVisible = false;
  }
  
  // Phương thức để hiển thị thời gian dưới dạng phút:giây
  getFormattedCountdown() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  

  // Gửi OTP sau khi người dùng nhập
  submitOTP() {
    this.registerDTO = {
      fullname: this.fullName,
      phone_number: this.phoneNumber,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
    };
    console.log( this.registerDTO )
    if (!this.otp || !this.registerDTO) return;
    console.log(this.otp)
    // Gửi OTP xuống backend
    this.userService.verifyOTP(this.otp,this.registerDTO).subscribe({

      next: (apiResponse: ApiResponse) => {
        console.log(apiResponse)
        this.router.navigate(['/login']);
      },
      complete: () => {
        this.toastr.success('Đăng Ký thành công', 'Thành công', {
          timeOut: 3000,
          extendedTimeOut: 1000
        });
      },
      error: (error: HttpErrorResponse) => {
        this.errorToast = error?.error?.message ?? '';
        this.toastr.error(this.errorToast , 'Lỗi!', {
          timeOut: 3000,
          extendedTimeOut: 1000
        });
        console.error(error?.error?.message ?? '');
      } 
    }); 
  }


  // Chuyển đổi chế độ hiển thị mật khẩu
  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  // Chuyển đổi chế độ hiển thị xác nhận mật khẩu
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
  }
  onLoginClick() {
    this.router.navigate(['/login']);
  }
}
