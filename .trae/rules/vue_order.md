# Vue 文件代码规范 (Vue Order)

## 具体约束条件

### 1. SFC 标签顺序

Vue 单文件组件 (.vue) 必须严格按照以下顺序组织顶层标签：

1.  `<script>` (setup) 应该在文件最开始。
2.  `<template>` 居中。
3.  `<style>` 在最末尾。

### 2. `<script>` 内部代码顺序

代码必须严格按照以下顺序组织：

1.  **import 语句**：按“第三方库 → 内部工具 → 组件 → 类型”分组，每组内部按字典序排列。
2.  **类型定义与常量声明**：TypeScript `interface` / `type` 及 `const` 常量。
3.  **响应式变量定义**：`ref`、`reactive`、`computed`、`watch` 等。
4.  **接口请求函数**：`async` 函数或返回 Promise 的函数，统一放在 `// API` 注释下方。
5.  **计算属性**：`computed` 属性定义。
6.  **普通方法函数**：`methods` 及业务逻辑处理函数。
7.  **生命周期钩子**：`onMounted`、`onUnmounted` 等，按执行时序排列。
