/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-03-31 21:23:58
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-07 19:09:08
 * @FilePath: \pd_uniapp\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Pinia from "pinia";
import { QueryCache, QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { createSSRApp } from "vue";
import App from "./App.vue";

// WeChat mini-program compatibility: AbortController polyfill.
// TanStack Query v5 calls `new AbortController()` inside query.fetch() BEFORE dispatching the
// fetch action. If AbortController is missing, query.fetch() throws silently (caught by
// promise.catch(noop)), queryFn is never called, and fetchStatus stays 'idle' forever.
// WeChat mini-program only added native AbortController support in relatively recent base library
// versions, so we provide a minimal polyfill for older environments.
if (typeof AbortController === "undefined") {
  console.warn("[main] AbortController not found — applying polyfill");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).AbortController = class {
    signal = {
      aborted: false as boolean,
      reason: undefined as unknown,
      addEventListener: (_: string, __: unknown) => {},
      removeEventListener: (_: string, __: unknown) => {},
      dispatchEvent: (_: unknown) => true,
    };
    abort(reason?: unknown) {
      this.signal.aborted = true;
      this.signal.reason = reason;
    }
  };
} else {
  console.warn("[main] AbortController available:", typeof AbortController);
}

export function createApp() {
  console.warn("[main] createApp start", {
    timestamp: Date.now(),
    hasConsoleLog: typeof console.log === "function",
    hasConsoleWarn: typeof console.warn === "function",
  });
  const app = createSSRApp(App);
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.error("[main] queryCache onError", {
          queryKey: query.queryKey,
          message: error instanceof Error ? error.message : String(error),
        });
      },
      onSuccess: (_data, query) => {
        console.warn("[main] queryCache onSuccess", {
          queryKey: query.queryKey,
          state: query.state.status,
        });
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000,
        networkMode: "always",
      },
    },
  });

  if (typeof uni.onError === "function") {
    uni.onError((error) => {
      console.error("[main] uni.onError", error);
    });
  }
  if (typeof uni.onUnhandledRejection === "function") {
    uni.onUnhandledRejection((event) => {
      console.error("[main] uni.onUnhandledRejection", event);
    });
  }

  app.use(Pinia.createPinia());
  console.warn("[main] pinia registered");
  app.use(VueQueryPlugin, { queryClient });
  console.warn("[main] vue-query plugin registered");
  return {
    app,
    Pinia,
  };
}
