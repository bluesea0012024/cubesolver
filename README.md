# 魔方还原助手 - 微信小程序

一个基于手动录入的三阶魔方求解助手小程序（v1.0版本）

## 项目结构

```
cubesolver/
├── app.js                  # 小程序主入口
├── app.json               # 小程序全局配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置文件
├── sitemap.json         # 站点地图配置
├── 
├── pages/               # 页面目录
│   ├── index/          # 首页（魔方录入）
│   │   ├── index.js
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── solver/         # 求解页面
│       ├── solver.js
│       ├── solver.wxml
│       └── solver.wxss
│
├── components/         # 自定义组件
│   └── loading/       # 加载提示组件
│       ├── loading.js
│       ├── loading.json
│       ├── loading.wxml
│       └── loading.wxss
│
├── models/            # 数据模型
│   └── cube.js       # 魔方状态模型
│
├── utils/             # 工具函数
│   ├── common.js     # 通用工具函数
│   ├── cubeRenderer.js  # 3D渲染器
│   └── kociemba.js   # 求解算法（简化版）
│
└── ui/               # UI设计稿
    ├── 魔方-1.jpg
    ├── 魔方-步数.jpg
    └── 魔方-颜色检查.jpg
```

## 功能特性

### v1.0 版本功能
- ✅ 手动颜色录入（点击魔方格子涂色）
- ✅ 3D魔方模型展示（Canvas渲染）
- ✅ 触摸旋转交互
- ✅ Kociemba算法求解（简化版）
- ✅ 分步解决方案展示
- ✅ 自动播放功能
- ✅ 播放速度调节
- ✅ 步骤导航控制

### v2.0 计划功能
- 📷 拍照识别魔方状态
- 🔍 AI图像识别集成
- 🎨 UI界面优化

## 开发环境

- 微信开发者工具 v1.06+
- 基础库版本 2.19.4+
- ES6语法支持

## 使用说明

1. 在微信开发者工具中打开项目
2. 配置AppID（修改project.config.json中的appid）
3. 点击编译运行

## 核心技术

- **前端框架**: 微信小程序原生开发
- **3D渲染**: Canvas 2D模拟3D效果
- **状态管理**: 小程序原生状态管理
- **算法**: Kociemba两阶段算法（简化版）
- **数据存储**: wx.setStorage本地存储

## 主要页面

### 首页 (pages/index)
- 3D魔方模型展示
- 颜色选择器
- 手动录入功能
- 操作说明

### 求解页面 (pages/solver)  
- 求解步骤展示
- 自动播放控制
- 步骤导航
- 分享功能

## 开发进度

- [x] 项目结构搭建
- [x] 基础页面创建
- [x] 魔方数据模型
- [x] 3D渲染器实现
- [x] 录入功能开发
- [x] 求解算法集成
- [x] 步骤展示功能
- [ ] 测试优化
- [ ] 性能优化
- [ ] 发布准备

## 注意事项

1. 本项目为演示版本，Kociemba算法为简化实现
2. 3D渲染使用Canvas 2D模拟，非真正的WebGL
3. 图像识别功能将在v2.0版本中实现

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License