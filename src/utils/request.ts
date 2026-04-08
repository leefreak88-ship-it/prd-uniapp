/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 19:06:50
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-03 19:04:14
 * @FilePath: \pd_uniapp\src\api\request.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ApiResponse } from "@/api/types";

const TOKEN_STORAGE_KEY = "pd-auth-token";
const API_BASE_URL = (((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL as string | undefined) || "")
  .trim()
  .replace(/;+$/, "")
  .replace(/\/+$/, "");
const IS_DEV = ((import.meta as ImportMeta & { env?: Record<string, string | boolean> }).env?.DEV ?? false) === true;

const buildRequestUrl = (url: string) => {
  if (!API_BASE_URL) {
    return url;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const isAbsoluteHttpUrl = (url: string) => /^https?:\/\//i.test(url);

export const okResponse = <T>(data: T, msg = "success", code = 200): ApiResponse<T> => {
  return {
    code,
    data,
    msg,
    ok: true,
  };
};

export const failResponse = <T>(msg: string, code = 500): ApiResponse<T> => {
  return {
    code,
    msg,
    ok: false,
  };
};

export const unwrapResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.ok) {
    throw new TypeError(response.msg || "请求失败");
  }
  if (typeof response.data === "undefined") {
    throw new TypeError(response.msg || "响应数据为空");
  }
  return response.data;
};

export const setAuthToken = (token: string) => {
  uni.setStorageSync(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
  uni.removeStorageSync(TOKEN_STORAGE_KEY);
};

export const getAuthToken = () => {
  return uni.getStorageSync(TOKEN_STORAGE_KEY) as string;
};

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT";
  data?: unknown;
  header?: Record<string, string>;
  successCodes?: number[];
}

const parseResponseData = <T>(payload: unknown, successCodes: number[]): T => {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }
  const candidate = payload as Record<string, unknown>;
  if ("code" in candidate || "ok" in candidate || "data" in candidate) {
    const code = Number(candidate.code ?? 200);
    const ok = candidate.ok;
    let msg = "请求失败";
    if (typeof candidate.msg === "string") {
      msg = candidate.msg;
    } else if (typeof candidate.message === "string") {
      msg = candidate.message;
    }
    if (!successCodes.includes(code) || ok === false) {
      throw new TypeError(msg);
    }
    if ("data" in candidate) {
      return candidate.data as T;
    }
  }
  return payload as T;
};

export const request = <T>(options: RequestOptions): Promise<T> => {
  const token = getAuthToken();
  const requestUrl = buildRequestUrl(options.url);
  const header: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.header ?? {}),
  };
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  if (IS_DEV) {
    console.warn("[http] request", {
      url: requestUrl,
      rawUrl: options.url,
      baseUrl: API_BASE_URL,
      method: options.method ?? "GET",
      hasToken: Boolean(token),
      header: {
        ...header,
        Authorization: header.Authorization ? "Bearer ***" : undefined,
      },
    });
  }
  if (!isAbsoluteHttpUrl(requestUrl)) {
    console.error("[http] invalid request url", {
      rawUrl: options.url,
      baseUrl: API_BASE_URL,
      requestUrl,
    });
    return Promise.reject(new TypeError(`请求地址无效: ${requestUrl}`));
  }
  if (/^http:\/\//i.test(requestUrl)) {
    console.warn("[http] insecure request url", {
      requestUrl,
      message: "小程序环境下 http 地址可能被平台拦截，导致后端无请求记录",
    });
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: requestUrl,
      method: options.method ?? "GET",
      data: options.data as string | Record<string, unknown> | ArrayBuffer | undefined,
      header,
      success: (response: UniApp.RequestSuccessCallbackResult) => {
        const statusCode = response.statusCode;
        if (IS_DEV) {
          console.warn("[http] response", {
            url: requestUrl,
            method: options.method ?? "GET",
            statusCode,
          });
        }
        if (statusCode < 200 || statusCode >= 300) {
          reject(new TypeError(`请求失败(${statusCode})`));
          return;
        }
        try {
          resolve(parseResponseData<T>(response.data, options.successCodes ?? [0, 200]));
        } catch (error) {
          reject(error instanceof TypeError ? error : new TypeError("响应数据解析失败"));
        }
      },
      fail: (error) => {
        if (IS_DEV) {
          console.warn("[http] fail", {
            url: requestUrl,
            method: options.method ?? "GET",
            message: error.errMsg || "网络异常",
          });
        }
        reject(new TypeError(error.errMsg || "网络异常"));
      },
      complete: (response) => {
        if (IS_DEV) {
          const completeResult = response as UniApp.RequestSuccessCallbackResult & UniApp.GeneralCallbackResult;
          console.warn("[http] complete", {
            url: requestUrl,
            method: options.method ?? "GET",
            statusCode: "statusCode" in completeResult ? completeResult.statusCode : undefined,
            errMsg: completeResult.errMsg,
          });
        }
      },
    });
  });
};

const http = {
  request: <T>(options: RequestOptions) => request<T>(options),
  get: <T>(url: string, params?: Record<string, unknown>, options?: Omit<RequestOptions, "url" | "method" | "data">) =>
    request<T>({
      url,
      method: "GET",
      data: params,
      ...options,
    }),
  post: <T>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "url" | "method" | "data">,
  ) =>
    request<T>({
      url,
      method: "POST",
      data,
      ...options,
    }),
  put: <T>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "url" | "method" | "data">,
  ) =>
    request<T>({
      url,
      method: "PUT",
      data,
      ...options,
    }),
  delete: <T>(
    url: string,
    params?: Record<string, unknown>,
    options?: Omit<RequestOptions, "url" | "method" | "data">,
  ) =>
    request<T>({
      url,
      method: "DELETE",
      data: params,
      ...options,
    }),
};

export default http;
