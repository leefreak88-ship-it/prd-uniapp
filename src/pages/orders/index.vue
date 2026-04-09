<script setup lang="ts">
import { onPullDownRefresh } from "@dcloudio/uni-app";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import AppTabBar from "@/components/AppTabBar.vue";
import { orderApi } from "@/api/order";
import type { OrderDto } from "@/api/order/types";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const isLogin = computed(() => authStore.isLogin);
const currentTabPath = "/pages/orders/index";

const orderQuery = useQuery({
  queryKey: ["orderList"],
  queryFn: async () => {
    const response = await orderApi.orderList({
      pagination: { current: 1, pageSize: 100 },
    });
    return (response.result ?? []).map(mapOrder);
  },
  enabled: isLogin,
});

const orderList = computed(() => orderQuery.data.value ?? []);
const loading = computed(() => orderQuery.isLoading.value);

function mapOrder(item: OrderDto) {
  return {
    id: item.id ?? "",
    goodsId: item.goodsId ?? "",
    price: item.orderPrice ?? 0,
    chatHandsName: item.chatHandsInfo?.chatHandsName ?? "",
    shareModelName: item.shareModelInfo?.shareModelName ?? "",
    createdAt: item.createTime ? new Date(item.createTime).toLocaleString() : "",
  };
}

onPullDownRefresh(async () => {
  await orderQuery.refetch();
  uni.stopPullDownRefresh();
});

const gotoLogin = () => {
  uni.navigateTo({
    url: `/pages/login/index?redirect=${encodeURIComponent(currentTabPath)}`,
  });
};
</script>

<template>
  <view class="page">
    <view v-if="!isLogin" class="login-card">
      <text class="login-title">请先登录后查看订单</text>
      <wd-button type="primary" @click="gotoLogin">去登录</wd-button>
    </view>
    <view v-else-if="loading" class="empty">加载中...</view>
    <view v-else-if="orderList.length === 0" class="empty">暂无订单，去首页选购吧</view>
    <view v-else class="list">
      <view v-for="item in orderList" :key="item.id" class="card">
        <view class="row">
          <text class="name">{{ item.shareModelName || item.goodsId }}</text>
          <text class="price">¥{{ item.price }}</text>
        </view>
        <text v-if="item.chatHandsName" class="line">经手人：{{ item.chatHandsName }}</text>
        <text class="line">下单时间：{{ item.createdAt }}</text>
      </view>
    </view>
    <AppTabBar :current-path="currentTabPath" />
  </view>
</template>

<style scoped lang="scss">
.page {
  padding: 24rpx;
  padding-bottom: calc(132rpx + env(safe-area-inset-bottom));
}

.empty {
  margin-top: 200rpx;
  text-align: center;
  color: #8b949e;
}

.login-card {
  margin-top: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.login-title {
  color: #646a73;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.card {
  background: #fff;
  border-radius: 18rpx;
  padding: 24rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
}

.price {
  color: #ee0a24;
  font-size: 34rpx;
  font-weight: 700;
}

.line {
  display: block;
  color: #646a73;
  margin-top: 8rpx;
  font-size: 24rpx;
}
</style>
