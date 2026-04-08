/*
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-07 14:54:14
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-07 18:58:28
 * @FilePath: \pd_uniapp\src\pages\home\hook\useCategory.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useInfiniteQuery } from "@tanstack/vue-query";
import { computed, onMounted, watch } from "vue";
import { categoryApi } from "@/api/category";
import type { CategoryListReq, CategoryListResp } from "@/api/category/types";
import type { Category, PaginationResp } from "@/api/types";
import { useShopStore } from "@/stores/shop";

const PAGE_SIZE = 10;
const LOG_PREFIX = "[home/useCategory]";

const mapCategory = (item: CategoryListResp): Category => {
  return {
    id: item.id || "",
    name: item.goodsTypeName || "",
  };
};

const buildPayload = (page: number): CategoryListReq => {
  return {
    pagination: {
      current: page,
      pageSize: PAGE_SIZE,
    },
    params: {},
  };
};

const mergePages = (pages: PaginationResp<CategoryListResp>[]) => {
  return pages.flatMap((page) => (page.result ?? []).map(mapCategory)).filter((item) => !!item.id);
};

export const shouldStartCategoryBootstrap = (params: {
  bootstrapFetchStarted: boolean;
  isFetching: boolean;
  isFetched: boolean;
}) => {
  return !(params.bootstrapFetchStarted || params.isFetching || params.isFetched);
};

export const useCategory = () => {
  console.warn(`${LOG_PREFIX} setup start`, {
    timestamp: Date.now(),
  });
  const shopStore = useShopStore();
  const activeCategoryId = computed(() => shopStore.activeCategoryId);
  let bootstrapFetchStarted = false;

  console.warn(`${LOG_PREFIX} AbortController check`, {
    available: typeof AbortController,
    isFunction: typeof AbortController === "function",
  });

  const categoryQuery = useInfiniteQuery<PaginationResp<CategoryListResp>>({
    queryKey: ["categoryList"],
    queryFn: async ({ pageParam = 1 }) => {
      const payload = buildPayload(pageParam as number);
      console.warn(`${LOG_PREFIX} queryFn triggered`, {
        pageParam,
        payload,
        timestamp: Date.now(),
      });
      const response = await categoryApi.categoryList(payload);
      console.warn(`${LOG_PREFIX} queryFn resolved`, {
        page: response.current,
        size: response.size,
        total: response.total,
        resultCount: response.result?.length ?? 0,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = lastPage.current ?? allPages.length;
      const pageSize = lastPage.size ?? PAGE_SIZE;
      const currentPageCount = lastPage.result?.length ?? 0;
      const loadedCount = allPages.reduce((sum, page) => sum + (page.result?.length ?? 0), 0);
      const total = lastPage.total ?? 0;
      if (total > 0 && loadedCount >= total) {
        return undefined;
      }
      if (currentPageCount < pageSize) {
        return undefined;
      }
      return currentPage + 1;
    },
    enabled: true,
  });

  watch(
    [
      () => categoryQuery.status.value,
      () => categoryQuery.fetchStatus.value,
      () => categoryQuery.isFetching.value,
      () => categoryQuery.isFetched.value,
      () => categoryQuery.error.value,
    ],
    ([status, fetchStatus, isFetching, isFetched, error]) => {
      console.warn(`${LOG_PREFIX} query state changed`, {
        status,
        fetchStatus,
        isFetching,
        isFetched,
        hasError: Boolean(error),
        errorMessage: error instanceof Error ? error.message : "",
      });
    },
    { immediate: true },
  );

  console.warn(`${LOG_PREFIX} query created`, {
    status: categoryQuery.status.value,
    fetchStatus: categoryQuery.fetchStatus.value,
    isFetching: categoryQuery.isFetching.value,
    isFetched: categoryQuery.isFetched.value,
  });
  const categories = computed(() => {
    return mergePages(categoryQuery.data.value?.pages ?? []);
  });
  const loading = computed(() => categoryQuery.isLoading.value);
  const isFetchingNextPage = computed(() => categoryQuery.isFetchingNextPage.value);
  const hasNextPage = computed(() => !!categoryQuery.hasNextPage.value);
  const loaded = computed(() => categoryQuery.isFetched.value);
  const errorMessage = computed(() => {
    if (!categoryQuery.error.value) {
      return "";
    }
    return categoryQuery.error.value instanceof Error
      ? categoryQuery.error.value.message
      : "分类加载失败";
  });

  const setActiveCategory = (categoryId: string) => {
    console.warn(`${LOG_PREFIX} setActiveCategory`, {
      categoryId,
      previous: activeCategoryId.value,
    });
    shopStore.setActiveCategory(categoryId);
  };

  const syncActiveCategory = (list: Category[]) => {
    if (!list.length) {
      setActiveCategory("");
      return;
    }
    const hasCurrentActive = list.some((item) => item.id === activeCategoryId.value);
    if (!hasCurrentActive) {
      setActiveCategory(list[0]!.id);
    }
  };

  const loadCategories = async () => {
    console.warn(`${LOG_PREFIX} loadCategories start`, {
      isFetching: categoryQuery.isFetching.value,
      isFetched: categoryQuery.isFetched.value,
      categories: categories.value.length,
      timestamp: Date.now(),
    });

    try {
      // If data is already cached and not stale, use it directly instead of refetching
      if (categoryQuery.isFetched.value && categories.value.length > 0) {
        console.warn(`${LOG_PREFIX} loadCategories using cached data`, {
          count: categories.value.length,
        });
        syncActiveCategory(categories.value);
        return categories.value;
      }

      const response = await categoryQuery.refetch();
      const list = mergePages(response.data?.pages ?? []);
      console.warn(`${LOG_PREFIX} loadCategories refetch done`, {
        resultCount: list.length,
        status: response.status,
      });
      syncActiveCategory(list);
      return list;
    } catch (error) {
      console.error(`${LOG_PREFIX} loadCategories failed`, error);
      throw error;
    }
  };

  const loadNextCategories = async () => {
    console.warn(`${LOG_PREFIX} loadNextCategories start`, {
      hasNextPage: hasNextPage.value,
      isFetchingNextPage: isFetchingNextPage.value,
    });
    if (!hasNextPage.value || isFetchingNextPage.value) {
      return categories.value;
    }
    const response = await categoryQuery.fetchNextPage();
    return mergePages(response.data?.pages ?? []);
  };

  const ensureBootstrapFetch = async (source: string) => {
    if (
      !shouldStartCategoryBootstrap({
        bootstrapFetchStarted,
        isFetching: categoryQuery.isFetching.value,
        isFetched: categoryQuery.isFetched.value,
      })
    ) {
      console.warn(`${LOG_PREFIX} bootstrap skipped`, {
        source,
        reason: bootstrapFetchStarted ? "already-started" : "query-already-active-or-fetched",
        isFetching: categoryQuery.isFetching.value,
        isFetched: categoryQuery.isFetched.value,
      });
      return;
    }
    bootstrapFetchStarted = true;
    console.warn(`${LOG_PREFIX} bootstrap fetch start`, {
      source,
    });
    try {
      await loadCategories();
    } catch (error) {
      console.error(`${LOG_PREFIX} bootstrap fetch failed`, error);
    }
  };

  onMounted(() => {
    console.warn(`${LOG_PREFIX} onMounted`, {
      timestamp: Date.now(),
    });
    void ensureBootstrapFetch("onMounted");
  });

  return {
    categories,
    loading,
    isFetchingNextPage,
    hasNextPage,
    loaded,
    errorMessage,
    activeCategoryId,
    loadCategories,
    loadNextCategories,
    setActiveCategory,
  };
};
