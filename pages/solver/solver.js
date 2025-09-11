// solver.js
const app = getApp()
const KociembaAlgorithm = require('../../utils/kociemba.js')
const CubeModel = require('../../models/cube.js')

Page({
  data: {
    currentStep: 0,          // 当前步骤
    totalSteps: 0,           // 总步数
    progressPercent: 0,      // 进度百分比
    currentFormula: '',      // 当前步骤公式
    stepDescription: '',     // 步骤描述
    playSpeed: 3,           // 播放速度 1-较慢 2-慢速 3-中速 4-较快 5-快速
    speedText: '中速',      // 速度文本
    isAutoPlaying: false,   // 是否自动播放
    isAnimating: false,     // 是否正在执行动画
    isSolving: false,       // 是否正在求解
    isCompleted: false,     // 是否完成
    solutionSteps: [],      // 解法步骤
    solveTime: '',          // 求解用时
    showShareModal: false,  // 显示分享对话框
    cubeState: null,        // 魔方状态（CubeModel实例）
    cubeStateForDisplay: null, // 用于显示的魔方状态
    originalState: null,    // 原始状态
    autoPlayTimer: null     // 自动播放定时器
  },

  onLoad() {
    console.log('solver页面加载')
    this.initSolver()
  },

  onReady() {
    console.log('solver页面准备完毕')
    this.initHybridCube()
  },

  onShow() {
    console.log('solver页面显示')
  },

  onHide() {
    this.stopAutoPlay()
  },

  onUnload() {
    this.stopAutoPlay()
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

    // 初始化时立即设置显示数据
    if (cubeState && cubeState.getState) {
      const modelState = cubeState.getState()
      console.log('初始化魔方数据:', modelState)
      
      // 转换颜色格式用于显示
      const colorToFaceMap = {
        'white': 'U', 'yellow': 'D', 'green': 'F',
        'blue': 'B', 'orange': 'L', 'red': 'R', 'empty': 'empty'
      }
      
      const hybridCubeState = {}
      for (let face in modelState) {
        hybridCubeState[face] = modelState[face].map(color => 
          colorToFaceMap[color] || color
        )
        console.log(`初始化转换后面 ${face}:`, hybridCubeState[face])
      }
      
      this.setData({ 
        cubeStateForDisplay: hybridCubeState 
      })
    }

    this.solveCube()
  },

  // 初始化HybridCube组件
  initHybridCube() {
    this.hybridCube = this.selectComponent('#hybrid-cube')
    if (this.hybridCube) {
      console.log('HybridCube组件初始化成功')
      
      // 确保HybridCube组件得到初始数据
      setTimeout(() => {
        if (this.data.cubeState && this.data.cubeState.getState) {
          const modelState = this.data.cubeState.getState()
          this.setData({ 
            cubeStateForDisplay: modelState 
          })
          console.log('已向HybridCube发送初始数据:', modelState)
          
          // HybridCube组件使用CSS类名自动渲染，无需手动触发
        }
      }, 200)
    }
  },

  // 求解魔方
  async solveCube() {
    try {
      const startTime = Date.now()
      const cubeState = this.data.cubeState
      
      console.log('求解开始，cubeState:', cubeState)
      console.log('cubeState类型:', typeof cubeState)
      console.log('cubeState.getStateString:', typeof cubeState?.getStateString)
      
      if (!cubeState || typeof cubeState.getStateString !== 'function') {
        throw new Error('魔方状态数据无效，缺少getStateString方法')
      }
      
      const stateString = cubeState.getStateString()
      console.log('状态字符串:', stateString)
      console.log('状态字符串长度:', stateString.length)
      
      if (!stateString || stateString.length === 0) {
        throw new Error('无法获取魔方状态字符串')
      }
      
      if (stateString.length !== 54) {
        throw new Error(`魔方状态字符串长度错误，期望54个字符，实际${stateString.length}个字符`)
      }
      
      // 使用Kociemba算法求解
      const kociemba = new KociembaAlgorithm()
      const solution = await kociemba.solve(stateString)
      
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
      
      // 确保求解完成后正确显示魔方
      setTimeout(() => {
        this.renderCurrentState()
      }, 100)
      
    } catch (error) {
      console.error('求解失败:', error)
      console.error('错误详情:', error.message)
      console.error('错误堆栈:', error.stack)
      
      this.setData({ isSolving: false })
      
      wx.showModal({
        title: '求解失败',
        content: `魔方求解过程中出现错误：${error.message || '未知错误'}，请重试`,
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },

  // 解析求解方案
  parseSolution(solution) {
    console.log('解析解决方案:', solution)
    const moves = solution.trim().split(/\s+/)
    console.log('分解的移动步骤:', moves)
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
      } else if (move) {
        console.warn('未识别的移动:', move)
      }
    })
    
    console.log('解析完成，步骤数:', steps.length)
    console.log('解析的步骤:', steps)
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
    // 为HybridCube组件准备显示数据，但保持原始CubeModel引用
    if (this.data.cubeState && this.data.cubeState.getState) {
      const modelState = this.data.cubeState.getState()
      console.log('渲染当前状态 - modelState:', modelState)
      
      // 转换颜色名称为面标识符（HybridCube组件期望的格式）
      const colorToFaceMap = {
        'white': 'U',
        'yellow': 'D', 
        'green': 'F',
        'blue': 'B',
        'orange': 'L',
        'red': 'R',
        'empty': 'empty'
      }
      
      const hybridCubeState = {}
      for (let face in modelState) {
        hybridCubeState[face] = modelState[face].map(color => 
          colorToFaceMap[color] || color
        )
        console.log(`转换后面 ${face}:`, hybridCubeState[face])
      }
      
      // 更新页面数据中的显示状态
      this.setData({ 
        cubeStateForDisplay: hybridCubeState 
      })
    }
  },

  // 魔方点击事件处理（禁用在solver页面）
  onCubeClick() {
    // 在solver页面不允许修改魔方状态
    return
  },

  // 上一步
  async previousStep() {
    const { currentStep, isAnimating } = this.data
    if (currentStep > 0 && !isAnimating) {
      this.setData({ isAnimating: true })
      
      try {
        // 执行反向动画
        await this.executeStepWithAnimation(currentStep - 1, true)
        this.setData({ 
          currentStep: currentStep - 1,
          isAnimating: false 
        })
        this.updateStepInfo()
      } catch (error) {
        console.error('上一步执行失败:', error)
        this.setData({ isAnimating: false })
      }
    }
  },

  // 下一步
  async nextStep() {
    const { currentStep, totalSteps, isAnimating } = this.data
    if (currentStep < totalSteps && !isAnimating) {
      this.setData({ isAnimating: true })
      
      try {
        // 执行正向动画
        await this.executeStepWithAnimation(currentStep, false)
        this.setData({ 
          currentStep: currentStep + 1,
          isAnimating: false 
        })
        this.updateStepInfo()
      } catch (error) {
        console.error('下一步执行失败:', error)
        this.setData({ isAnimating: false })
      }
    }
  },

  // 执行步骤（带动画）
  async executeStepWithAnimation(stepIndex, reverse = false) {
    const { solutionSteps, cubeState } = this.data
    if (stepIndex >= 0 && stepIndex < solutionSteps.length) {
      const step = solutionSteps[stepIndex]
      const move = reverse ? this.reverseMove(step.move) : step.move
      
      // 获取动画时长
      const animationDuration = this.getAnimationDuration()
      
      // 通过HybridCube组件执行动画
      if (this.hybridCube && this.hybridCube.animateMove) {
        await this.hybridCube.animateMove(move, animationDuration)
      }
      
      // 更新魔方状态
      cubeState.executeMove(move)
      
      // 更新显示
      this.renderCurrentState()
    }
  },

  // 执行步骤（无动画，用于跳转）
  executeStep(stepIndex, reverse = false) {
    const { solutionSteps, cubeState } = this.data
    if (stepIndex >= 0 && stepIndex < solutionSteps.length) {
      const step = solutionSteps[stepIndex]
      const move = reverse ? this.reverseMove(step.move) : step.move
      
      // 执行移动
      cubeState.executeMove(move)
      
      // 更新显示
      this.renderCurrentState()
    }
  },

  // 获取动画时长（根据播放速度）
  getAnimationDuration() {
    const { playSpeed } = this.data
    const durations = {
      1: 800,  // 较慢
      2: 600,  // 慢速 
      3: 400,  // 中速
      4: 300,  // 较快
      5: 200   // 快速
    }
    return durations[playSpeed] || 400
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
  async startAutoPlay() {
    const { playSpeed, currentStep, totalSteps, isAnimating } = this.data
    
    if (currentStep >= totalSteps) {
      wx.showToast({
        title: '已完成所有步骤',
        icon: 'none'
      })
      return
    }
    
    if (isAnimating) {
      return // 如果正在执行动画，不允许开始自动播放
    }
    
    this.setData({ isAutoPlaying: true })
    
    // 自动播放逻辑
    this.autoPlayNext()
  },

  // 自动播放下一步
  async autoPlayNext() {
    const { currentStep, totalSteps, isAutoPlaying } = this.data
    
    if (!isAutoPlaying || currentStep >= totalSteps) {
      this.stopAutoPlay()
      return
    }
    
    try {
      await this.nextStep()
      
      // 计算下次执行的延迟时间（动画时长 + 额外间隔）
      const animationDuration = this.getAnimationDuration()
      const extraDelay = 200 // 额外200ms间隔
      
      setTimeout(() => {
        if (this.data.isAutoPlaying) {
          this.autoPlayNext()
        }
      }, animationDuration + extraDelay)
      
    } catch (error) {
      console.error('自动播放失败:', error)
      this.stopAutoPlay()
    }
  },

  // 停止自动播放
  stopAutoPlay() {
    this.setData({ isAutoPlaying: false })
    if (this.data.autoPlayTimer) {
      clearInterval(this.data.autoPlayTimer)
      this.data.autoPlayTimer = null
    }
  },

  // 设置播放速度
  setSpeed(e) {
    const speed = parseInt(e.currentTarget.dataset.speed)
    const speedTexts = { 
      1: '较慢', 
      2: '慢速', 
      3: '中速', 
      4: '较快', 
      5: '快速' 
    }
    
    this.setData({
      playSpeed: speed,
      speedText: speedTexts[speed] || '中速'
    })
    
    // 如果正在自动播放，不需要重启，下次动画会自动应用新速度
    console.log('设置播放速度:', speedTexts[speed])
  },


  // 返回上一页
  goBack() {
    // 将当前魔方状态同步到全局数据，确保首页显示一致
    if (this.data.cubeState && typeof this.data.cubeState.copy === 'function') {
      // cubeState是CubeModel实例，直接传递
      app.globalData.currentCubeState = this.data.cubeState.copy()
    }
    
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