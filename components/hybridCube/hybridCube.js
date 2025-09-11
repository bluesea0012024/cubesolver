// hybridCube.js - 混合渲染魔方组件
const AdvancedCubeRenderer = require('../../utils/advancedCubeRenderer.js')
const VertexColorMixer = require('../../utils/vertexColorMixer.js')

Component({
  properties: {
    // 魔方状态数据
    cubeState: {
      type: Object,
      value: null,
      observer: function(newVal, oldVal) {
        // The view will automatically update when cubeState changes.
        // We can add logging here if needed.
        if (newVal) {
          console.log('cubeState updated, view will re-render.');
        }
      }
    },
    // 选中的颜色
    selectedColor: {
      type: String,
      value: 'R' // Default to Red
    },
    // 是否显示调试信息
    showDebug: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 3D旋转角度
    rotateX: -15,
    rotateY: 25,
    // 只保留旋转变换，perspective已移至WXSS
    transform: 'rotateX(-15deg) rotateY(25deg)',
    
    // 触摸控制
    isDragging: false,
    lastTouchX: 0,
    lastTouchY: 0,
    dragSensitivity: 0.5,
    
    // Canvas管理
    canvasContexts: {},
    readyCanvasCount: 0,
    componentId: '',
    
    // 颜色定义
    colors: {
      'empty': '#f5f5f5',
      'white': '#ffffff',
      'yellow': '#ffeb3b', 
      'green': '#4caf50',
      'blue': '#2196f3',
      'orange': '#ff9800',
      'red': '#f44336',
      // 面标识符映射
      'U': '#ffffff',    // 上面 - 白色
      'D': '#ffeb3b',    // 下面 - 黄色
      'F': '#4caf50',    // 前面 - 绿色
      'B': '#2196f3',    // 后面 - 蓝色
      'L': '#ff9800',    // 左面 - 橙色
      'R': '#f44336'     // 右面 - 红色
    },
    
    // 性能优化相关
    animationFrameId: null,
    lastRenderTime: 0,
    renderPending: false,
    
    // 高级渲染器
    advancedRenderer: null,
    
    // 顶点颜色混合器
    vertexColorMixer: null,
    
    // 顶点位置数据
    vertexPositions: [],
    
    
    // 立方体尺寸
    cubeSize: 480
  },

  observers: {
    'rotateX, rotateY': function(rotateX, rotateY) {
      this.setData({
        // 只更新旋转变换
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      });
      
      // 更新顶点位置
      this.updateVertexPositions(rotateX, rotateY);
    },
    
    'cubeState': function(newCubeState) {
      if (newCubeState) {
        console.log('HybridCube收到新状态数据:', newCubeState)
        
        // HybridCube使用CSS类名渲染，数据更新会自动触发重新渲染
        // 只需要更新顶点颜色
        this.updateVertexColors()
      }
    }
  },

  lifetimes: {
    created() {
      // 生成唯一组件ID
      this.setData({
        componentId: 'cube_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      })
      console.log('HybridCube组件创建:', this.data.componentId)
    },

    ready() {
      console.log('HybridCube组件准备完毕')
      // 初始化高级渲染器和顶点颜色混合器
      this.setData({
        advancedRenderer: new AdvancedCubeRenderer(),
        vertexColorMixer: new VertexColorMixer()
      })
      this.initCanvases()
      
      // 初始化顶点位置
      this.updateVertexPositions(this.data.rotateX, this.data.rotateY)
      
      // 如果已经有cubeState数据，立即渲染
      if (this.data.cubeState) {
        setTimeout(() => {
          this.renderAllFaces()
          this.updateVertexColors()
        }, 100)
      }
    },

    detached() {
      console.log('HybridCube组件销毁')
      // 清理动画帧
      if (this.data.animationFrameId) {
        cancelAnimationFrame(this.data.animationFrameId)
      }
      // 清理高级渲染器
      if (this.data.advancedRenderer) {
        this.data.advancedRenderer.destroy()
      }
      this.data.canvasContexts = {}
    }
  },

  methods: {
    // 初始化Canvas
    initCanvases() {
      const faces = ['front', 'back', 'left', 'right', 'up', 'down']
      let readyCount = 0
      
      faces.forEach(face => {
        const canvasId = `face-${face}-${this.data.componentId}`
        console.log('初始化Canvas:', canvasId)
        
        try {
          const ctx = wx.createCanvasContext(canvasId, this)
          if (ctx) {
            this.data.canvasContexts[face] = ctx
            readyCount++
            console.log(`Canvas ${face} 初始化成功`)
          }
        } catch (error) {
          console.error(`Canvas ${face} 初始化失败:`, error)
        }
      })
      
      this.setData({ 
        readyCanvasCount: readyCount 
      })
    },

    // Canvas准备回调
    onCanvasReady(e) {
      const face = e.currentTarget.dataset.face
      console.log('Canvas准备完成:', face)
    },

    // 渲染所有面 - 优化版本
    renderAllFaces() {
      if (!this.data.cubeState) {
        console.warn('renderAllFaces: 没有cubeState数据')
        return
      }
      
      console.log('开始渲染所有面, cubeState:', this.data.cubeState)
      
      const faceMap = {
        'front': 'F',
        'back': 'B', 
        'left': 'L',
        'right': 'R',
        'up': 'U',
        'down': 'D'
      }
      
      Object.keys(faceMap).forEach(faceName => {
        const faceKey = faceMap[faceName]
        const faceData = this.data.cubeState[faceKey]
        console.log(`准备渲染面 ${faceName} (${faceKey}):`, faceData)
        
        if (faceData && Array.isArray(faceData) && faceData.length === 9) {
          this.renderFace(faceName, faceData)
        } else {
          console.warn(`面 ${faceName} 数据无效:`, faceData)
        }
      })
    },

    // 渲染单个面 - 优化版本
    renderFace(faceName, faceData) {
      const ctx = this.data.canvasContexts[faceName]
      if (!ctx || !faceData) {
        console.warn(`无法渲染面 ${faceName}:`, { ctx: !!ctx, faceData: !!faceData, canvasContexts: Object.keys(this.data.canvasContexts) })
        return
      }

      console.log(`渲染面 ${faceName}:`, faceData)
      console.log(`Canvas上下文状态:`, typeof ctx, ctx.constructor?.name)
      
      try {
        // 清空Canvas
        ctx.clearRect(0, 0, 400, 400)
        
        // 绘制黑色背景填充间隙
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, 400, 400)
        
        // 绘制3x3网格
        const blockSize = 400 / 3
        const gap = 8
        
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const index = row * 3 + col
            const color = faceData[index] || 'empty'
            
            const x = col * blockSize + gap
            const y = row * blockSize + gap
            const size = blockSize - gap * 2
            
            // 调试颜色映射
            const colorValue = this.data.colors[color] || this.data.colors['empty']
            console.log(`面 ${faceName} 位置 ${index}: 颜色=${color}, 颜色值=${colorValue}`)
            
            // 绘制格子背景
            ctx.fillStyle = colorValue
            ctx.fillRect(x, y, size, size)
            
            // 绘制边框
            ctx.strokeStyle = color === 'empty' ? '#ddd' : '#333'
            ctx.lineWidth = color === 'empty' ? 1 : 2
            ctx.strokeRect(x, y, size, size)
            
          }
        }
        
        // 提交绘制
        ctx.draw(false, () => {
          console.log(`面 ${faceName} 绘制完成`)
        })
        
      } catch (error) {
        console.error(`渲染面 ${faceName} 出错:`, error)
      }
    },

    // 更新旋转角度（由WXS调用）
    updateRotation(e) {
      const { deltaX, deltaY } = e;
      
      const newRotateY = this.data.rotateY + deltaX * this.data.dragSensitivity;
      const newRotateX = Math.max(-60, Math.min(60, 
        this.data.rotateX - deltaY * this.data.dragSensitivity
      ));
      
      this.setData({
        rotateX: newRotateX,
        rotateY: newRotateY
      });
    },

    // 处理点击（由WXS调用）
    handleTap(e) {
      // This is called on fast taps from WXS, but we will use onStickerClick
      // to get data about which sticker was clicked.
      console.log('Tap detected on cube background:', e);
    },

    onStickerClick(e) {
      const { face, index } = e.currentTarget.dataset;
      console.log(`Sticker clicked: face=${face}, index=${index}`);

      this.triggerEvent('cubeClick', {
        face: face,
        index: parseInt(index, 10),
        color: this.data.selectedColor
      });
    },

    // 触摸开始（保留作为备用）
    onTouchStart(e) {
      const touch = e.touches[0];
      this.setData({
        isDragging: true,
        lastTouchX: touch.clientX,
        lastTouchY: touch.clientY
      });
    },

    // 触摸移动（保留作为备用）
    onTouchMove(e) {
      if (!this.data.isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.data.lastTouchX;
      const deltaY = touch.clientY - this.data.lastTouchY;
      
      const newRotateY = this.data.rotateY + deltaX * this.data.dragSensitivity;
      const newRotateX = Math.max(-60, Math.min(60, 
        this.data.rotateX - deltaY * this.data.dragSensitivity
      ));
      
      this.setData({
        rotateX: newRotateX,
        rotateY: newRotateY,
        lastTouchX: touch.clientX,
        lastTouchY: touch.clientY
      });
    },

    // 触摸结束（保留作为备用）
    onTouchEnd(e) {
      this.setData({
        isDragging: false
      });
      
      const touch = e.changedTouches[0];
      // Check if it was a tap (very little movement)
      // This logic is now mainly handled by WXS, but we keep it as a fallback
      // and for potential non-WXS use.
      const startX = this.data.lastTouchX; // We need to store initial touch position for this to be accurate
      const startY = this.data.lastTouchY;
      // A proper implementation would store onTouchStart positions and compare here.
      // For now, WXS handles taps.
    },

    // 更新顶点位置（高性能版本）
    updateVertexPositions(rotateX, rotateY) {
      const vertexNames = [
        'front-top-left', 'front-top-right', 'front-bottom-left', 'front-bottom-right',
        'back-top-left', 'back-top-right', 'back-bottom-left', 'back-bottom-right'
      ]
      
      const halfSize = this.data.cubeSize / 2
      const radX = rotateX * Math.PI / 180
      const radY = rotateY * Math.PI / 180
      
      const vertices = [
        [-halfSize, -halfSize, halfSize],   // 前上左
        [halfSize, -halfSize, halfSize],    // 前上右
        [-halfSize, halfSize, halfSize],    // 前下左
        [halfSize, halfSize, halfSize],     // 前下右
        [-halfSize, -halfSize, -halfSize],  // 后上左
        [halfSize, -halfSize, -halfSize],   // 后上右
        [-halfSize, halfSize, -halfSize],   // 后下左
        [halfSize, halfSize, -halfSize]     // 后下右
      ]
      
      const positions = vertices.map((vertex, index) => {
        const [x, y, z] = vertex
        
        // 绕Y轴旋转
        const x1 = x * Math.cos(radY) + z * Math.sin(radY)
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY)
        
        // 绕X轴旋转
        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX)
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX)
        
        // 透视投影
        const perspective = 1200
        const scale = perspective / (perspective + z2)
        
        const projectedX = x1 * scale
        const projectedY = y2 * scale
        
        // 获取当前顶点颜色
        const vertexName = vertexNames[index]
        const vertexColor = this.getVertexColor(vertexName)
        
        // 超精确的顶点可见性：基于3个坐标轴的绝对位置判断
        const isAtXEdge = Math.abs(Math.abs(x1) - halfSize) < 50  // X轴边缘
        const isAtYEdge = Math.abs(Math.abs(y2) - halfSize) < 50  // Y轴边缘  
        const isAtZEdge = Math.abs(Math.abs(z2) - halfSize) < 50  // Z轴边缘
        
        // 只有在3个轴都接近边缘时才显示（真正的立方体顶点）
        const isRealVertex = isAtXEdge && isAtYEdge && isAtZEdge
        const isInFrontEnough = z2 > -halfSize * 0.7
        const isVisible = isRealVertex && isInFrontEnough
        
        return {
          visible: isVisible,
          color: vertexColor,
          style: `
            transform: translate(${projectedX}rpx, ${projectedY}rpx) translate(-50%, -50%);
            z-index: ${Math.max(1, Math.round((z2 + halfSize) / 10))};
          `
        }
      })
      
      this.setData({
        vertexPositions: positions
      })
    },

    // 获取顶点颜色
    getVertexColor(vertexName) {
      if (!this.data.vertexColorMixer || !this.data.cubeState) {
        return '#f5f5f5'
      }
      return this.data.vertexColorMixer.mixVertexColor(this.data.cubeState, vertexName)
    },

    // 更新所有顶点颜色
    updateVertexColors() {
      this.updateVertexPositions(this.data.rotateX, this.data.rotateY)
    },

    // 动画执行方法（给solver页面调用）
    animateMove(move, duration = 400) {
      return new Promise((resolve) => {
        console.log(`执行动画: ${move}, 时长: ${duration}ms`)
        
        // 简化动画：通过快速轻微摆动来模拟转动效果
        const originalRotateX = this.data.rotateX
        const originalRotateY = this.data.rotateY
        
        // 第一阶段：轻微摆动
        const swingDuration = duration * 0.3
        const swingAngle = 10
        
        this.setData({
          rotateX: originalRotateX + swingAngle,
          rotateY: originalRotateY + swingAngle,
          transform: `rotateX(${originalRotateX + swingAngle}deg) rotateY(${originalRotateY + swingAngle}deg)`
        })
        
        setTimeout(() => {
          // 第二阶段：回归原位
          this.setData({
            rotateX: originalRotateX,
            rotateY: originalRotateY,
            transform: `rotateX(${originalRotateX}deg) rotateY(${originalRotateY}deg)`
          })
          
          setTimeout(() => {
            resolve()
          }, duration * 0.7)
          
        }, swingDuration)
      })
    }

  }
});