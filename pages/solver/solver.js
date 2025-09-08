// solver.js
const app = getApp()
const Cube3DRenderer = require('../../utils/cube3DRenderer.js')
const KociembaAlgorithm = require('../../utils/kociemba.js')

Page({
  data: {
    currentStep: 0,          // 当前步骤
    totalSteps: 0,           // 总步数
    progressPercent: 0,      // 进度百分比
    currentFormula: '',      // 当前步骤公式
    stepDescription: '',     // 步骤描述
    playSpeed: 2,           // 播放速度 1-慢 2-中 3-快
    speedText: '中速',      // 速度文本
    isAutoPlaying: false,   // 是否自动播放
    isSolving: false,       // 是否正在求解
    isCompleted: false,     // 是否完成
    solutionSteps: [],      // 解法步骤
    solveTime: '',          // 求解用时
    showShareModal: false,  // 显示分享对话框
    cubeState: null,        // 魔方状态
    originalState: null,    // 原始状态
    autoPlayTimer: null     // 自动播放定时器
  },

  onLoad() {
    console.log('solver页面加载')
    this.initSolver()
  },

  onReady() {
    console.log('solver页面准备完毕')
    this.initRenderer()
  },

  onShow() {
    console.log('solver页面显示')
  },

  onHide() {
    this.stopAutoPlay()
  },

  onUnload() {
    this.stopAutoPlay()
    if (this.cubeRenderer) {
      this.cubeRenderer.destroy()
    }
  },

  // 初始化求解器
  initSolver() {
    const cubeState = app.globalData.currentCubeState
    if (!cubeState) {
      wx.showModal({
        title: '错误',
        content: '没有找到魔方状态数据',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
      return
    }

    this.setData({
      cubeState: cubeState,
      originalState: cubeState.copy(),
      isSolving: true
    })

    this.solveCube()
  },

  // 初始化渲染器
  initRenderer() {
    const query = wx.createSelectorQuery()
    query.select('.solver-canvas').boundingClientRect((rect) => {
      if (rect) {
        this.cubeRenderer = new Cube3DRenderer('solverCanvas', rect.width, rect.height)
        this.cubeRenderer.init().then(() => {
          this.renderCurrentState()
        }).catch((error) => {
          console.error('初始化渲染器失败:', error)
        })
      }
    }).exec()
  },

  // 求解魔方
  async solveCube() {
    try {
      const startTime = Date.now()
      const cubeState = this.data.cubeState
      
      // 使用Kociemba算法求解
      const kociemba = new KociembaAlgorithm()
      const solution = await kociemba.solve(cubeState.getStateString())
      
      const endTime = Date.now()
      const solveTime = ((endTime - startTime) / 1000).toFixed(2) + '秒'
      
      // 解析解法步骤
      const steps = this.parseSolution(solution)
      
      this.setData({
        isSolving: false,
        solutionSteps: steps,
        totalSteps: steps.length,
        solveTime: solveTime,
        currentStep: 0,
        progressPercent: 0
      })

      this.updateStepInfo()
      
    } catch (error) {
      console.error('求解失败:', error)
      this.setData({ isSolving: false })
      
      wx.showModal({
        title: '求解失败',
        content: '魔方求解过程中出现错误，请重试',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },

  // 解析求解方案
  parseSolution(solution) {
    const moves = solution.trim().split(/\s+/)
    const steps = []
    
    const moveDescriptions = {
      'R': '右面顺时针90度',
      'R\'': '右面逆时针90度',
      'R2': '右面180度',
      'L': '左面顺时针90度',
      'L\'': '左面逆时针90度',
      'L2': '左面180度',
      'U': '上面顺时针90度',
      'U\'': '上面逆时针90度',
      'U2': '上面180度',
      'D': '下面顺时针90度',
      'D\'': '下面逆时针90度',
      'D2': '下面180度',
      'F': '前面顺时针90度',
      'F\'': '前面逆时针90度',
      'F2': '前面180度',
      'B': '后面顺时针90度',
      'B\'': '后面逆时针90度',
      'B2': '后面180度'
    }
    
    moves.forEach((move, index) => {
      if (move && moveDescriptions[move]) {
        steps.push({
          move: move,
          description: moveDescriptions[move]
        })
      }
    })
    
    return steps
  },

  // 更新步骤信息
  updateStepInfo() {
    const { currentStep, totalSteps, solutionSteps } = this.data
    
    let formula = ''
    let description = ''
    let progress = 0
    
    if (currentStep > 0 && currentStep <= totalSteps) {
      const step = solutionSteps[currentStep - 1]
      formula = step.move
      description = step.description
    }
    
    if (totalSteps > 0) {
      progress = (currentStep / totalSteps) * 100
    }
    
    this.setData({
      currentFormula: formula,
      stepDescription: description,
      progressPercent: progress,
      isCompleted: currentStep >= totalSteps
    })
  },

  // 渲染当前状态
  renderCurrentState() {
    if (this.cubeRenderer && this.data.cubeState) {
      this.cubeRenderer.render(this.data.cubeState.getState())
    }
  },

  // 上一步
  previousStep() {
    const { currentStep } = this.data
    if (currentStep > 0) {
      this.setData({ currentStep: currentStep - 1 })
      this.executeStep(currentStep - 1, true) // 反向执行
      this.updateStepInfo()
    }
  },

  // 下一步
  nextStep() {
    const { currentStep, totalSteps } = this.data
    if (currentStep < totalSteps) {
      this.setData({ currentStep: currentStep + 1 })
      this.executeStep(currentStep, false) // 正向执行
      this.updateStepInfo()
    }
  },

  // 执行步骤
  executeStep(stepIndex, reverse = false) {
    const { solutionSteps, cubeState } = this.data
    if (stepIndex >= 0 && stepIndex < solutionSteps.length) {
      const step = solutionSteps[stepIndex]
      const move = reverse ? this.reverseMove(step.move) : step.move
      
      // 执行移动
      cubeState.executeMove(move)
      this.renderCurrentState()
    }
  },

  // 反向移动
  reverseMove(move) {
    if (move.endsWith('\'')) {
      return move.slice(0, -1) // 去掉'
    } else if (move.endsWith('2')) {
      return move // 180度移动的反向还是自己
    } else {
      return move + '\'' // 加上'
    }
  },

  // 跳转到指定步骤
  jumpToStep(e) {
    const targetStep = parseInt(e.currentTarget.dataset.step)
    const { currentStep } = this.data
    
    if (targetStep !== currentStep) {
      // 重置到初始状态然后执行到目标步骤
      this.resetToOriginalState()
      
      for (let i = 0; i < targetStep; i++) {
        this.executeStep(i, false)
      }
      
      this.setData({ currentStep: targetStep })
      this.updateStepInfo()
    }
  },

  // 重置到原始状态
  resetToOriginalState() {
    const originalState = this.data.originalState
    if (originalState) {
      this.setData({ cubeState: originalState.copy() })
      this.renderCurrentState()
    }
  },

  // 切换自动播放
  toggleAutoPlay() {
    const { isAutoPlaying } = this.data
    if (isAutoPlaying) {
      this.stopAutoPlay()
    } else {
      this.startAutoPlay()
    }
  },

  // 开始自动播放
  startAutoPlay() {
    const { playSpeed, currentStep, totalSteps } = this.data
    
    if (currentStep >= totalSteps) {
      wx.showToast({
        title: '已完成所有步骤',
        icon: 'none'
      })
      return
    }
    
    this.setData({ isAutoPlaying: true })
    
    const intervals = { 1: 2000, 2: 1000, 3: 500 } // 慢中快对应的时间间隔
    const interval = intervals[playSpeed] || 1000
    
    this.data.autoPlayTimer = setInterval(() => {
      const { currentStep, totalSteps } = this.data
      if (currentStep < totalSteps) {
        this.nextStep()
      } else {
        this.stopAutoPlay()
      }
    }, interval)
  },

  // 停止自动播放
  stopAutoPlay() {
    this.setData({ isAutoPlaying: false })
    if (this.data.autoPlayTimer) {
      clearInterval(this.data.autoPlayTimer)
      this.data.autoPlayTimer = null
    }
  },

  // 速度改变
  onSpeedChange(e) {
    const speed = parseInt(e.detail.value)
    const speedTexts = { 1: '慢速', 2: '中速', 3: '快速' }
    
    this.setData({
      playSpeed: speed,
      speedText: speedTexts[speed] || '中速'
    })
    
    // 如果正在自动播放，重新启动以应用新速度
    if (this.data.isAutoPlaying) {
      this.stopAutoPlay()
      this.startAutoPlay()
    }
  },

  // 触摸事件处理
  onTouchStart(e) {
    if (this.cubeRenderer) {
      const touch = e.touches[0]
      this.cubeRenderer.handleTouchStart(touch.x, touch.y)
    }
  },

  onTouchMove(e) {
    if (this.cubeRenderer) {
      const touch = e.touches[0]
      this.cubeRenderer.handleTouchMove(touch.x, touch.y)
      this.renderCurrentState()
    }
  },

  onTouchEnd(e) {
    if (this.cubeRenderer) {
      this.cubeRenderer.handleTouchEnd()
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 分享解法
  shareSolution() {
    this.setData({ showShareModal: true })
  },

  // 分享给朋友
  shareToFriend() {
    const { totalSteps, solveTime } = this.data
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    // 触发分享
    wx.shareAppMessage({
      title: `我用${totalSteps}步${solveTime}还原了魔方！`,
      path: '/pages/index/index'
    })
    
    this.hideShareModal()
  },

  // 保存图片
  saveImage() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
    this.hideShareModal()
  },

  // 隐藏分享对话框
  hideShareModal() {
    this.setData({ showShareModal: false })
  },

  // 开始新的还原
  startNew() {
    wx.navigateBack()
  }
})