<script setup lang="ts">
import { onLoad, onShareAppMessage, onUnload } from "@dcloudio/uni-app";
import { computed, onMounted, ref } from "vue";
import { orderApi } from "@/api/order";
import { useAuthStore } from "@/stores/auth";

const PAY_EXPIRE_SECONDS = 15 * 60;

const authStore = useAuthStore();
const user = computed(() => authStore.user);

// 路由参数
const productId = ref("");
const productName = ref("");
const price = ref(0);
const shareModelId = ref("");
const shareModelName = ref("");

// 订单 & 倒计时
const orderId = ref("");
const creating = ref(false);
const createError = ref("");
const remainSeconds = ref(PAY_EXPIRE_SECONDS);
let timerId: ReturnType<typeof setInterval> | null = null;

const minutes = computed(() => {
  return String(Math.floor(remainSeconds.value / 60)).padStart(2, "0");
});
const seconds = computed(() => {
  return String(remainSeconds.value % 60).padStart(2, "0");
});

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

const createOrder = async () => {
  if (!productId.value || !shareModelId.value) {
    createError.value = "参数缺失";
    return;
  }
  if (creating.value) {
    return;
  }
  creating.value = true;
  createError.value = "";
  try {
    const order = await orderApi.createOrder({
      goodsId: productId.value,
      orderPrice: price.value,
      shareModelId: shareModelId.value,
      chatHandsId: user.value?.id,
    });
    orderId.value = order.id ?? "";
    if (!orderId.value) {
      throw new Error("订单 id 为空");
    }
    remainSeconds.value = PAY_EXPIRE_SECONDS;
    startCountdown();
  } catch (error) {
    const message = error instanceof Error ? error.message : "订单创建失败";
    createError.value = message;
    uni.showToast({ title: message, icon: "none" });
  } finally {
    creating.value = false;
  }
};

onLoad((options) => {
  const opts = options || {};
  productId.value = decodeURIComponent(opts.productId || "");
  productName.value = decodeURIComponent(opts.productName || "");
  price.value = Number(opts.price || 0);
  shareModelId.value = decodeURIComponent(opts.shareModelId || "");
  shareModelName.value = decodeURIComponent(opts.shareModelName || "");
});

onMounted(() => {
  void createOrder();
});

onUnload(() => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
});

// 微信小程序原生分享：点击 open-type="share" 按钮时由小程序调用
onShareAppMessage(() => {
  return {
    title: `HI~你和我的距离只差一顿${shareModelName.value || "代付"}~ 来帮我代付吧~`,
    path: `/pages/share/pay/index?orderId=${encodeURIComponent(orderId.value)}`,
    imageUrl: "",
  };
});
</script>

<template>
  <view class="page">
    <view class="card">
      <view class="user-row">
        <view class="avatar"></view>
        <view class="user-info">
          <text class="name">{{ user?.nickname || "好友" }}</text>
          <text class="slogan">万水千山总是情，帮我付款行不行~</text>
        </view>
      </view>

      <text class="need-label">需付款</text>
      <text class="amount">¥{{ price.toFixed(2) }}</text>

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

      <view v-if="creating" class="status-tip">订单创建中...</view>
      <view v-else-if="createError" class="status-tip error">
        {{ createError }}
        <text class="retry" @click="createOrder">点击重试</text>
      </view>

      <button
        v-if="orderId"
        class="share-btn"
        open-type="share"
        hover-class="share-btn-hover"
      >
        发给微信好友
      </button>
      <button v-else class="share-btn disabled" disabled>发给微信好友</button>
    </view>

    <view class="goods-card">
      <text class="goods-title">{{ shareModelName || "代付" }}</text>
      <view class="goods-row">
        <view class="goods-thumb"></view>
        <view class="goods-info">
          <text class="goods-name">{{ productName }}</text>
          <text class="goods-meta">x1</text>
        </view>
        <text class="goods-price">¥{{ price.toFixed(2) }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f2f3f5;
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

.status-tip {
  text-align: center;
  color: #8b949e;
  font-size: 24rpx;
  margin-bottom: 20rpx;
}

.status-tip.error {
  color: #ee0a24;
}

.retry {
  margin-left: 10rpx;
  color: #1989fa;
}

.share-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #07c160;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
}

.share-btn.disabled {
  background: #c8c9cc;
}

.share-btn-hover {
  opacity: 0.85;
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
