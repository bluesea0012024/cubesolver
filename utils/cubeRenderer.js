// cubeRenderer.js - 魔方3D渲染器
class CubeRenderer {
  constructor(canvasId, width, height) {
    this.canvasId = canvasId
    this.width = width
    this.height = height
    this.ctx = null
    this.isInitialized = false
    
    // 触摸状态
    this.isRotating = false
    this.lastTouchX = 0
    this.lastTouchY = 0
    
    // 旋转角度
    this.rotationX = -20
    this.rotationY = 35
    
    // 魔方参数
    this.cubeSize = Math.min(width, height) * 0.4
    this.centerX = width / 2
    this.centerY = height / 2
    
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

  // 初始化渲染器
  async init() {
    return new Promise((resolve, reject) => {
      try {
        this.ctx = wx.createCanvasContext(this.canvasId)
        if (!this.ctx) {
          reject(new Error('无法创建canvas上下文'))
          return
        }
        
        this.isInitialized = true
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 渲染魔方
  render(cubeState) {
    if (!this.isInitialized || !this.ctx) return
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height)
    
    // 绘制背景
    this.ctx.fillStyle = '#f8f9fa'
    this.ctx.fillRect(0, 0, this.width, this.height)
    
    // 计算变换矩阵
    const cos1 = Math.cos(this.rotationX * Math.PI / 180)
    const sin1 = Math.sin(this.rotationX * Math.PI / 180)
    const cos2 = Math.cos(this.rotationY * Math.PI / 180)
    const sin2 = Math.sin(this.rotationY * Math.PI / 180)
    
    // 绘制可见的面（简化的3D效果）
    this.drawVisibleFaces(cubeState, cos1, sin1, cos2, sin2)
    
    this.ctx.draw()
  }

  // 绘制可见的面
  drawVisibleFaces(cubeState, cos1, sin1, cos2, sin2) {
    const faceSize = this.cubeSize * 0.8
    const blockSize = faceSize / 3
    
    // 根据旋转角度确定可见的面
    const faces = []
    
    // 前面（绿色中心）
    if (cos2 > 0.1) {
      faces.push({
        name: 'F',
        data: cubeState.F,
        offsetX: 0,
        offsetY: 0,
        depth: faceSize / 2
      })
    }
    
    // 右面（红色中心）
    if (sin2 > 0.1) {
      faces.push({
        name: 'R', 
        data: cubeState.R,
        offsetX: faceSize * 0.7 * sin2,
        offsetY: 0,
        depth: 0
      })
    }
    
    // 上面（白色中心）
    if (cos1 > 0.1) {
      faces.push({
        name: 'U',
        data: cubeState.U,
        offsetX: 0,
        offsetY: -faceSize * 0.7 * cos1,
        depth: 0
      })
    }
    
    // 按深度排序
    faces.sort((a, b) => b.depth - a.depth)
    
    // 绘制每个可见面
    faces.forEach(face => {
      this.drawFace(face.data, face.offsetX, face.offsetY, blockSize)
    })
  }

  // 绘制单个面
  drawFace(faceData, offsetX, offsetY, blockSize) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col
        const color = faceData[index]
        
        const x = this.centerX + offsetX + (col - 1) * blockSize
        const y = this.centerY + offsetY + (row - 1) * blockSize
        
        this.drawBlock(x, y, blockSize, color)
      }
    }
  }

  // 绘制单个方块
  drawBlock(x, y, size, color) {
    const margin = 2
    const blockSize = size - margin * 2
    
    // 绘制方块
    this.ctx.fillStyle = this.colors[color] || this.colors['empty']
    this.ctx.fillRect(x - blockSize/2, y - blockSize/2, blockSize, blockSize)
    
    // 绘制边框
    this.ctx.strokeStyle = color === 'empty' ? '#ddd' : '#333'
    this.ctx.lineWidth = color === 'empty' ? 1 : 2
    this.ctx.strokeRect(x - blockSize/2, y - blockSize/2, blockSize, blockSize)
    
    // 如果是空白方块，绘制虚线
    if (color === 'empty') {
      this.ctx.setLineDash([5, 5])
      this.ctx.strokeStyle = '#ccc'
      this.ctx.strokeRect(x - blockSize/2, y - blockSize/2, blockSize, blockSize)
      this.ctx.setLineDash([])
    }
  }

  // 处理触摸开始
  handleTouchStart(x, y) {
    this.isRotating = true
    this.lastTouchX = x
    this.lastTouchY = y
  }

  // 处理触摸移动
  handleTouchMove(x, y) {
    if (!this.isRotating) return null
    
    const deltaX = x - this.lastTouchX
    const deltaY = y - this.lastTouchY
    const sensitivity = 0.5
    
    // 检查是否是点击（移动距离很小）
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (distance < 10) {
      return this.handleTap(x, y)
    }
    
    // 旋转魔方
    this.rotationY += deltaX * sensitivity
    this.rotationX -= deltaY * sensitivity
    
    // 限制旋转角度
    this.rotationX = Math.max(-60, Math.min(60, this.rotationX))
    
    this.lastTouchX = x
    this.lastTouchY = y
    
    return { type: 'rotate' }
  }

  // 处理触摸结束
  handleTouchEnd() {
    this.isRotating = false
  }

  // 处理点击
  handleTap(x, y) {
    // 检测点击的面和位置
    const face = this.detectClickedFace(x, y)
    if (face) {
      return {
        type: 'click',
        face: face.name,
        position: face.position
      }
    }
    return null
  }

  // 检测点击的面和位置
  detectClickedFace(x, y) {
    const faceSize = this.cubeSize * 0.8
    const blockSize = faceSize / 3
    
    // 计算相对于魔方中心的位置
    const relX = x - this.centerX
    const relY = y - this.centerY
    
    // 简化：只检测前面的点击
    if (Math.abs(relX) < faceSize/2 && Math.abs(relY) < faceSize/2) {
      const col = Math.floor((relX + faceSize/2) / blockSize)
      const row = Math.floor((relY + faceSize/2) / blockSize)
      
      if (col >= 0 && col < 3 && row >= 0 && row < 3) {
        const position = row * 3 + col
        return {
          name: 'F', // 前面
          position: position
        }
      }
    }
    
    return null
  }

  // 销毁渲染器
  destroy() {
    this.isInitialized = false
    this.ctx = null
  }
}

module.exports = CubeRenderer