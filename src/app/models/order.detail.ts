import { Product } from "./product";
import {Order} from './order'
export interface OrderDetail {
    product_thumbnail?: string;  // Add '?' if it's optional
    product_name: string;
    attributes?: { [key: string]: string } | string;  // Replace 'any' with the correct type if known
    quantity: number;
    price: number;
  }
  
  