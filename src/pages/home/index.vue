<script setup lang="ts">
import { onLoad, onShow } from "@dcloudio/uni-app";
import { computed, ref } from "vue";
import AppTabBar from "@/components/AppTabBar.vue";
import ProductCard from "@/components/ProductCard.vue";
import { useAuthStore } from "@/stores/auth";
import { useShopStore } from "@/stores/shop";
import type { Product } from "@/api/types";
import { useCategory } from "./hooks/useCategory";
import { useProduct } from "./hooks/useProduct";

const currentTabPath = "/pages/home/index";

const authStore = useAuthStore();
const shopStore = useShopStore();

authStore.restoreState();
shopStore.initShop();

const {
  categories,
  loading: categoryLoading,
  isFetchingNextPage: categoryFetchingNextPage,
  errorMessage: categoryErrorMessage,
  activeCategoryId,
  loadCategories,
  setActiveCategory,
} = useCategory();
const {
  products,
  loading: productLoading,
  errorMessage: productErrorMessage,
  loadProducts,
} = useProduct();

const payPopupVisible = ref(false);
const currentOrderId = ref("");
const currentProduct = ref<Product | null>(null);
const initializing = ref(false);

const categoryList = computed(() => categories.value);
const productList = computed(() => products.value);
const user = computed(() => authStore.user);
const isLogin = computed(() => authStore.isLogin);
const homeLoading = computed(() => {
  return (
    categoryList.value.length <= 0 &&
    (categoryLoading.value || categoryFetchingNextPage.value || productLoading.value)
  );
});
const homeErrorMessage = computed(() => categoryErrorMessage.value || productErrorMessage.value);

const initializeHomeData = async (source: string) => {
  if (initializing.value) {
    return;
  }
  initializing.value = true;
  try {
    const currentCategories = await loadCategories();
    if (!currentCategories.length) {
      return;
    }
    const targetCategoryId = activeCategoryId.value;
    if (!targetCategoryId) {
      return;
    }
    setActiveCategory(targetCategoryId);
    await loadProducts(targetCategoryId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "分类加载失败";
    uni.showToast({
      title: message,
      icon: "none",
    });
  } finally {
    initializing.value = false;
  }
};

const handleSelectCategory = (categoryId: string) => {
  setActiveCategory(categoryId);
  // 不需要手动调 loadProducts —— queryKey 包含 activeCategoryId，
  // setActiveCategory 改变后 queryKey 自动变化，TanStack Query 自动处理：
  // - 没缓存 → 自动 fetch
  // - 有缓存且未过期(staleTime 10分钟) → 直接用缓存，不发请求
};

const submitOrder = async (productId: string) => {
  const currentUser = user.value;
  if (!currentUser) {
    throw new Error("请先登录");
  }
  // const order = await createOrder(productId, currentUser.id);
  // shopStore.orders.unshift(order);
  // shopStore.saveState();
  // return order;
};

const confirmPay = async (orderId: string) => {
  const currentUser = user.value;
  if (!currentUser) {
    throw new Error("请先登录");
  }
  const targetOrder = shopStore.orders.find((item) => item.id === orderId);
  if (!targetOrder || targetOrder.userId !== currentUser.id || targetOrder.status === "paid") {
    return;
  }
  // const { paidOrder, bill } = await payOrder(targetOrder);
    // shopStore.orders = shopStore.orders.map((item) => (item.id === orderId ? paidOrder : item));
    // shopStore.bills.unshift(bill);
  // shopStore.saveState();
};

const hasPurchased = (productId: string) => {
  const currentUser = user.value;
  if (!currentUser) {
    return false;
  }
  return shopStore.hasPurchased(productId, currentUser.id);
};

const handleBuy = async (productId: string) => {
  const target = productList.value.find((item) => item.id === productId) ?? null;
  if (!target) {
    return;
  }
  try {
    const order = await submitOrder(productId);
    // currentOrderId.value = order.id;
    currentProduct.value = target;
    payPopupVisible.value = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "下单失败";
    uni.showToast({
      title: message,
      icon: "none",
    });
    if (!isLogin.value) {
      uni.navigateTo({
        url: `/pages/login/index?redirect=${encodeURIComponent(currentTabPath)}`,
      });
    }
  }
};

const handlePaySuccess = async () => {
  if (!currentOrderId.value) {
    return;
  }
  try {
    await confirmPay(currentOrderId.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "支付失败";
    uni.showToast({
      title: message,
      icon: "none",
    });
    return;
  }
  payPopupVisible.value = false;
  uni.showToast({
    title: "支付成功，账单已生成",
    icon: "none",
  });
  currentOrderId.value = "";
  currentProduct.value = null;
};

const handleGotoLogin = () => {
  uni.navigateTo({
    url: `/pages/login/index?redirect=${encodeURIComponent(currentTabPath)}`,
  });
};

const handleLogout = () => {
  const authStore = useAuthStore();
  authStore.logout();
  uni.showToast({
    title: "已退出登录",
    icon: "none",
  });
};

onLoad(() => {
  void initializeHomeData("onLoad");
});

onShow(() => {
  if (!categoryList.value.length && !productList.value.length) {
    void initializeHomeData("onShow-empty-list");
    return;
  }
  if (activeCategoryId.value && !productList.value.length) {
    void loadProducts(activeCategoryId.value);
  }
});
</script>

<template>
  <view class="page">
    <view class="layout">
      <scroll-view scroll-y class="category-panel">
        <view v-if="homeLoading && categoryList.length === 0" class="category-placeholder">分类加载中</view>
        <view v-else-if="categoryList.length === 0" class="category-placeholder">
          {{ homeErrorMessage || "暂无商品" }}
        </view>
        <view
          v-for="item in categoryList"
          :key="item.id"
          class="category-item"
          :class="{ active: item.id === activeCategoryId }"
          @click="handleSelectCategory(item.id)"
        >
          {{ item.name }}
        </view>
      </scroll-view>

      <scroll-view scroll-y class="product-panel">
        <view class="header">
          <view class="header-top">
            <text class="title">商品列表</text>
            <wd-button
              v-if="isLogin"
              plain
              size="small"
              type="warning"
              @click="handleLogout"
            >
              退出登录
            </wd-button>
            <wd-button v-else plain size="small" type="primary" @click="handleGotoLogin">
              登录
            </wd-button>
          </view>
        </view>
        <view class="product-list">
          <view v-if="homeLoading && productList.length === 0" class="product-placeholder">商品加载中</view>
          <view v-else-if="productList.length === 0" class="product-placeholder">
            {{ homeErrorMessage || "暂无商品" }}
          </view>
          <ProductCard
            v-for="item in productList"
            :key="item.id"
            :product="item"
            :purchased="hasPurchased(item.id)"
            @buy="handleBuy"
          />
        </view>
      </scroll-view>
    </view>

    <wd-popup v-model="payPopupVisible" position="bottom" :z-index="100">
      <view class="pay-popup">
        <text class="popup-title">确认支付</text>
        <text v-if="currentProduct" class="popup-text">
          商品：{{ currentProduct.name }}，金额：¥{{ currentProduct.price }}
        </text>
        <view class="popup-actions">
          <wd-button plain @click="payPopupVisible = false">稍后支付</wd-button>
          <wd-button type="primary" @click="handlePaySuccess">支付成功</wd-button>
        </view>
      </view>
    </wd-popup>
    <AppTabBar :current-path="currentTabPath" />
  </view>
</template>

<style scoped lang="scss">
.page {
  height: calc(100vh - var(--window-top));
}

.layout {
  display: flex;
  height: calc(100% - 108rpx - env(safe-area-inset-bottom));
}

.category-panel {
  width: 200rpx;
  height: 100%;
  background: #ffffff;
  border-right: 1rpx solid #ebeef5;
}

.category-item {
  padding: 28rpx 16rpx;
  text-align: center;
  color: #646a73;
  font-size: 26rpx;
}

.category-item.active {
  color: #1989fa;
  font-weight: 600;
  background: #f0f7ff;
}

.category-placeholder {
  padding: 32rpx 16rpx;
  text-align: center;
  color: #8b949e;
  font-size: 24rpx;
}

.product-panel {
  flex: 1;
  height: 100%;
  padding: 24rpx;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-bottom: 20rpx;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding-bottom: 40rpx;
}

.product-placeholder {
  padding: 80rpx 0;
  text-align: center;
  color: #8b949e;
  font-size: 26rpx;
}

.pay-popup {
  padding: 36rpx 28rpx 40rpx;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.popup-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.popup-text {
  color: #646a73;
  font-size: 26rpx;
}

.popup-actions {
  margin-top: 28rpx;
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}
</style>
