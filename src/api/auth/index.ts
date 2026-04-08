/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 18:50:37
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-02 22:13:43
 * @FilePath: \pd_uniapp\src\api\auth\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import http, { setAuthToken } from "@/utils/request";
import type { LoginPayload, LoginSuccessData } from "@/api/auth/types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginSuccessData> => {
    const result = await http.post<LoginSuccessData>("/app/user/login", payload);
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },
};

export const loginByPassword = authApi.login;
