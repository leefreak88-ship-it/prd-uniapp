# 核心约束 (Core Constraints)

## 具体约束条件

1. **平台限制**：仅支持**微信小程序**。严禁编写或保留任何用于适配 H5、App 或其他小程序的兼容性代码（如条件编译 `#ifdef H5` 等，除非特殊情况经评审通过，否则一律不使用）。
2. **类型系统**：必须使用 TypeScript 强类型系统。
   - 必须定义 Interface 或 Type。
   - **禁止**随意使用 `any` 类型，特殊情况需添加 `// @ts-ignore` 并说明理由。
3. **UI 规范**：
   - 首选使用 **WOT UI** (Wot Design Uni) 组件库。
   - **样式变量强制引用**：所有样式必须引用 `./src/uni.scss` 中的全局变量，严禁硬编码（hex/rgb/px/rpx）。具体包括：
     - **颜色系统**：主色调 (`$theme-color-*`)、背景色 (`$theme-bg-*`)、文字颜色 (`$theme-text-*`)、功能色 (Success/Warning/Error/Info)。
     - **边框与阴影**：边框颜色 (`$theme-border-*`)、阴影效果 (`$theme-shadow-*`)。
     - **尺寸系统**：字体大小 (`$theme-font-size-*`)、行高 (`$theme-line-height-*`)、间距 (`$theme-spacing-*`)、圆角 (`$theme-border-radius-*`)。
     - **组件变量**：卡片、按钮、输入框、导航栏等特定组件的样式变量。
   - **暗色模式适配**：使用以 `$theme-dark-*` 开头的变量进行暗色模式下的样式定义（如适用）。
4. **请求控制**:每一个接口对应使用一个usequery去做控制
5. **资源管理**：
   - 静态资源（图片、视频等）不应下载到本地项目中（tabbar 图标除外）。
   - 使用代码占位符 `TODO` 或网络链接代替本地大文件资源，减小包体积。
