// cube3DRenderer.js - 立体3D魔方渲染器
class Cube3DRenderer {
  constructor(canvasId, width, height) {
    this.canvasId = canvasId
    this.width = Math.max(width, 300)
    this.height = Math.max(height, 300)
    this.ctx = null
    this.isInitialized = false
    
    console.log('Cube3DRenderer创建:', { canvasId, width: this.width, height: this.height })
    
    // 3D变换参数
    this.rotationX = -15  // X轴旋转角度
    this.rotationY = 25   // Y轴旋转角度
    this.scale = 1.0      // 缩放比例
    this.centerX = width / 2
    this.centerY = height / 2
    
    // 魔方参数 - 调整大小保持正方形
    const minDimension = Math.min(width, height)
    this.cubeSize = minDimension * 0.7  // 减小一点避免变形
    this.blockSize = this.cubeSize / 3
    this.blockGap = 6     // 减小间隙
    
    // 触摸控制
    this.isDragging = false
    this.lastTouchX = 0
    this.lastTouchY = 0
    this.dragSensitivity = 0.3
    
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
    
    // 面的定义（6个面的3D坐标）
    this.faces = {
      // 前面 (Front)
      F: { normal: [0, 0, 1], center: [0, 0, this.cubeSize/2] },
      // 后面 (Back) 
      B: { normal: [0, 0, -1], center: [0, 0, -this.cubeSize/2] },
      // 右面 (Right)
      R: { normal: [1, 0, 0], center: [this.cubeSize/2, 0, 0] },
      // 左面 (Left)
      L: { normal: [-1, 0, 0], center: [-this.cubeSize/2, 0, 0] },
      // 上面 (Up)
      U: { normal: [0, -1, 0], center: [0, -this.cubeSize/2, 0] },
      // 下面 (Down)
      D: { normal: [0, 1, 0], center: [0, this.cubeSize/2, 0] }
    }
  }

  // 初始化渲染器
  async init() {
    return new Promise((resolve, reject) => {
      try {
        console.log('正在创建Canvas上下文:', this.canvasId)
        this.ctx = wx.createCanvasContext(this.canvasId)
        
        if (!this.ctx) {
          console.error('Canvas上下文创建失败')
          reject(new Error('无法创建canvas上下文'))
          return
        }
        
        console.log('Canvas上下文创建成功')
        
        // 设置默认样式
        this.ctx.lineJoin = 'round'
        this.ctx.lineCap = 'round'
        
        // 测试Canvas是否可用
        this.ctx.fillStyle = '#000000'
        this.ctx.fillRect(0, 0, 1, 1)
        this.ctx.draw(false, () => {
          console.log('Canvas测试绘制成功')
          this.isInitialized = true
          resolve()
        })
        
      } catch (error) {
        console.error('Canvas初始化错误:', error)
        reject(error)
      }
    })
  }

  // 3D点变换
  transformPoint(x, y, z) {
    // 旋转变换
    const cosY = Math.cos(this.rotationY * Math.PI / 180)
    const sinY = Math.sin(this.rotationY * Math.PI / 180)
    const cosX = Math.cos(this.rotationX * Math.PI / 180)
    const sinX = Math.sin(this.rotationX * Math.PI / 180)
    
    // Y轴旋转
    let x1 = x * cosY - z * sinY
    let z1 = x * sinY + z * cosY
    let y1 = y
    
    // X轴旋转
    let y2 = y1 * cosX - z1 * sinX
    let z2 = y1 * sinX + z1 * cosX
    let x2 = x1
    
    // 等距投影，避免透视变形
    const projectionScale = 0.6  // 调小一点，避免魔方过大
    
    return {
      x: this.centerX + x2 * projectionScale,
      y: this.centerY + y2 * projectionScale,
      z: z2,
      scale: projectionScale,
      visible: true  // 等距投影下所有点都可见
    }
  }

  // 计算面的可见性
  isFaceVisible(faceKey) {
    const face = this.faces[faceKey]
    const normal = this.rotateVector(face.normal)
    // 如果法向量的Z分量为正，则面向观察者可见
    return normal[2] > 0.1
  }

  // 旋转向量
  rotateVector(vector) {
    const [x, y, z] = vector
    const cosY = Math.cos(this.rotationY * Math.PI / 180)
    const sinY = Math.sin(this.rotationY * Math.PI / 180)
    const cosX = Math.cos(this.rotationX * Math.PI / 180)
    const sinX = Math.sin(this.rotationX * Math.PI / 180)
    
    // Y轴旋转
    const x1 = x * cosY - z * sinY
    const z1 = x * sinY + z * cosY
    const y1 = y
    
    // X轴旋转
    const y2 = y1 * cosX - z1 * sinX
    const z2 = y1 * sinX + z1 * cosX
    
    return [x1, y2, z2]
  }

  // 渲染魔方
  render(cubeState) {
    if (!this.isInitialized || !this.ctx) {
      console.warn('渲染器未初始化')
      return
    }
    
    try {
      // 清空画布
      this.ctx.clearRect(0, 0, this.width, this.height)
      
      // 绘制背景
      this.ctx.fillStyle = '#f0f0f0'
      this.ctx.fillRect(0, 0, this.width, this.height)
      
      // 收集所有要绘制的面片
      const drawList = []
      
      Object.keys(this.faces).forEach(faceKey => {
        if (this.isFaceVisible(faceKey)) {
          const faceData = cubeState[faceKey]
          if (faceData && Array.isArray(faceData)) {
            const faceBlocks = this.generateFaceBlocks(faceKey, faceData)
            drawList.push(...faceBlocks)
          }
        }
      })
      
      // 按Z深度排序
      drawList.sort((a, b) => a.depth - b.depth)
      
      // 绘制所有面片
      drawList.forEach(block => {
        this.drawBlock(block)
      })
      
      // 最终绘制到屏幕
      this.ctx.draw()
      
    } catch (error) {
      console.error('渲染魔方错误:', error)
    }
  }

  // 生成面的所有格子
  generateFaceBlocks(faceKey, faceData) {
    const face = this.faces[faceKey]
    const blocks = []
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col
        const color = faceData[index]
        
        // 计算格子在3D空间中的位置
        const blockPos = this.getFaceBlockPosition(faceKey, row, col)
        const corners = this.getFaceBlockCorners(faceKey, blockPos)
        
        // 变换所有角点
        const transformedCorners = corners.map(corner => 
          this.transformPoint(corner.x, corner.y, corner.z)
        ).filter(corner => corner.visible)
        
        if (transformedCorners.length >= 4) {
          // 计算平均深度用于排序
          const avgDepth = transformedCorners.reduce((sum, corner) => sum + corner.z, 0) / transformedCorners.length
          
          blocks.push({
            faceKey,
            row,
            col,
            color,
            corners: transformedCorners,
            depth: avgDepth,
            center: this.transformPoint(blockPos.x, blockPos.y, blockPos.z)
          })
        }
      }
    }
    
    return blocks
  }

  // 获取面上格子的3D位置
  getFaceBlockPosition(faceKey, row, col) {
    const face = this.faces[faceKey]
    const blockSize = this.blockSize
    
    // 计算在面上的相对位置
    const localX = (col - 1) * blockSize
    const localY = (row - 1) * blockSize
    
    // 根据面的方向计算3D位置
    switch(faceKey) {
      case 'F': // 前面
        return { x: localX, y: localY, z: this.cubeSize/2 }
      case 'B': // 后面
        return { x: -localX, y: localY, z: -this.cubeSize/2 }
      case 'R': // 右面
        return { x: this.cubeSize/2, y: localY, z: -localX }
      case 'L': // 左面
        return { x: -this.cubeSize/2, y: localY, z: localX }
      case 'U': // 上面
        return { x: localX, y: -this.cubeSize/2, z: -localY }
      case 'D': // 下面
        return { x: localX, y: this.cubeSize/2, z: localY }
      default:
        return { x: 0, y: 0, z: 0 }
    }
  }

  // 获取格子的四个角点
  getFaceBlockCorners(faceKey, centerPos) {
    const halfSize = this.blockSize / 2 - this.blockGap / 2
    const corners = []
    
    switch(faceKey) {
      case 'F': // 前面 - 保证是正方形
        corners.push(
          { x: centerPos.x - halfSize, y: centerPos.y - halfSize, z: centerPos.z },
          { x: centerPos.x + halfSize, y: centerPos.y - halfSize, z: centerPos.z },
          { x: centerPos.x + halfSize, y: centerPos.y + halfSize, z: centerPos.z },
          { x: centerPos.x - halfSize, y: centerPos.y + halfSize, z: centerPos.z }
        )
        break
      case 'B': // 后面 - 保证是正方形
        corners.push(
          { x: centerPos.x + halfSize, y: centerPos.y - halfSize, z: centerPos.z },
          { x: centerPos.x - halfSize, y: centerPos.y - halfSize, z: centerPos.z },
          { x: centerPos.x - halfSize, y: centerPos.y + halfSize, z: centerPos.z },
          { x: centerPos.x + halfSize, y: centerPos.y + halfSize, z: centerPos.z }
        )
        break
      case 'R': // 右面 - 保证是正方形
        corners.push(
          { x: centerPos.x, y: centerPos.y - halfSize, z: centerPos.z - halfSize },
          { x: centerPos.x, y: centerPos.y - halfSize, z: centerPos.z + halfSize },
          { x: centerPos.x, y: centerPos.y + halfSize, z: centerPos.z + halfSize },
          { x: centerPos.x, y: centerPos.y + halfSize, z: centerPos.z - halfSize }
        )
        break
      case 'L': // 左面 - 保证是正方形
        corners.push(
          { x: centerPos.x, y: centerPos.y - halfSize, z: centerPos.z + halfSize },
          { x: centerPos.x, y: centerPos.y - halfSize, z: centerPos.z - halfSize },
          { x: centerPos.x, y: centerPos.y + halfSize, z: centerPos.z - halfSize },
          { x: centerPos.x, y: centerPos.y + halfSize, z: centerPos.z + halfSize }
        )
        break
      case 'U': // 上面 - 保证是正方形
        corners.push(
          { x: centerPos.x - halfSize, y: centerPos.y, z: centerPos.z + halfSize },
          { x: centerPos.x + halfSize, y: centerPos.y, z: centerPos.z + halfSize },
          { x: centerPos.x + halfSize, y: centerPos.y, z: centerPos.z - halfSize },
          { x: centerPos.x - halfSize, y: centerPos.y, z: centerPos.z - halfSize }
        )
        break
      case 'D': // 下面 - 保证是正方形
        corners.push(
          { x: centerPos.x - halfSize, y: centerPos.y, z: centerPos.z - halfSize },
          { x: centerPos.x + halfSize, y: centerPos.y, z: centerPos.z - halfSize },
          { x: centerPos.x + halfSize, y: centerPos.y, z: centerPos.z + halfSize },
          { x: centerPos.x - halfSize, y: centerPos.y, z: centerPos.z + halfSize }
        )
        break
    }
    
    return corners
  }

  // 绘制单个格子
  drawBlock(block) {
    const { color, corners, faceKey } = block
    
    if (corners.length < 4) return
    
    // 绘制填充
    this.ctx.beginPath()
    this.ctx.moveTo(corners[0].x, corners[0].y)
    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y)
    }
    this.ctx.closePath()
    
    // 根据面的方向调整亮度（简单的光照效果）
    let baseColor = this.colors[color] || this.colors['empty']
    let adjustedColor = this.adjustColorBrightness(baseColor, faceKey)
    
    this.ctx.fillStyle = adjustedColor
    this.ctx.fill()
    
    // 绘制边框
    this.ctx.strokeStyle = color === 'empty' ? '#ddd' : '#000'
    this.ctx.lineWidth = color === 'empty' ? 1.5 : 2
    this.ctx.stroke()
    
    // 如果是空白格子，绘制虚线边框（微信小程序兼容版本）
    if (color === 'empty') {
      // 微信小程序可能不支持setLineDash，用简单的边框代替
      this.ctx.strokeStyle = '#ccc'
      this.ctx.lineWidth = 1
      this.ctx.stroke()
    }
    
    // 添加高光效果
    if (color !== 'empty') {
      this.drawHighlight(corners)
    }
  }

  // 调整颜色亮度（模拟光照）
  adjustColorBrightness(color, faceKey) {
    if (color === '#f5f5f5') return color // 空白格子不调整
    
    // 根据面的方向调整亮度
    let factor = 1.0
    switch(faceKey) {
      case 'U': factor = 1.1; break  // 上面最亮
      case 'F': factor = 1.0; break  // 前面正常
      case 'R': factor = 0.85; break // 右面较暗
      case 'L': factor = 0.75; break // 左面更暗
      case 'D': factor = 0.7; break  // 下面最暗
      case 'B': factor = 0.8; break  // 后面较暗
    }
    
    // 解析颜色并调整亮度
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    const newR = Math.min(255, Math.floor(r * factor))
    const newG = Math.min(255, Math.floor(g * factor))
    const newB = Math.min(255, Math.floor(b * factor))
    
    return `rgb(${newR}, ${newG}, ${newB})`
  }

  // 绘制高光效果
  drawHighlight(corners) {
    if (corners.length < 4) return
    
    // 绘制左上角的高光
    const highlightSize = 0.3
    const x1 = corners[0].x + (corners[1].x - corners[0].x) * highlightSize
    const y1 = corners[0].y + (corners[3].y - corners[0].y) * highlightSize
    const x2 = corners[1].x + (corners[0].x - corners[1].x) * highlightSize
    const y2 = corners[1].y + (corners[2].y - corners[1].y) * highlightSize
    const x3 = corners[3].x + (corners[2].x - corners[3].x) * highlightSize
    const y3 = corners[3].y + (corners[0].y - corners[3].y) * highlightSize
    
    this.ctx.beginPath()
    this.ctx.moveTo(corners[0].x, corners[0].y)
    this.ctx.lineTo(x1, corners[0].y)
    this.ctx.lineTo(x3, y3)
    this.ctx.lineTo(corners[0].x, y1)
    this.ctx.closePath()
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.globalAlpha = 0.3
    this.ctx.fill()
    this.ctx.globalAlpha = 1.0
  }

  // 处理触摸开始
  handleTouchStart(x, y) {
    this.isDragging = true
    this.lastTouchX = x
    this.lastTouchY = y
  }

  // 处理触摸移动
  handleTouchMove(x, y) {
    if (!this.isDragging) return null
    
    const deltaX = x - this.lastTouchX
    const deltaY = y - this.lastTouchY
    
    // 检查是否是点击（移动距离很小）
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (distance < 8) {
      return null // 太小的移动忽略，提高点击准确性
    }
    
    // 更新旋转角度 - 优化灵敏度
    this.rotationY += deltaX * this.dragSensitivity
    this.rotationX -= deltaY * this.dragSensitivity
    
    // 限制旋转角度范围，防止过度旋转
    this.rotationX = Math.max(-75, Math.min(75, this.rotationX))
    
    // 保持Y轴旋转在合理范围内
    if (this.rotationY > 360) this.rotationY -= 360
    if (this.rotationY < -360) this.rotationY += 360
    
    this.lastTouchX = x
    this.lastTouchY = y
    
    return { type: 'rotate' }
  }

  // 处理触摸结束
  handleTouchEnd(x, y) {
    if (!this.isDragging) return null
    
    const wasJustStarted = this.isDragging
    this.isDragging = false
    
    // 计算从开始到结束的总移动距离
    const startDeltaX = x - this.lastTouchX
    const startDeltaY = y - this.lastTouchY
    const totalDistance = Math.sqrt(startDeltaX * startDeltaX + startDeltaY * startDeltaY)
    
    // 如果移动距离很小，视为点击而不是拖拽
    if (totalDistance < 15) {
      return this.handleTap(x, y)
    }
    
    return null
  }

  // 处理点击
  handleTap(x, y) {
    // 检测点击的格子
    const clickedBlock = this.detectClickedBlock(x, y)
    if (clickedBlock) {
      return {
        type: 'click',
        face: clickedBlock.faceKey,
        row: clickedBlock.row,
        col: clickedBlock.col,
        position: clickedBlock.row * 3 + clickedBlock.col
      }
    }
    return null
  }

  // 检测点击的格子
  detectClickedBlock(x, y) {
    // 遍历所有可见的格子，找到最接近点击点的格子
    let closestBlock = null
    let minDistance = Infinity
    
    // 获取当前可见的面，按深度排序（最前面的优先）
    const visibleFaces = Object.keys(this.faces)
      .filter(faceKey => this.isFaceVisible(faceKey))
      .map(faceKey => {
        const face = this.faces[faceKey]
        const center = this.transformPoint(face.center[0], face.center[1], face.center[2])
        return { faceKey, depth: center.z }
      })
      .sort((a, b) => b.depth - a.depth) // 深度从大到小排序，越大越靠前
    
    // 优先检测最前面的面
    for (const { faceKey } of visibleFaces) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const blockPos = this.getFaceBlockPosition(faceKey, row, col)
          const center = this.transformPoint(blockPos.x, blockPos.y, blockPos.z)
          
          if (center.visible) {
            const distance = Math.sqrt(
              Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
            )
            
            // 调整点击检测范围，考虑缩放比例
            const clickRadius = this.blockSize * center.scale * 0.55
            
            if (distance < clickRadius && distance < minDistance) {
              minDistance = distance
              closestBlock = { faceKey, row, col }
              
              // 如果找到了很近的点击，直接返回（优先前面的面）
              if (distance < clickRadius * 0.7) {
                return closestBlock
              }
            }
          }
        }
      }
    }
    
    return closestBlock
  }

  // 销毁渲染器
  destroy() {
    this.isInitialized = false
    this.ctx = null
  }
}

module.exports = Cube3DRenderer