// index.js
// const app = getApp()
const CubeModel = require('../../models/cube.js')
const Cube3DRenderer = require('../../utils/cube3DRenderer.js')

// Page({
//   data: {
//     // 魔方颜色定义
//     colors: [
//       { key: 'red', name: '红' },
//       { key: 'orange', name: '橙' },
//       { key: 'yellow', name: '黄' },
//       { key: 'white', name: '白' },
//       { key: 'green', name: '绿' },
//       { key: 'blue', name: '蓝' }
//     ],
//     selectedColor: 'red', // 当前选中的颜色
//     cubeState: null, // 魔方状态
//     canSolve: false, // 是否可以求解
//     isLoading: true, // 是否加载中
//     completedFaces: 0, // 已完成的面数
//     showProgressHint: false, // 显示进度提示
//     showConfirmModal: false, // 显示确认对话框
//     cubeStatusText: '请选择颜色并点击魔方进行录入',
//     // 新增：渲染模式切换
//     useHybridRender: true, // 默认使用混合渲染
//     showDebug: false // 调试信息
//   },

//   // 页面加载
//   onLoad() {
//     console.log('index页面加载')
//     this.initCube()
//   },

//   // 页面显示
//   onShow() {
//     console.log('index页面显示')
//   },

//   // 页面准备完毕
//   onReady() {
//     console.log('index页面准备完毕')
//     if (!this.data.useHybridRender) {
//       this.initRenderer()
//     } else {
//       // 使用混合渲染时，不需要初始化传统渲染器
//       this.setData({ isLoading: false })
//     }
//   },

//   // 初始化魔方
//   initCube() {
//     const cubeState = new CubeModel()
//     this.setData({
//       cubeState: cubeState.getState(), // 修正：获取实际的状态对象而不是模型实例
//       completedFaces: cubeState.getCompletedFaces(),
//       canSolve: cubeState.isComplete()
//     })
    
//     // 保存到全局
//     app.globalData.currentCubeState = cubeState
//     this.updateStatus()
//   },

//   // 初始化渲染器
//   initRenderer() {
//     try {
//       console.log('开始初始化渲染器')
//       const query = wx.createSelectorQuery()
//       query.select('.cube-canvas').boundingClientRect((rect) => {
//         console.log('Canvas尺寸:', rect)
//         if (rect && rect.width > 0) {
//           // 确保使用正方形画布，避免变形
//           const canvasSize = Math.min(rect.width, rect.height > 0 ? rect.height : 600)
//           console.log('使用正方形Canvas尺寸:', canvasSize)
//           this.cubeRenderer = new Cube3DRenderer('cubeCanvas', canvasSize, canvasSize)
//           this.cubeRenderer.init().then(() => {
//             console.log('渲染器初始化成功')
//             this.setData({ isLoading: false })
//             this.renderCube()
//           }).catch((error) => {
//             console.error('初始化渲染器失败:', error)
//             this.setData({ 
//               isLoading: false,
//               cubeStatusText: '3D模型加载失败，请重试'
//             })
//           })
//         } else {
//           console.error('Canvas尺寸无效:', rect)
//           this.setData({ 
//             isLoading: false,
//             cubeStatusText: 'Canvas尺寸获取失败'
//           })
//         }
//       }).exec()
//     } catch (error) {
//       console.error('创建渲染器失败:', error)
//       this.setData({ 
//         isLoading: false,
//         cubeStatusText: '初始化失败，请重启小程序'
//       })
//     }
//   },

//   // 渲染魔方
//   renderCube() {
//     if (this.cubeRenderer && this.data.cubeState) {
//       this.cubeRenderer.render(this.data.cubeState)
//     }
//   },

//   // 颜色选择
//   onColorSelect(e) {
//     const color = e.currentTarget.dataset.color
//     this.setData({ 
//       selectedColor: color,
//       cubeStatusText: `已选择${this.getColorName(color)}，点击魔方进行涂色`
//     })
//   },

//   // 获取颜色名称
//   getColorName(colorKey) {
//     const color = this.data.colors.find(c => c.key === colorKey)
//     return color ? color.name : colorKey
//   },

//   // 触摸开始
//   onTouchStart(e) {
//     if (this.cubeRenderer) {
//       const touch = e.touches[0]
//       this.cubeRenderer.handleTouchStart(touch.x, touch.y)
//     }
//   },

//   // 触摸移动
//   onTouchMove(e) {
//     if (this.cubeRenderer && this.cubeRenderer.handleTouchMove) {
//       const touch = e.touches[0]
//       const result = this.cubeRenderer.handleTouchMove(touch.x, touch.y)
      
//       if (result && result.type === 'rotate') {
//         // 旋转魔方时提供轻微的触觉反馈
//         if (Math.random() < 0.1) { // 10%的概率提供反馈，避免过于频繁
//           wx.vibrateShort({
//             type: 'light'
//           })
//         }
//         this.renderCube()
//       }
//     }
//   },

//   // 触摸结束
//   onTouchEnd(e) {
//     if (this.cubeRenderer && this.cubeRenderer.handleTouchEnd) {
//       const touch = e.changedTouches[0]
//       const result = this.cubeRenderer.handleTouchEnd(touch.x, touch.y)
      
//       // 如果是点击魔方面
//       if (result && result.type === 'click') {
//         this.onCubeFaceClick(result.face, result.row, result.col, result.position)
//       }
//     }
//   },

//   // 魔方面点击 - 处理来自混合渲染组件的点击事件
//   onCubeClick(e) {
//     console.log('收到魔方点击事件:', e.detail)
//     // TODO: 实现点击面的识别逻辑
//     // 这里需要根据点击坐标计算是哪个面的哪个位置
    
//     // 暂时使用测试数据
//     const testFaces = ['F', 'B', 'L', 'R', 'U', 'D']
//     const testFace = testFaces[Math.floor(Math.random() * testFaces.length)]
//     const testPosition = Math.floor(Math.random() * 9)
    
//     this.onCubeFaceClick(testFace, 0, 0, testPosition)
//   },

//   // 魔方面点击
//   onCubeFaceClick(face, row, col, position) {
//     if (!this.data.selectedColor) {
//       wx.showToast({
//         title: '请先选择颜色',
//         icon: 'none',
//         duration: 1000
//       })
//       return
//     }
    
//     // 中心块不能修改
//     if (position === 4) {
//       wx.showToast({
//         title: '中心块不能修改',
//         icon: 'none',
//         duration: 1000
//       })
//       // 轻微震动提示错误
//       wx.vibrateShort({
//         type: 'heavy'
//       })
//       return
//     }
    
//     // 创建新的cubeState对象进行更新
//     const cubeState = {
//       U: [...this.data.cubeState.U],
//       D: [...this.data.cubeState.D],
//       F: [...this.data.cubeState.F],
//       B: [...this.data.cubeState.B],
//       L: [...this.data.cubeState.L],
//       R: [...this.data.cubeState.R]
//     }
    
//     cubeState[face][position] = this.data.selectedColor
    
//     const completedFaces = this.getCompletedFaces(cubeState)
//     const canSolve = this.isComplete(cubeState)
    
//     this.setData({
//       cubeState: cubeState,
//       completedFaces: completedFaces,
//       canSolve: canSolve,
//       showProgressHint: true
//     })
    
//     // 更新渲染
//     if (this.data.useHybridRender) {
//       // 通知混合渲染组件更新状态
//       const hybridCube = this.selectComponent('hybrid-cube')
//       if (hybridCube) {
//         hybridCube.updateCubeState(cubeState)
//       }
//     } else {
//       this.renderCube()
//     }
    
//     this.updateStatus()
    
//     // 隐藏进度提示
//     setTimeout(() => {
//       this.setData({ showProgressHint: false })
//     }, 2000)
    
//     // 保存到全局
//     const cubeModel = new CubeModel()
//     cubeModel.faces = cubeState
//     app.globalData.currentCubeState = cubeModel
    
//     // 成功的触觉反馈
//     wx.vibrateShort({
//       type: 'light'
//     })
    
//     // 如果完成了一个面，给予特殊反馈
//     if (completedFaces > this.data.completedFaces) {
//       setTimeout(() => {
//         wx.vibrateShort({
//           type: 'medium'
//         })
//       }, 100)
//     }
//   },
  
//   // 检查是否完成录入
//   isComplete(cubeState) {
//     for (let face in cubeState) {
//       for (let i = 0; i < 9; i++) {
//         if (cubeState[face][i] === 'empty') {
//           return false
//         }
//       }
//     }
//     return true
//   },

//   // 获取已完成的面数
//   getCompletedFaces(cubeState) {
//     let completed = 0
//     for (let face in cubeState) {
//       let faceComplete = true
//       for (let i = 0; i < 9; i++) {
//         if (cubeState[face][i] === 'empty') {
//           faceComplete = false
//           break
//         }
//       }
//       if (faceComplete) completed++
//     }
//     return completed
//   },

//   // 更新状态文本
//   updateStatus() {
//     const { completedFaces, canSolve } = this.data
//     let statusText = ''
    
//     if (completedFaces === 0) {
//       statusText = '请选择颜色并点击魔方进行录入'
//     } else if (completedFaces < 6) {
//       statusText = `已录入 ${completedFaces}/6 个面，继续录入...`
//     } else if (canSolve) {
//       statusText = '魔方状态录入完成，可以开始求解'
//     } else {
//       statusText = '魔方状态有误，请检查后重新录入'
//     }
    
//     this.setData({ cubeStatusText: statusText })
//   },

//   // 重置魔方
//   onReset() {
//     this.setData({ showConfirmModal: true })
//   },

//   // 确认重置
//   confirmReset() {
//     this.initCube()
    
//     // 更新渲染
//     if (this.data.useHybridRender) {
//       // 通知混合渲染组件更新状态
//       const hybridCube = this.selectComponent('hybrid-cube')
//       if (hybridCube) {
//         hybridCube.updateCubeState(this.data.cubeState)
//       }
//     } else {
//       this.renderCube()
//     }
    
//     this.setData({ showConfirmModal: false })
    
//     wx.showToast({
//       title: '已重置',
//       icon: 'success',
//       duration: 1000
//     })
//   },

//   // 隐藏确认对话框
//   hideConfirmModal() {
//     this.setData({ showConfirmModal: false })
//   },

//   // 拍照识别（v2功能）
//   onPhotoRecognition() {
//     wx.showToast({
//       title: '功能开发中，敬请期待',
//       icon: 'none',
//       duration: 2000
//     })
//   },

//   // 分享功能
//   onShare() {
//     wx.showShareMenu({
//       withShareTicket: true,
//       menus: ['shareAppMessage', 'shareTimeline']
//     })
//   },

//   // 开始求解
//   onSolve() {
//     if (!this.data.canSolve) {
//       wx.showToast({
//         title: '请完成魔方录入',
//         icon: 'none',
//         duration: 2000
//       })
//       return
//     }

//     // 验证魔方状态
//     const cubeModel = new CubeModel()
//     cubeModel.faces = this.data.cubeState
//     if (!cubeModel.isValid()) {
//       wx.showModal({
//         title: '魔方状态错误',
//         content: '当前魔方状态无法求解，请检查颜色录入是否正确',
//         showCancel: false
//       })
//       return
//     }

//     // 跳转到求解页面
//     wx.navigateTo({
//       url: '/pages/solver/solver'
//     })
//   },

//   // 切换渲染模式
//   toggleRenderMode() {
//     const newMode = !this.data.useHybridRender
//     this.setData({ 
//       useHybridRender: newMode,
//       isLoading: newMode ? false : true
//     })
    
//     if (!newMode) {
//       // 切换到传统Canvas渲染
//       this.initRenderer()
//     }
//   },

//   // 页面卸载
//   onUnload() {
//     if (this.cubeRenderer) {
//       this.cubeRenderer.destroy()
//     }
//   }
// })

// index.js
const app = getApp()

Page({
  data: {
    cubeState: null,
    selectedColor: 'D', // 默认选择黄色
    colors: [
      { key: 'R', name: '红' },
      { key: 'L', name: '橙' },
      { key: 'D', name: '黄' },
      { key: 'U', name: '白' },
      { key: 'B', name: '蓝' },
      { key: 'F', name: '绿' },
    ],
    canSolve: false,
    completedFaces: 0,
    showProgressHint: false,
    showConfirmModal: false,
  },

  onLoad() {
    this.initCubeState();
  },

  initCubeState() {
    // U-上(白), D-下(黄), F-前(绿), B-后(蓝), L-左(橙), R-右(红)
    const initialCubeState = {
      U: Array(9).fill('empty'),
      D: Array(9).fill('empty'),
      F: Array(9).fill('empty'),
      B: Array(9).fill('empty'),
      L: Array(9).fill('empty'),
      R: Array(9).fill('empty'),
    };

    // 设置每个面的中心块颜色
    initialCubeState.U[4] = 'U'; // White
    initialCubeState.D[4] = 'D'; // Yellow
    initialCubeState.F[4] = 'F'; // Green
    initialCubeState.B[4] = 'B'; // Blue
    initialCubeState.L[4] = 'L'; // Orange
    initialCubeState.R[4] = 'R'; // Red

    this.setData({
      cubeState: initialCubeState,
      canSolve: false,
      completedFaces: 0,
    });
  },

  onColorSelect(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedColor: color
    });
  },

  onCubeClick(e) {
    const { face, index } = e.detail;
    const { cubeState, selectedColor } = this.data;

    // 中心块不能被修改
    if (index === 4) {
      return;
    }

    const newFaceState = [...cubeState[face]];
    // If the sticker is already the selected color, make it empty, otherwise set the color
    newFaceState[index] = newFaceState[index] === selectedColor ? 'empty' : selectedColor;
    
    const newCubeState = {
      ...cubeState,
      [face]: newFaceState
    };

    this.setData({
      cubeState: newCubeState
    });

    this.checkCompletion();
  },

  checkCompletion() {
    let completed = 0;
    let totalEmpty = 0;
    
    for (const face in this.data.cubeState) {
      let faceComplete = true;
      for (let i = 0; i < 9; i++) {
        if (this.data.cubeState[face][i] === 'empty') {
          faceComplete = false;
          totalEmpty++;
        }
      }
      if (faceComplete) {
        completed++;
      }
    }

    const canSolve = completed === 6 && totalEmpty === 0;
    
    if (canSolve !== this.data.canSolve) {
      this.setData({ canSolve: canSolve });
    }
    
    // 显示进度提示
    if (completed > this.data.completedFaces && completed < 6) {
      this.setData({ showProgressHint: true });
      setTimeout(() => {
        this.setData({ showProgressHint: false });
      }, 2000);
    }
    
    this.setData({ 
      completedFaces: completed,
      totalEmpty: totalEmpty
    });
  },

  onReset() {
    this.setData({ showConfirmModal: true });
  },

  hideConfirmModal() {
    this.setData({ showConfirmModal: false });
  },

  confirmReset() {
    this.initCubeState();
    this.setData({ showConfirmModal: false });
  },

  onSolve() {
    if (!this.data.canSolve) {
      wx.showToast({
        title: '请完成魔方录入',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 验证魔方状态是否有效
    if (!this.validateCubeState()) {
      wx.showModal({
        title: '魔方状态错误',
        content: '当前魔方状态无法求解，请检查颜色录入是否正确',
        showCancel: false
      });
      return;
    }

    // 保存魔方状态到全局数据
    const app = getApp();
    app.globalData = app.globalData || {};
    app.globalData.currentCubeState = {
      getState: () => this.data.cubeState,
      getStateString: () => this.convertToStateString(this.data.cubeState),
      copy: () => ({
        getState: () => ({ ...this.data.cubeState }),
        getStateString: () => this.convertToStateString(this.data.cubeState)
      })
    };

    // 跳转到求解页面
    wx.navigateTo({
      url: '/pages/solver/solver'
    });
  },

  // 验证魔方状态
  validateCubeState() {
    const state = this.data.cubeState;
    
    // 检查每种颜色是否都有9个
    const colorCounts = {};
    Object.values(state).forEach(face => {
      face.forEach(color => {
        if (color !== 'empty') {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        }
      });
    });

    // 每种颜色应该有9个
    const expectedColors = ['U', 'D', 'F', 'B', 'L', 'R'];
    for (const color of expectedColors) {
      if (colorCounts[color] !== 9) {
        return false;
      }
    }

    return true;
  },

  // 转换为状态字符串（供Kociemba算法使用）
  convertToStateString(cubeState) {
    // 将魔方状态转换为Kociemba算法需要的字符串格式
    let stateString = '';
    
    // 按照Kociemba的顺序：U R F D L B
    const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
    faces.forEach(face => {
      cubeState[face].forEach(color => {
        stateString += color;
      });
    });
    
    return stateString;
  },

  onShareAppMessage() {
    return {
      title: '魔方还原助手',
      path: '/pages/index/index'
    }
  }
})