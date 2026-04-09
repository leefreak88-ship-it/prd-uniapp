<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { reactive, ref } from "vue";
import { useAuth } from "@/hooks/use-auth";

const { login, loginPending } = useAuth();
const defaultRedirectUrl = "/pages/home/index";
const redirectUrl = ref(defaultRedirectUrl);

const form = reactive({
  phone: "",
  wxNumber: "",
});

onLoad((options) => {
  const target = typeof options?.redirect === "string" ? options.redirect : "";
  if (!target) {
    redirectUrl.value = defaultRedirectUrl;
    return;
  }
  try {
    redirectUrl.value = decodeURIComponent(target);
  } catch {
    redirectUrl.value = defaultRedirectUrl;
  }
});

const navigateAfterLogin = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({
      delta: 1,
    });
    return;
  }
  uni.reLaunch({
    url: redirectUrl.value || defaultRedirectUrl,
  });
};

const handleLogin = async () => {
  if (!form.phone.trim() && !form.wxNumber.trim()) {
    uni.showToast({
      title: "手机号或微信号至少填一项",
      icon: "none",
    });
    return;
  }
  try {
    await login({
      phone: form.phone.trim() || undefined,
      wxNumber: form.wxNumber.trim() || undefined,
    });
    uni.showToast({
      title: "登录成功",
      icon: "none",
    });
    navigateAfterLogin();
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败";
    uni.showToast({
      title: message,
      icon: "none",
    });
  }
};
</script>

<template>
  <view class="page">
    <view class="card">
      <text class="title">登录</text>
      <text class="tip">请输入手机号或微信号</text>
      <input
        v-model="form.phone"
        class="input"
        type="text"
        placeholder="请输入手机号"
        :maxlength="30"
      >
      <input
        v-model="form.wxNumber"
        class="input"
        type="text"
        placeholder="请输入微信号"
        :maxlength="30"
      >
      <wd-button type="primary" :loading="loginPending" @click="handleLogin">立即登录</wd-button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.card {
  width: 100%;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
}

.tip {
  font-size: 24rpx;
  color: #646a73;
}

.input {
  height: 88rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}
</style>
