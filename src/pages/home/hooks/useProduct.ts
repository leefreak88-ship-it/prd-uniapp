import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { goodsApi } from "@/api/goods";
import type { ProductListReq, ProductListResp } from "@/api/goods/types";
import type { Product } from "@/api/types";
import { useShopStore } from "@/stores/shop";

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

const buildPayload = (categoryId: string): ProductListReq => {
  if (!categoryId) {
    return {
      pagination: {
        current: 1,
        pageSize: 100,
      },
    };
  }
  return {
    pageType: "goods_type_id",
    id: categoryId,
    pagination: {
      current: 1,
      pageSize: 100,
    },
  };
};

export const useProduct = () => {
  const shopStore = useShopStore();
  const activeCategoryId = computed(() => shopStore.activeCategoryId);

  const productQuery = useQuery<Product[]>({
    // queryKey 包含 categoryId，切换分类时自动请求新数据，相同分类直接用缓存
    queryKey: computed(() => ["productList", activeCategoryId.value]),
    queryFn: async () => {
      const response = await goodsApi.productList(buildPayload(activeCategoryId.value));
      return (response.result ?? []).map(mapProduct);
    },
    // categoryId 为空时不请求
    enabled: computed(() => !!activeCategoryId.value),
  });

  const products = computed(() => productQuery.data.value ?? []);
  const loading = computed(() => productQuery.isLoading.value || productQuery.isFetching.value);
  const loaded = computed(() => productQuery.isFetched.value);
  const errorMessage = computed(() => {
    if (!productQuery.error.value) {
      return "";
    }
    return productQuery.error.value instanceof Error ? productQuery.error.value.message : "商品加载失败";
  });

  const loadProducts = async (categoryId?: string) => {
    if (categoryId && categoryId !== activeCategoryId.value) {
      // 改变 activeCategoryId → queryKey 变化 → TanStack 自动 fetch
      shopStore.setActiveCategory(categoryId);
    }
    // 已有缓存数据，直接返回，不重复请求
    if (products.value.length > 0) {
      return products.value;
    }
    // 首次加载，需要等待请求完成
    const result = await productQuery.refetch();
    return result.data ?? [];
  };

  return {
    products,
    loading,
    loaded,
    errorMessage,
    activeCategoryId,
    loadProducts,
  };
};
