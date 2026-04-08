/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 19:00:39
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-02 21:39:19
 * @FilePath: \pd_uniapp\src\api\goods\types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { PaginationReq, SortReq } from "../types";

export interface ProductListReq {
  /**
   * 数据id
   */
  id?: string;
  /**
   * 分页类型，默认：null，goods_id：根据商品id，chat_hands_id：根据聊手id，goods_type_id：商品分类id，order_id：订单id
   */
  pageType?: string;
  pagination?: PaginationReq;
  params?: { [key: string]: any };
  sort?: SortReq;
}

/**
 * 商品列表响应数据
 */
export interface ProductListResp {
  createTime?: Date;
  deleted?: number;
  goodsImage?: string;
  goodsName?: string;
  goodsPrice?: number;
  goodsTypeId?: string;
  id?: string;
  idx?: number;
  updateTime?: Date;
  version?: number;
}
