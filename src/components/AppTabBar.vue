<!--
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-04-08 23:07:46
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-08 23:16:38
 * @FilePath: \pd_uniapp\src\components\AppTabBar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import { computed } from "vue";

type TabItem = {
  icon: string;
  label: string;
  path: string;
};

const props = defineProps<{
  currentPath: string;
  tabs?: TabItem[];
}>();

const defaultTabs: TabItem[] = [
  { icon: "home", label: "首页", path: "/pages/home/index" },
  { icon: "list", label: "订单", path: "/pages/orders/index" },
  { icon: "spool", label: "账单", path: "/pages/bills/index" },
];

const tabList = computed(() => {
  return props.tabs?.length ? props.tabs : defaultTabs;
});

const handleSwitch = (path: string) => {
  if (path === props.currentPath) {
    return;
  }
  uni.reLaunch({
    url: path,
  });
};
</script>

<template>
  <view class="app-tabbar">
    <view
      v-for="item in tabList"
      :key="item.path"
      class="app-tabbar-item"
      :class="{ active: item.path === currentPath }"
      @click="handleSwitch(item.path)"
    >
      <wd-icon :name="item.icon" size="50rpx"></wd-icon>
      <text class="app-tabbar-text">{{ item.label }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.app-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  background: #ffffff;
  border-top: 1rpx solid #ebeef5;
}

.app-tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
  padding: 24rpx 0rpx;
}

.app-tabbar-icon {
  color: #7a7e83;
  font-size: 28rpx;
  line-height: 1;
}

.app-tabbar-text {
  color: #7a7e83;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1;
}

.app-tabbar-item.active .app-tabbar-icon {
  color: #1989fa;
}

.app-tabbar-item.active .app-tabbar-text {
  color: #1989fa;
  font-weight: 600;
}
</style>
