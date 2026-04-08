/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 21:49:58
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-02 21:52:46
 * @FilePath: \pd_uniapp\src\api\share\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import http from "@/utils/request";
import type { ShareListReq, ShareListResp } from "./types";
import type { PaginationResp } from "../types";

export const shareApi = {
  shareList: async (payload: ShareListReq): Promise<PaginationResp<ShareListResp>> => {
    return http.post("/app/shareModel/page", payload);
  },
};
