/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-03-31 21:23:38
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-01 09:41:10
 * @FilePath: \pd_uniapp\vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import UniComponents from "@uni-helper/vite-plugin-uni-components";
import { fileURLToPath, URL } from "node:url";

const uniPlugin = (uni as unknown as { default?: typeof uni }).default ?? uni;

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    uniPlugin(),
    UniComponents({
      resolvers: [],
      dts: "src/components.d.ts",
    }),
  ],
});
