/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-02 21:49:58
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-07 15:21:45
 * @FilePath: \pd_uniapp\src\api\bills\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import http from "@/utils/request";
import { categoryApi } from "@/api/category";
import type { ProductListReq, ProductListResp } from "./types";
import type { Category, Product } from "@/api/types";
import type { PaginationResp } from "../types";

export const goodsApi = {
  productList: async (payload: ProductListReq): Promise<PaginationResp<ProductListResp>> => {
    return http.post("/app/goodsInfo/page", payload);
  },
};

const mapCategory = (item: { id?: string; goodsTypeName?: string }): Category => {
  return {
    id: item.id || "",
    name: item.goodsTypeName || "",
  };
};

const mapProduct = (item: ProductListResp): Product => {
  return {
    id: item.id || "",
    categoryId: item.goodsTypeId || "",
    name: item.goodsName || "",
    price: item.goodsPrice ?? 0,
    desc: item.goodsName || "",
    stock: 0,
    goodsImage: item.goodsImage || "",
  };
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await categoryApi.categoryList({
    pagination: {
      current: 1,
      pageSize: 100,
    },
    params: {},
  });
  return (response.result ?? []).map(mapCategory);
};

export const getProducts = async (categoryId?: string): Promise<Product[]> => {
  const payload: ProductListReq = categoryId
    ? {
        pageType: "goods_type_id",
        pagination: {
          current: 1,
          pageSize: 100,
        },
        params: {
          goodsTypeId: categoryId,
        },
      }
    : {
        pagination: {
          current: 1,
          pageSize: 100,
        },
        params: {},
      };
  const response = await goodsApi.productList(payload);
  return (response.result ?? []).map(mapProduct);
};

export const getProductById = async (productId: string): Promise<Product> => {
  const allProducts = await getProducts();
  const targetProduct = allProducts.find((item) => item.id === productId);
  if (!targetProduct) {
    throw new TypeError("商品不存在");
  }
  return targetProduct;
};
