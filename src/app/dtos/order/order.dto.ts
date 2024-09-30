
import { Product } from '../../models/product'; // Adjust the path as needed

import { CartItemDTO } from '../../dtos/order/cart.item.dto'; // Adjust the path as needed

export class OrderDTO {
  user_id: number;

  fullname: string;

  phone_number: string;
  
  address: string;

  status: string;
  
  total_money?: number;

  order_date?: Date;

  payment_method: string;

  coupon_code: string;

  cart_items: CartItemDTO[]; // Use CartItemDTO type here

  constructor(data: any) {
    this.user_id = data.user_id;
    this.fullname = data.fullname;
    this.phone_number = data.phone_number;
    this.address = data.address;
    this.status = data.status;
    this.order_date = data.order_date;
    this.total_money = data.total_money;
    this.payment_method = data.payment_method;
    this.coupon_code = data.coupon_code;

    // Transform cart_items from { product, quantity, attributes }[] to { product_id, quantity }[]
    this.cart_items = data.cart_items.map((item: { product: Product; quantity: number; attributes: { [key: string]: string } }) => ({
      product_id: item.product.id, // Extract product_id from the product object
      quantity: item.quantity,
      attributes: item.attributes // Correctly reference the item's attributes
    }));
    
  }
}
