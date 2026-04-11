import type { PaginationReq, SortReq } from "../types";

export interface BillRequestPayload {
  id?: string;
  pageType?: string;
  pagination?: PaginationReq;
  params?: { [key: string]: any };
  sort?: SortReq;
}

/**
 * 代付完成后生成账单参数
 */
export interface CreateBillReq {
  orderId: string;
  chatHandsId: string;
  orderPrice: number;
}

export interface BillDto {
  createTime?: Date;
  id?: string;
  orderId?: string;
  orderInfo?: BillInfo;
  updateTime?: Date;
}

export interface BillInfo {
  chatHandsId?: string;
  createTime?: Date;
  goodsId?: string;
  id?: string;
  orderPrice?: number;
  shareModelId?: string;
  updateTime?: Date;
}
