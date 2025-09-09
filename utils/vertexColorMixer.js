// vertexColorMixer.js - 立方体顶点颜色混合器
class VertexColorMixer {
  constructor() {
    // 立方体8个顶点与相邻面的映射关系（基于新的面布局）
    // front=R(红), right=F(绿), back=L(橙), left=B(蓝), up=U(白), down=D(黄)
    this.vertexFaceMap = {
      'front-top-left': ['R', 'U', 'B'],      // 前上左 (红-白-蓝)
      'front-top-right': ['R', 'U', 'F'],     // 前上右 (红-白-绿)
      'front-bottom-left': ['R', 'D', 'B'],   // 前下左 (红-黄-蓝)
      'front-bottom-right': ['R', 'D', 'F'],  // 前下右 (红-黄-绿)
      'back-top-left': ['L', 'U', 'F'],       // 后上左 (橙-白-绿)
      'back-top-right': ['L', 'U', 'B'],      // 后上右 (橙-白-蓝)
      'back-bottom-left': ['L', 'D', 'F'],    // 后下左 (橙-黄-绿)
      'back-bottom-right': ['L', 'D', 'B']    // 后下右 (橙-黄-蓝)
    }

    // 颜色值映射
    this.colorValues = {
      'empty': [245, 245, 245],
      'white': [255, 255, 255], 
      'yellow': [255, 235, 59],
      'green': [76, 175, 80],
      'blue': [33, 150, 243], 
      'orange': [255, 152, 0],
      'red': [230, 0, 0]
    }
  }

  // 混合三个相邻面的颜色
  mixVertexColor(cubeState, vertexName) {
    const faces = this.vertexFaceMap[vertexName]
    if (!faces) return '#f5f5f5'

    let r = 0, g = 0, b = 0
    let validColors = 0

    faces.forEach(face => {
      // 获取面的中心色块颜色（索引4）
      const faceData = cubeState[face]
      if (faceData && faceData[4]) {
        const color = faceData[4]
        const rgb = this.colorValues[color]
        if (rgb) {
          r += rgb[0]
          g += rgb[1] 
          b += rgb[2]
          validColors++
        }
      }
    })

    if (validColors === 0) return '#f5f5f5'

    // 计算平均值
    r = Math.round(r / validColors)
    g = Math.round(g / validColors)
    b = Math.round(b / validColors)

    return `rgb(${r}, ${g}, ${b})`
  }

  // 获取所有顶点的混合颜色
  getAllVertexColors(cubeState) {
    const colors = {}
    Object.keys(this.vertexFaceMap).forEach(vertex => {
      colors[vertex] = this.mixVertexColor(cubeState, vertex)
    })
    return colors
  }

  // 立方体12条边与相邻面的映射关系（基于新布局）
  edgeFaceMap = {
    // 前面(红色)4条边
    'front-top': ['R', 'U'],      // 前上边 (红-白)
    'front-bottom': ['R', 'D'],   // 前下边 (红-黄)
    'front-left': ['R', 'B'],     // 前左边 (红-蓝)
    'front-right': ['R', 'F'],    // 前右边 (红-绿)
    
    // 后面(橙色)4条边
    'back-top': ['L', 'U'],       // 后上边 (橙-白)
    'back-bottom': ['L', 'D'],    // 后下边 (橙-黄)
    'back-left': ['L', 'F'],      // 后左边 (橙-绿)
    'back-right': ['L', 'B'],     // 后右边 (橙-蓝)
    
    // 中间4条边
    'middle-top-left': ['U', 'B'], // 上左边 (白-蓝)
    'middle-top-right': ['U', 'F'], // 上右边 (白-绿)
    'middle-bottom-left': ['D', 'B'], // 下左边 (黄-蓝)
    'middle-bottom-right': ['D', 'F'] // 下右边 (黄-绿)
  }

  // 混合两个相邻面的颜色（用于边缘）
  mixEdgeColor(cubeState, edgeName) {
    const faces = this.edgeFaceMap[edgeName]
    if (!faces) return '#333'

    let r = 0, g = 0, b = 0
    let validColors = 0

    faces.forEach(face => {
      // 获取面的中心色块颜色（索引4）
      const faceData = cubeState[face]
      if (faceData && faceData[4]) {
        const color = faceData[4]
        const rgb = this.colorValues[color]
        if (rgb) {
          r += rgb[0]
          g += rgb[1] 
          b += rgb[2]
          validColors++
        }
      }
    })

    if (validColors === 0) return '#333'

    // 计算平均值，并稍微调暗（模拟边缘阴影）
    r = Math.round((r / validColors) * 0.8)
    g = Math.round((g / validColors) * 0.8)
    b = Math.round((b / validColors) * 0.8)

    return `rgb(${r}, ${g}, ${b})`
  }

  // 获取所有边缘的混合颜色
  getAllEdgeColors(cubeState) {
    const colors = {}
    Object.keys(this.edgeFaceMap).forEach(edge => {
      colors[edge] = this.mixEdgeColor(cubeState, edge)
    })
    return colors
  }
}

module.exports = VertexColorMixer