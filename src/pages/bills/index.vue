<script setup lang="ts">
import { onPullDownRefresh } from "@dcloudio/uni-app";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import AppTabBar from "@/components/AppTabBar.vue";
import { billApi } from "@/api/bills";
import type { BillDto } from "@/api/bills/types";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const isLogin = computed(() => authStore.isLogin);
const currentTabPath = "/pages/bills/index";

const billQuery = useQuery({
  queryKey: ["billList"],
  queryFn: async () => {
    const response = await billApi.billList({
      pagination: { current: 1, pageSize: 100 },
    });
    return (response.result ?? []).map(mapBill);
  },
  enabled: isLogin,
});

const billList = computed(() => billQuery.data.value ?? []);
const loading = computed(() => billQuery.isLoading.value);

function mapBill(item: BillDto) {
  return {
    id: item.id ?? "",
    orderId: item.orderId ?? "",
    price: item.orderInfo?.orderPrice ?? 0,
    createdAt: item.createTime ? new Date(item.createTime).toLocaleString() : "",
  };
}

onPullDownRefresh(async () => {
  await billQuery.refetch();
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
    <view class="tips">账单可作为已购买凭证，关联订单用于核验客户是否已完成支付。</view>
    <view v-if="!isLogin" class="login-card">
      <text class="login-title">请先登录后查看账单</text>
      <wd-button type="primary" @click="gotoLogin">去登录</wd-button>
    </view>
    <view v-else-if="loading" class="empty">加载中...</view>
    <view v-else-if="billList.length === 0" class="empty">暂无账单</view>
    <view v-else class="list">
      <view v-for="item in billList" :key="item.id" class="card">
        <view class="row">
          <text class="title">账单号：{{ item.id }}</text>
          <wd-tag type="success">已入账</wd-tag>
        </view>
        <text class="line">订单号：{{ item.orderId }}</text>
        <text class="line">账单时间：{{ item.createdAt }}</text>
        <text class="amount">¥{{ item.price }}</text>
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

.tips {
  background: #e8f3ff;
  color: #1864ab;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  margin-bottom: 20rpx;
}

.empty {
  margin-top: 180rpx;
  text-align: center;
  color: #8b949e;
}

.login-card {
  margin-top: 180rpx;
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

.title {
  font-size: 28rpx;
  font-weight: 600;
}

.line {
  display: block;
  color: #646a73;
  margin-top: 8rpx;
  font-size: 24rpx;
}

.amount {
  display: block;
  margin-top: 14rpx;
  color: #ee0a24;
  font-size: 34rpx;
  font-weight: 700;
}
</style>
