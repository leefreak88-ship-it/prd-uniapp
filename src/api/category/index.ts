/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 21:49:58
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-07 18:53:30
 * @FilePath: \pd_uniapp\src\api\bills\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import http from "@/utils/request";
import type { CategoryListReq, CategoryListResp } from "./types";
import type { PaginationResp } from "../types";

console.warn("[api/category] module loaded", {
  timestamp: Date.now(),
});

export const categoryApi = {
  categoryList: async (payload: CategoryListReq): Promise<PaginationResp<CategoryListResp>> => {
    console.warn("[api/category] categoryList called", {
      payload,
      timestamp: Date.now(),
    });
    console.trace("[api/category] categoryList call stack");
    const response = await http.post<PaginationResp<CategoryListResp>>("/app/goodsType/page", payload);
    console.warn("[api/category] categoryList resolved", {
      current: response.current,
      total: response.total,
      resultCount: response.result?.length ?? 0,
    });
    return response;
  },
};
