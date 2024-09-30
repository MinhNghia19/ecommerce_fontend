import { Injectable } from '@angular/core';
// @ts-ignore
import unidecode from 'unidecode'; // Import thư viện

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor() {}
  createFriendlyUrl(productName: string): string {
    // Chuyển đổi tiếng Việt có dấu thành không dấu
    const normalized = unidecode(productName);
    
    // Xử lý chuyển đổi ký tự không phải chữ cái hoặc số
    return normalized
      .toLowerCase() // Chuyển tất cả ký tự thành chữ thường
      .replace(/[^a-z0-9]+/g, '-') // Thay các ký tự không phải là chữ cái hoặc số bằng dấu gạch ngang
      .replace(/^-+|-+$/g, ''); // Loại bỏ dấu gạch ngang thừa ở đầu và cuối
  }
}
