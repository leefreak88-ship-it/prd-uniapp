/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 21:49:58
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-03 17:41:02
 * @FilePath: \pd_uniapp\src\api\bills\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import http from "@/utils/request";
import type { BillDto, BillRequestPayload } from "./types";
import type { PaginationResp } from "../types";

export const billApi = {
  billList: async (payload: BillRequestPayload): Promise<PaginationResp<BillDto>> => {
    return http.post("/app/bill/page", payload);
  },
};
