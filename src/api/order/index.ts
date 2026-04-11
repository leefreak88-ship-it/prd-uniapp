/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 21:49:58
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-02 21:59:01
 * @FilePath: \pd_uniapp\src\api\order\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import http from "@/utils/request";
import type { CreateOrderReq, OrderDto, OrderRequestPayload } from "./types";
import type { PaginationResp } from "../types";

export const orderApi = {
  orderList: async (payload: OrderRequestPayload): Promise<PaginationResp<OrderDto>> => {
    return http.post("/app/order/page", payload);
  },
  /**
   * 创建代付订单，返回订单详情（含 id）
   * TODO: 路径以后端实际接口为准
   */
  createOrder: async (payload: CreateOrderReq): Promise<OrderDto> => {
    return http.post("/app/order/add", payload);
  },
  /**
   * 根据订单 id 查询订单详情（分享链接收款方加载订单用）
   * TODO: 路径以后端实际接口为准
   */
  getOrderById: async (id: string): Promise<OrderDto> => {
    return http.post("/app/order/info", { id });
  },
};
