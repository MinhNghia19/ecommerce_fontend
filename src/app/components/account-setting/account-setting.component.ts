import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service'; // Update path accordingly
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiResponsePro, Province, District, Ward } from '../../responses/apiprovinces.responses';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { ContactInfoDTO } from '../../dtos/order/contact.info.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../responses/api.responses';
import { Router } from '@angular/router';
import {UserResponse} from '../../responses/user.response'
@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,   
  ],
})
export class AccountSettingComponent implements OnInit {
  accountForm: FormGroup;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  selectedProvinceId: string | null = null;
  selectedDistrictId: string | null = null;
  submitted = false;
  userResponse?: UserResponse;
  token : string = '';

  constructor(private apiService: ApiService,
              private tokenService: TokenService
    ,private userService: UserService, private router: Router, private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      fullName: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      province: ['', Validators.required],
      district: [{ value: '', disabled: true }, Validators.required],
      ward: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProvinces();
    this.token = this.tokenService.getToken();
  }

  loadProvinces(): void {
    this.apiService.getProvinces().subscribe(response => {
      this.provinces = response.data;
    });
  }

  loadDistricts(provinceId: string): void {
    this.apiService.getDistricts(provinceId).subscribe(response => {
      this.districts = response.data;
      this.accountForm.get('district')?.enable();
      this.accountForm.get('ward')?.disable();
      this.wards = [];
      this.selectedDistrictId = null;
    });
  }

  loadWards(districtId: string): void {
    this.apiService.getWards(districtId).subscribe(response => {
      this.wards = response.data;
      this.accountForm.get('ward')?.enable();
    });
  }

  onProvinceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProvinceId = target.value;
    if (this.selectedProvinceId) {
      this.loadDistricts(this.selectedProvinceId);
      this.accountForm.patchValue({ district: '', ward: '' });
      this.districts = [];
      this.wards = [];
      this.selectedDistrictId = null;
    }
  }

  onDistrictChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedDistrictId = target.value;
    if (this.selectedDistrictId) {
      this.loadWards(this.selectedDistrictId);
      this.accountForm.patchValue({ ward: '' });
      this.wards = [];
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.accountForm.valid) {
  
      const formValues = this.accountForm.value;
      const fullName = formValues.fullName;
      const phoneNumber = formValues.phoneNumber;
      const province = this.provinces.find(p => p.id === formValues.province)?.full_name || 'N/A';
      const district = this.districts.find(d => d.id === formValues.district)?.full_name || 'N/A';
      const ward = this.wards.find(w => w.id === formValues.ward)?.full_name || 'N/A';
      

      const fullAddress = `${ward}, ${district}, ${province}`;
      const accountData  = new ContactInfoDTO( {
        full_name: fullName,
        phone_number : phoneNumber,
        address : fullAddress
      })
      console.log(accountData)
      this.userService.updateContactinfo(accountData,this.token).subscribe({
        next: (apiResponse: ApiResponse) => {
          console.log('user ',apiResponse);
          // response.data = this.userService.saveUserResponseToLocalStorage();
          console.log(apiResponse.data)
          this.userResponse = {
            ...apiResponse.data,
          };  
          this.userService.saveUserResponseToLocalStorage(this.userResponse); 
        },
        complete: () => {
          this.router.navigate(['']);
        },
        error: (error: HttpErrorResponse) => {
          console.error(`Lỗi khi đặt hàng: ${error?.error?.message ?? ''}`);
        },
      });

    }


  }

  // get name() {
  //   return this.accountForm.get('name');
  // }

  get phoneNumber() {
    return this.accountForm.get('phoneNumber');
  }

  get province() {
    return this.accountForm.get('province');
  }

  get district() {
    return this.accountForm.get('district');
  }

  get ward() {
    return this.accountForm.get('ward');
  }
}
