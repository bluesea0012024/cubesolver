// common.js - 通用工具函数
const Common = {
  // 防抖函数
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // 节流函数
  throttle(func, limit) {
    let lastFunc
    let lastRan
    return function(...args) {
      if (!lastRan) {
        func.apply(this, args)
        lastRan = Date.now()
      } else {
        clearTimeout(lastFunc)
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(this, args)
            lastRan = Date.now()
          }
        }, limit - (Date.now() - lastRan))
      }
    }
  },

  // 深拷贝
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime())
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item))
    }
    
    if (typeof obj === 'object') {
      const clonedObj = {}
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key])
        }
      }
      return clonedObj
    }
  },

  // 格式化时间
  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}秒`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = (seconds % 60).toFixed(1)
    return `${minutes}分${remainingSeconds}秒`
  },

  // 生成唯一ID
  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  },

  // 验证颜色代码
  isValidColor(color) {
    const validColors = ['red', 'orange', 'yellow', 'white', 'green', 'blue', 'empty']
    return validColors.includes(color)
  },

  // 获取颜色的中文名称
  getColorName(color) {
    const colorNames = {
      'red': '红色',
      'orange': '橙色', 
      'yellow': '黄色',
      'white': '白色',
      'green': '绿色',
      'blue': '蓝色',
      'empty': '空白'
    }
    return colorNames[color] || color
  },

  // 计算数组的平均值
  average(arr) {
    if (!arr || arr.length === 0) return 0
    return arr.reduce((sum, val) => sum + val, 0) / arr.length
  },

  // 数组去重
  unique(arr) {
    return [...new Set(arr)]
  },

  // 随机打乱数组
  shuffle(arr) {
    const newArr = [...arr]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  },

  // 延迟执行
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 检查是否为微信小程序环境
  isMiniProgram() {
    return typeof wx !== 'undefined' && wx.getSystemInfo
  },

  // 获取系统信息
  getSystemInfo() {
    return new Promise((resolve, reject) => {
      if (this.isMiniProgram()) {
        wx.getSystemInfo({
          success: resolve,
          fail: reject
        })
      } else {
        reject(new Error('非微信小程序环境'))
      }
    })
  },

  // 显示提示信息
  showToast(title, icon = 'none', duration = 2000) {
    if (this.isMiniProgram()) {
      wx.showToast({
        title,
        icon,
        duration
      })
    } else {
      console.log(`Toast: ${title}`)
    }
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    if (this.isMiniProgram()) {
      wx.showLoading({ title })
    } else {
      console.log(`Loading: ${title}`)
    }
  },

  // 隐藏加载提示
  hideLoading() {
    if (this.isMiniProgram()) {
      wx.hideLoading()
    }
  },

  // 存储数据
  setStorage(key, data) {
    return new Promise((resolve, reject) => {
      if (this.isMiniProgram()) {
        wx.setStorage({
          key,
          data,
          success: resolve,
          fail: reject
        })
      } else {
        try {
          localStorage.setItem(key, JSON.stringify(data))
          resolve()
        } catch (error) {
          reject(error)
        }
      }
    })
  },

  // 获取存储的数据
  getStorage(key) {
    return new Promise((resolve, reject) => {
      if (this.isMiniProgram()) {
        wx.getStorage({
          key,
          success: (res) => resolve(res.data),
          fail: reject
        })
      } else {
        try {
          const data = localStorage.getItem(key)
          resolve(data ? JSON.parse(data) : null)
        } catch (error) {
          reject(error)
        }
      }
    })
  },

  // 移除存储的数据
  removeStorage(key) {
    return new Promise((resolve, reject) => {
      if (this.isMiniProgram()) {
        wx.removeStorage({
          key,
          success: resolve,
          fail: reject
        })
      } else {
        try {
          localStorage.removeItem(key)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
    })
  }
}

module.exports = Common