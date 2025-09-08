// simpleCubeRenderer.js - 简化版魔方渲染器（用于调试）
class SimpleCubeRenderer {
  constructor(canvasId, width, height) {
    this.canvasId = canvasId
    this.width = Math.max(width, 300)
    this.height = Math.max(height, 300)
    this.ctx = null
    this.isInitialized = false
    
    console.log('SimpleCubeRenderer创建:', { canvasId, width: this.width, height: this.height })
    
    // 简化的魔方参数
    this.cubeSize = Math.min(this.width, this.height) * 0.6
    this.blockSize = this.cubeSize / 3
    
    // 颜色定义
    this.colors = {
      'empty': '#f5f5f5',
      'white': '#ffffff',
      'yellow': '#ffeb3b', 
      'green': '#4caf50',
      'blue': '#2196f3',
      'orange': '#ff9800',
      'red': '#f44336'
    }
  }

  // 初始化
  async init() {
    return new Promise((resolve, reject) => {
      try {
        console.log('简化版渲染器初始化开始')
        this.ctx = wx.createCanvasContext(this.canvasId)
        
        if (!this.ctx) {
          reject(new Error('无法创建canvas上下文'))
          return
        }
        
        this.isInitialized = true
        console.log('简化版渲染器初始化完成')
        resolve()
      } catch (error) {
        console.error('简化版渲染器初始化失败:', error)
        reject(error)
      }
    })
  }

  // 简单的2D魔方渲染
  render(cubeState) {
    console.log('简化版渲染开始')
    
    if (!this.isInitialized || !this.ctx) {
      console.warn('渲染器未初始化')
      return
    }

    try {
      // 清空画布
      this.ctx.clearRect(0, 0, this.width, this.height)
      
      // 背景
      this.ctx.fillStyle = '#f0f0f0'
      this.ctx.fillRect(0, 0, this.width, this.height)
      
      // 绘制前面的3x3网格
      this.drawFace(cubeState.F, this.width / 2 - this.cubeSize / 2, this.height / 2 - this.cubeSize / 2)
      
      this.ctx.draw()
      console.log('简化版渲染完成')
      
    } catch (error) {
      console.error('简化版渲染失败:', error)
    }
  }

  // 绘制单个面
  drawFace(faceData, startX, startY) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col
        const color = faceData[index]
        const x = startX + col * this.blockSize
        const y = startY + row * this.blockSize
        
        // 绘制格子
        this.ctx.fillStyle = this.colors[color] || this.colors['empty']
        this.ctx.fillRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4)
        
        // 绘制边框
        this.ctx.strokeStyle = '#333'
        this.ctx.lineWidth = 2
        this.ctx.strokeRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4)
      }
    }
  }

  // 处理点击
  handleTouchEnd(x, y) {
    const startX = this.width / 2 - this.cubeSize / 2
    const startY = this.height / 2 - this.cubeSize / 2
    
    if (x >= startX && x < startX + this.cubeSize &&
        y >= startY && y < startY + this.cubeSize) {
      
      const col = Math.floor((x - startX) / this.blockSize)
      const row = Math.floor((y - startY) / this.blockSize)
      
      if (col >= 0 && col < 3 && row >= 0 && row < 3) {
        return {
          type: 'click',
          face: 'F',
          row: row,
          col: col,
          position: row * 3 + col
        }
      }
    }
    
    return null
  }

  // 空的触摸处理方法
  handleTouchStart() {}
  handleTouchMove() { return null }

  // 销毁
  destroy() {
    this.isInitialized = false
    this.ctx = null
  }
}

module.exports = SimpleCubeRenderer