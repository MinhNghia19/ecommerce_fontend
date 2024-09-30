// user-dto.model.ts
export class GoogleLoginDTO {
    google_account_id: string;
    fullname: string;
    email: string;
    role_id: number = 3;
  
    constructor(google_account_id: string, fullname: string, email: string ,role_id: number) {
      this.google_account_id = google_account_id;
      this.fullname = fullname;
      this.email = email;
      this.role_id = role_id;
    }
  }
  