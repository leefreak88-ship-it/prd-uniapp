export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  desc: string;
  stock: number;
  image: string;
}

export type OrderStatus = "unpaid" | "paid";

export interface Order {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Bill {
  id: string;
  orderId: string;
  amount: number;
  createdAt: string;
}
