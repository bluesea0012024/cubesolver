// hybridCube.js - 混合渲染魔方组件
const AdvancedCubeRenderer = require('../../utils/advancedCubeRenderer.js')

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
    perspective: 1000,
    
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
      'red': '#f44336'
    },
    
    // 性能优化相关
    animationFrameId: null,
    lastRenderTime: 0,
    renderPending: false,
    
    // 高级渲染器
    advancedRenderer: null
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
      // 初始化高级渲染器
      this.setData({
        advancedRenderer: new AdvancedCubeRenderer()
      })
      this.initCanvases()
      
      // 如果已经有cubeState数据，立即渲染
      if (this.data.cubeState) {
        setTimeout(() => {
          this.renderAllFaces()
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
      if (!this.data.cubeState) return
      
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
        if (this.data.cubeState[faceKey]) {
          this.renderFace(faceName, this.data.cubeState[faceKey])
        }
      })
    },

    // 渲染单个面 - 优化版本
    renderFace(faceName, faceData) {
      const ctx = this.data.canvasContexts[faceName]
      if (!ctx || !faceData) {
        console.warn(`无法渲染面 ${faceName}:`, { ctx: !!ctx, faceData: !!faceData })
        return
      }

      console.log(`渲染面 ${faceName}:`, faceData)
      
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
            
            // 绘制格子背景
            ctx.fillStyle = this.data.colors[color] || this.data.colors['empty']
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
  }
});