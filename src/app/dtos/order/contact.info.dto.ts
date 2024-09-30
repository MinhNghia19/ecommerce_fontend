export class ContactInfoDTO {
    full_name :string;
    phone_number: string;
    address : string
  
    constructor(data:{full_name:string, phone_number: string,address:string}) {
      this.full_name = data.full_name;
      this.phone_number = data.phone_number;
      this.address = data.address;
    }
  }