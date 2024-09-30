import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject ,Observable} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Map<string, { quantity: number; attributes: { [key: string]: string } }> 
                = new Map<string, { quantity: number; attributes: { [key: string]: string } }>();
  localStorage?:Storage;
  private cartSubject = new BehaviorSubject<Map<string, { quantity: number; attributes: { [key: string]: string } }>>(this.cart);
  
  cart$ = this.cartSubject.asObservable();
  constructor(@Inject(DOCUMENT) private document: Document) {
    // this.localStorage = document.defaultView?.localStorage ?? window.localStorage;
    this.localStorage = document.defaultView?.localStorage;
    this.refreshCart();
  }

  addToCart(productId: number, quantity: number = 1, selectedAttributes: { [key: string]: string } = {}): void {
    if (!productId || quantity <= 0) {
      return;
    }

    // Tạo khóa duy nhất cho sản phẩm dựa trên ID và thuộc tính
    const key = this.createCartKey(productId, selectedAttributes);

    const existingEntry = this.cart.get(key);

    if (existingEntry) {
      existingEntry.quantity += quantity; // Tăng số lượng nếu đã có mục với thuộc tính tương ứng
    } else {
      this.cart.set(key, { quantity, attributes: selectedAttributes }); // Thêm mới nếu thuộc tính khác
    }

    this.saveCartToLocalStorage();
    this.cartSubject.next(this.cart);
    
  }

  public createCartKey(productId: number, attributes: { [key: string]: string }): string {
    // Sort the attribute keys alphabetically to ensure consistent ordering
    const sortedAttributes = Object.keys(attributes).sort().reduce((obj, key) => {
      obj[key] = attributes[key];
      return obj;
    }, {} as { [key: string]: string });
  
    // Convert the sorted attributes to a JSON string
    const attributesString = JSON.stringify(sortedAttributes);
    return `${productId}-${attributesString}`;
  }
  

  

  private saveCartToLocalStorage(): void {
    const cartKey = this.getCartKey();
    
    // Convert the Map to an array for storage
    const cartArray = Array.from(this.cart.entries()).map(([key, value]) => [key, value]);
    this.cartSubject.next(this.cart);
    // Save the converted array to localStorage using the cartKey
    if (cartKey) {
      this.localStorage?.setItem(cartKey, JSON.stringify(cartArray));
      console.log(`Cart array saved to localStorage under key ${cartKey}:`, cartArray);
    } else {
      console.warn('Unable to save cart: user ID is missing.');
    }
    
  }
  
  public refreshCart(): void {
    const cartKey = this.getCartKey();
  
    if (cartKey && typeof window !== 'undefined' && window.localStorage) {
      const storedCart = this.localStorage?.getItem(cartKey);
      
      if (storedCart) {
        // Convert JSON array back to `Map`
        const cartArray = JSON.parse(storedCart) as [string, { quantity: number; attributes: { [key: string]: string } }][];
        this.cart = new Map(cartArray);
        this.cartSubject.next(this.cart);
        console.log(`Cart loaded from localStorage for key ${cartKey}:`, this.cart);
      } else {
        this.cart = new Map<string, { quantity: number; attributes: { [key: string]: string } }>();
        console.log(`No cart found in localStorage for key ${cartKey}, initializing empty cart.`);
      }
    } else {
      // Fallback for SSR or environments without localStorage
      this.cart = new Map<string, { quantity: number; attributes: { [key: string]: string } }>();
      console.warn('LocalStorage is not available or user ID is missing, initializing empty cart.');
    }
  }
  private getCartKey(): string {
    const userResponseJSON = this.localStorage?.getItem('user');
    let userId = '';
    
    if (userResponseJSON) {
      try {
        const userResponse = JSON.parse(userResponseJSON);
        userId = userResponse?.id ?? '';
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    this.cartSubject.next(this.cart);
    return `cart:${userId}`;
    
  }
  getCartObservable(): Observable<Map<string, { quantity: number; attributes: { [key: string]: string } }>> {
    return this.cart$;
  }

  
  public getCart(): Map<string, { quantity: number; attributes: { [key: string]: string } }> {
    this.cartSubject.next(this.cart);
    return this.cart;
    
  }
  public setCart(cart: Map<string, { quantity: number; attributes: { [key: string]: string } }>): void {
    this.cart = cart ?? new Map<string, { quantity: number; attributes: { [key: string]: string } }>();
    this.cartSubject.next(this.cart);
    this.saveCartToLocalStorage();
  }

  clearCart(): void {
    this.cart.clear();
    this.saveCartToLocalStorage();
    this.cartSubject.next(this.cart); 
  }
}
