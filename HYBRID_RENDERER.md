# 混合渲染魔方实现方案

## 技术架构

### 渲染层方案
- **外壳**: 使用 WXML + WXSS 3D 变换创建立方体结构
- **贴纸/内容**: 使用 Canvas 2D 渲染每个面的 3x3 色块
- **优势**: 兼顾 60fps 性能与真 3D 视差效果

### 物理/交互层
- **手势计算**: 使用 WXS 脚本计算旋转轴与角度
- **动画驱动**: 使用 `wx.createAnimation` 或 `this.animate` 驱动 CSS transform
- **性能优化**: 避免高频 `setData` 调用

### 进阶优化方案
- **帧缓存**: 使用离屏 Canvas 做帧缓存
- **动画循环**: 在 `onShow` 里使用 `requestAnimationFrame` 自绘
- **性能目标**: 每帧只画一张 256×256 贴图，确保 iOS/Android 都可稳定 60fps

## 核心组件

### HybridCube 组件
位于: `components/hybridCube/`

#### 主要特性
1. **3D 结构**: 使用 CSS 3D 变换创建立方体
2. **Canvas 渲染**: 每个面使用独立 Canvas 渲染色块
3. **手势交互**: 支持触摸旋转和点击选择
4. **性能优化**: 防抖渲染、帧缓存机制

#### 文件结构
```
hybridCube/
├── hybridCube.js      # 组件逻辑
├── hybridCube.json    # 组件配置
├── hybridCube.wxml    # 组件结构
├── hybridCube.wxss    # 组件样式
└── gesture.wxs        # WXS 手势处理
```

### AdvancedCubeRenderer 类
位于: `utils/advancedCubeRenderer.js`

#### 主要特性
1. **帧缓存**: 缓存渲染结果避免重复计算
2. **动画循环**: 使用 `requestAnimationFrame` 实现流畅动画
3. **离屏渲染**: 使用离屏 Canvas 提高渲染性能

## 实现细节

### 3D 立方体结构
使用 CSS 3D 变换创建 6 个面：
- 前面: `translateZ(200rpx)`
- 后面: `rotateY(180deg) translateZ(200rpx)`
- 右面: `rotateY(90deg) translateZ(200rpx)`
- 左面: `rotateY(-90deg) translateZ(200rpx)`
- 上面: `rotateX(90deg) translateZ(200rpx)`
- 下面: `rotateX(-90deg) translateZ(200rpx)`

### 性能优化策略
1. **WXS 手势处理**: 在视图层处理手势，避免通信延迟
2. **防抖渲染**: 限制渲染频率避免过度绘制
3. **帧缓存**: 缓存相同状态的渲染结果
4. **离屏渲染**: 使用离屏 Canvas 提高渲染效率

### 交互实现
1. **旋转控制**: 通过触摸滑动改变 `rotateX` 和 `rotateY` 值
2. **点击检测**: 通过坐标计算确定点击的面和位置
3. **动画过渡**: 使用 CSS transition 实现平滑旋转

## 使用方法

在页面中使用混合渲染魔方组件：

```wxml
<hybrid-cube 
  cube-state="{{cubeState}}"
  selected-color="{{selectedColor}}"
  bind:cubeClick="onCubeClick"
></hybrid-cube>
```

```javascript
Page({
  data: {
    cubeState: {}, // 魔方状态对象
    selectedColor: 'red' // 当前选中颜色
  },
  
  onCubeClick(e) {
    // 处理魔方点击事件
    console.log('点击信息:', e.detail)
  }
})
```