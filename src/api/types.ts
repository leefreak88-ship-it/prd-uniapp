/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 16:42:38
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-07 15:37:09
 * @FilePath: \pd_uniapp\src\api\type.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
  goodsImage: string;
}

export type OrderStatus = "unpaid" | "paid";

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Bill {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  createdAt: string;
}

export interface LoginPayload {
  account: string;
  password: string;
}

export interface UserProfile {
  id: string;
  account: string;
  nickname: string;
}

export interface LoginResult {
  token: string;
  user: UserProfile;
}

export interface ApiResponse<T> {
  code?: number;
  data?: T;
  msg?: string;
  ok?: boolean;
}

/**
 * Pagination
 */
export interface PaginationReq {
  current?: number;
  pageSize?: number;
}
/**
 * Sort
 */
export interface SortReq {
  columnKey?: string;
  order?: string;
}

/** 公共分页响应体 */
export interface PaginationResp<T> {
  current?: number;
  result?: T[];
  size?: number;
  total?: number;
}

/**
 * Result«boolean»
 */
export interface MsgResponse {
  code?: number;
  data?: boolean;
  msg?: string;
  ok?: boolean;
}
