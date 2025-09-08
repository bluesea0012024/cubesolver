// app.js
App({
  onLaunch() {
    console.log('魔方还原助手启动')
    
    // 获取小程序版本信息
    const accountInfo = wx.getAccountInfoSync()
    this.globalData.version = accountInfo.miniProgram.version || 'develop'
    
    // 检查更新
    this.checkForUpdate()
    
    // 初始化用户数据
    this.initUserData()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(error) {
    console.error('小程序错误:', error)
  },

  // 检查小程序更新
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本')
        }
      })
      
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      
      updateManager.onUpdateFailed(() => {
        console.error('更新失败')
      })
    }
  },

  // 初始化用户数据
  initUserData() {
    try {
      const userData = wx.getStorageSync('userData')
      if (!userData) {
        const defaultUserData = {
          solveCount: 0,
          lastSolveTime: null,
          settings: {
            animationSpeed: 2, // 1: 慢速, 2: 中速, 3: 快速
            autoPlay: false
          }
        }
        wx.setStorageSync('userData', defaultUserData)
        this.globalData.userData = defaultUserData
      } else {
        this.globalData.userData = userData
      }
    } catch (error) {
      console.error('初始化用户数据失败:', error)
    }
  },

  // 保存用户数据
  saveUserData() {
    try {
      wx.setStorageSync('userData', this.globalData.userData)
    } catch (error) {
      console.error('保存用户数据失败:', error)
    }
  },

  globalData: {
    version: '',
    userData: null,
    currentCubeState: null // 当前魔方状态
  }
})