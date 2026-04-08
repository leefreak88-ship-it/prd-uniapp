/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 19:00:39
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-02 19:09:52
 * @FilePath: \pd_uniapp\src\api\goods\types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { PaginationReq, SortReq } from "../types";

// 商品分类查询参数：支持分页与排序
export interface CategoryListReq {
  pagination?: PaginationReq;
  params?: { [key: string]: any };
  sort?: SortReq;
}

/**
 * 商品分类列表响应数据
 */
export interface CategoryListResp {
  createTime?: Date;
  deleted?: number;
  goodsTypeName?: string;
  id?: string;
  idx?: number;
  updateTime?: Date;
  version?: number;
}
