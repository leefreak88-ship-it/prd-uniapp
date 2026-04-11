import type { PaginationReq, SortReq } from "../types";

export interface OrderRequestPayload {
  id?: string;
  pageType?: string;
  pagination?: PaginationReq;
  params?: { [key: string]: any };
  sort?: SortReq;
}

/**
 * 创建代付订单参数
 */
export interface CreateOrderReq {
  goodsId: string;
  orderPrice: number;
  shareModelId: string;
  chatHandsId?: string;
}

export interface OrderDto {
  chatHandsId?: string;
  chatHandsInfo?: ChatHandsInfo;
  createTime?: Date;
  goodsId?: string;
  id?: string;
  orderPrice?: number;
  shareModelId?: string;
  shareModelInfo?: ShareModelInfo;
  updateTime?: Date;
}

export interface ChatHandsInfo {
  chatHandsName?: string;
  chatHandsPhone?: string;
  id?: string;
  remark?: string;
}

export interface ShareModelInfo {
  id?: string;
  shareModelImage1?: string;
  shareModelImage2?: string;
  shareModelName?: string;
  shareModelTitle?: string;
  shareModelType?: number;
}
