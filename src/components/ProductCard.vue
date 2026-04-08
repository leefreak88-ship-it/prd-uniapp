<!--
 * @Author: zhihao li leefreak88@gmail.com
 * @Date: 2026-03-31 21:26:14
 * @LastEditors: zhihao li leefreak88@gmail.com
 * @LastEditTime: 2026-04-07 15:36:48
 * @FilePath: \pd_uniapp\src\components\ProductCard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import type { Product } from "@/api/types";

defineProps<{
  product: Product;
  purchased: boolean;
}>();

const emit = defineEmits<{
  buy: [productId: string];
}>();
</script>

<template>
  <view class="product-card">
    <image :style="{ background: product.goodsImage ? `` : '#f1f3f5;' }" :src="product.goodsImage" class="thumb"
      mode="aspectFill" />
    <view class="content">
      <view class="top">
        <text class="name">{{ product.name }}</text>
        <wd-tag v-if="purchased" type="success">已购买</wd-tag>
      </view>
      <text class="desc">{{ product.desc }}</text>
      <view class="bottom">
        <text class="price">¥{{ product.price }}</text>
        <wd-button type="primary" size="small" @click="emit('buy', product.id)">立即购买</wd-button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-card {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
}

.thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: 14rpx;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
}

.desc {
  color: #646a73;
  font-size: 24rpx;
}

.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  color: #ee0a24;
  font-weight: 700;
  font-size: 34rpx;
}
</style>
