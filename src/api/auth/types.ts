/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 21:33:27
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-02 22:20:23
 * @FilePath: \pd_uniapp\src\api\auth\types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface LoginPayload {
  phone?: string;
  wxNumber?: string;
}

export interface LoginSuccessData {
  token?: string;
  userId?: string;
  userName?: string;
}
