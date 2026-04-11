<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { shareApi } from "@/api/share";
import type { ShareListResp } from "@/api/share/types";

// 路由参数：由首页「分享代付」跳转时带入
const productId = ref("");
const productName = ref("");
const price = ref(0);

onLoad((options) => {
  const opts = options || {};
  productId.value = decodeURIComponent(opts.productId || "");
  productName.value = decodeURIComponent(opts.productName || "");
  price.value = Number(opts.price || 0);
});

const shareQuery = useQuery({
  queryKey: ["shareModelList"],
  queryFn: async () => {
    const response = await shareApi.shareList({
      pagination: { current: 1, pageSize: 100 },
    });
    return response.result ?? [];
  },
});

const shareModels = computed<ShareListResp[]>(() => shareQuery.data.value ?? []);
const loading = computed(() => shareQuery.isLoading.value);
const errorMessage = computed(() =>
  shareQuery.error.value instanceof Error ? shareQuery.error.value.message : "",
);

const goodsCount = 1; // 当前流程仅支持单件下单
const totalAmount = computed(() => price.value.toFixed(2));

const handleSelect = (model: ShareListResp) => {
  if (!productId.value) {
    uni.showToast({ title: "商品信息缺失", icon: "none" });
    return;
  }
  if (!model.id) {
    return;
  }
  uni.navigateTo({
    url:
      `/pages/share/preview/index` +
      `?productId=${encodeURIComponent(productId.value)}` +
      `&productName=${encodeURIComponent(productName.value)}` +
      `&price=${price.value}` +
      `&shareModelId=${encodeURIComponent(model.id)}` +
      `&shareModelName=${encodeURIComponent(model.shareModelName || "")}`,
  });
};
</script>

<template>
  <view class="page">
    <view class="amount-card">
      <text class="amount-label">订单总金额</text>
      <text class="amount-value">¥{{ totalAmount }}</text>
      <text class="amount-count">(共 {{ goodsCount }} 件商品)</text>
    </view>

    <view v-if="loading" class="placeholder">加载中...</view>
    <view v-else-if="errorMessage" class="placeholder">{{ errorMessage }}</view>
    <view v-else-if="shareModels.length === 0" class="placeholder">暂无可用分享方式</view>

    <view v-else class="grid">
      <view
        v-for="model in shareModels"
        :key="model.id"
        class="grid-item"
        @click="handleSelect(model)"
      >
        <image
          v-if="model.shareModelImage1"
          :src="model.shareModelImage1"
          class="grid-icon"
          mode="aspectFit"
        />
        <text class="grid-name">{{ model.shareModelName }}</text>
        <text class="grid-title">{{ model.shareModelTitle }}</text>
        <text class="grid-action">点击使用</text>
      </view>
    </view>

    <view class="footer-tip">
      <text>请选择代付风格</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f7f8fa;
}

.amount-card {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
}

.amount-label {
  color: #1f2329;
  font-size: 26rpx;
  font-weight: 600;
}

.amount-value {
  color: #ee0a24;
  font-size: 40rpx;
  font-weight: 700;
}

.amount-count {
  color: #8b949e;
  font-size: 22rpx;
}

.placeholder {
  text-align: center;
  color: #8b949e;
  padding: 80rpx 0;
  font-size: 26rpx;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.grid-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.grid-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
}

.grid-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
}

.grid-title {
  font-size: 22rpx;
  color: #646a73;
}

.grid-action {
  font-size: 22rpx;
  color: #1989fa;
  margin-top: 6rpx;
}

.footer-tip {
  margin-top: 36rpx;
  padding: 24rpx;
  text-align: center;
  color: #ffffff;
  background: #1a3a3a;
  border-radius: 16rpx;
  font-size: 26rpx;
}
</style>
