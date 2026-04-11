<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { computed, ref } from "vue";
import { billApi } from "@/api/bills";
import { orderApi } from "@/api/order";
import type { OrderDto } from "@/api/order/types";

const orderId = ref("");
const order = ref<OrderDto | null>(null);
const loading = ref(false);
const loadError = ref("");
const paying = ref(false);
const paid = ref(false);

const remainSeconds = ref(15 * 60);
let timerId: ReturnType<typeof setInterval> | null = null;

const amount = computed(() => (order.value?.orderPrice ?? 0).toFixed(2));
const shareModelName = computed(() => order.value?.shareModelInfo?.shareModelName ?? "代付");
const chatHandsName = computed(() => order.value?.chatHandsInfo?.chatHandsName ?? "发起人");

const minutes = computed(() => String(Math.floor(remainSeconds.value / 60)).padStart(2, "0"));
const seconds = computed(() => String(remainSeconds.value % 60).padStart(2, "0"));

const startCountdown = () => {
  if (timerId) {
    clearInterval(timerId);
  }
  timerId = setInterval(() => {
    if (remainSeconds.value <= 0) {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      return;
    }
    remainSeconds.value -= 1;
  }, 1000);
};

const loadOrder = async () => {
  if (!orderId.value) {
    loadError.value = "订单 id 缺失";
    return;
  }
  loading.value = true;
  loadError.value = "";
  try {
    const result = await orderApi.getOrderById(orderId.value);
    order.value = result;
    startCountdown();
  } catch (error) {
    const message = error instanceof Error ? error.message : "订单加载失败";
    loadError.value = message;
    uni.showToast({ title: message, icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 生成账单：记录订单 id、聊手 id 与成交金额
const generateBill = async () => {
  const current = order.value;
  if (!current || !current.id) {
    return;
  }
  try {
    await billApi.createBill({
      orderId: current.id,
      chatHandsId: current.chatHandsId ?? "",
      orderPrice: current.orderPrice ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "账单生成失败";
    uni.showToast({ title: message, icon: "none" });
  }
};

const handlePay = () => {
  if (!order.value || paying.value || paid.value) {
    return;
  }
  paying.value = true;
  // TODO: 接入微信小程序支付 uni.requestPayment，此处先模拟输入密码 → 支付成功
  uni.showModal({
    title: "代付确认",
    content: `确认为 ${chatHandsName.value} 支付 ¥${amount.value} 吗？`,
    confirmText: "输入密码",
    success: async ({ confirm }) => {
      if (!confirm) {
        paying.value = false;
        return;
      }
      // 支付成功后：调用账单生成接口
      await generateBill();
      paid.value = true;
      paying.value = false;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      uni.showToast({ title: "支付成功", icon: "success" });
    },
    fail: () => {
      paying.value = false;
    },
  });
};

onLoad((options) => {
  orderId.value = decodeURIComponent(options?.orderId || "");
  void loadOrder();
});
</script>

<template>
  <view class="page">
    <view v-if="loading" class="placeholder">订单加载中...</view>
    <view v-else-if="loadError" class="placeholder error">{{ loadError }}</view>

    <template v-else>
      <view class="card">
        <view class="user-row">
          <view class="avatar"></view>
          <view class="user-info">
            <text class="name">{{ chatHandsName }}</text>
            <text class="slogan">Hi~你和我的距离只差一顿{{ shareModelName }}~</text>
          </view>
        </view>

        <text class="need-label">需付款</text>
        <text class="amount">¥{{ amount }}</text>

        <view class="countdown-row">
          <text class="countdown-label">支付剩余时间</text>
          <text class="countdown-cell">{{ minutes.charAt(0) }}</text>
          <text class="countdown-cell">{{ minutes.charAt(1) }}</text>
          <text class="countdown-sep">:</text>
          <text class="countdown-cell">{{ seconds.charAt(0) }}</text>
          <text class="countdown-cell">{{ seconds.charAt(1) }}</text>
        </view>

        <view class="notice">
          <text class="notice-title">付款须知</text>
          <text class="notice-line">1.代付订单创建后 15 分钟内未付款，订单会自动取消，可以重新下单</text>
          <text class="notice-line">2.如发生退款，实付金额将原路退还代付人</text>
        </view>

        <button
          v-if="!paid"
          class="pay-btn"
          :disabled="paying"
          @click="handlePay"
        >
          {{ paying ? "支付中..." : "为好友买单" }}
        </button>
        <view v-else class="paid-tip">已完成代付</view>
      </view>

      <view class="goods-card">
        <text class="goods-title">{{ shareModelName }}</text>
        <view class="goods-row">
          <view class="goods-thumb"></view>
          <view class="goods-info">
            <text class="goods-name">{{ order?.goodsId }}</text>
            <text class="goods-meta">x1</text>
          </view>
          <text class="goods-price">¥{{ amount }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f2f3f5;
}

.placeholder {
  text-align: center;
  color: #8b949e;
  padding: 120rpx 0;
  font-size: 26rpx;
}

.placeholder.error {
  color: #ee0a24;
}

.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx 28rpx 36rpx;
  margin-bottom: 24rpx;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #d9d9d9;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.slogan {
  font-size: 24rpx;
  color: #646a73;
}

.need-label {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #1f2329;
  font-weight: 600;
  margin-top: 12rpx;
}

.amount {
  display: block;
  text-align: center;
  font-size: 80rpx;
  font-weight: 700;
  color: #1f2329;
  margin: 12rpx 0 20rpx;
}

.countdown-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  margin-bottom: 32rpx;
}

.countdown-label {
  color: #646a73;
  font-size: 24rpx;
  margin-right: 10rpx;
}

.countdown-cell {
  display: inline-block;
  background: #1f2329;
  color: #ffffff;
  width: 34rpx;
  height: 44rpx;
  border-radius: 6rpx;
  text-align: center;
  line-height: 44rpx;
  font-size: 24rpx;
}

.countdown-sep {
  color: #1f2329;
  font-weight: 700;
}

.notice {
  background: #fff8e5;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 32rpx;
}

.notice-title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #8a6d3b;
  margin-bottom: 10rpx;
}

.notice-line {
  display: block;
  font-size: 22rpx;
  color: #8a6d3b;
  line-height: 1.6;
}

.pay-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #ffcc00;
  color: #1f2329;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
}

.paid-tip {
  text-align: center;
  color: #07c160;
  font-size: 28rpx;
  font-weight: 600;
  padding: 24rpx 0;
}

.goods-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
}

.goods-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 20rpx;
}

.goods-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.goods-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 14rpx;
  background: #f1f3f5;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goods-name {
  font-size: 28rpx;
  color: #1f2329;
  font-weight: 500;
}

.goods-meta {
  font-size: 22rpx;
  color: #8b949e;
}

.goods-price {
  color: #1f2329;
  font-weight: 700;
  font-size: 30rpx;
}
</style>
