import { Product } from '../../models/product'; // Adjust the path as needed

export class CartItemDTO {
  product: Product;
  quantity: number;
  attributes: { [key: string]: string };

  constructor(data: { product: Product; quantity: number; attributes: { [key: string]: string } }) {
    this.product = data.product;
    this.quantity = data.quantity;
    this.attributes = data.attributes;
  }
}
