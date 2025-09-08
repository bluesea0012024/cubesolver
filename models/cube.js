// cube.js - 魔方数据模型
class CubeModel {
  constructor() {
    // 魔方状态：6个面，每面9个格子
    // 面的顺序：上(U)、下(D)、前(F)、后(B)、左(L)、右(R)
    this.faces = {
      U: new Array(9).fill('empty'), // 上面 - 白色中心
      D: new Array(9).fill('empty'), // 下面 - 黄色中心  
      F: new Array(9).fill('empty'), // 前面 - 绿色中心
      B: new Array(9).fill('empty'), // 后面 - 蓝色中心
      L: new Array(9).fill('empty'), // 左面 - 橙色中心
      R: new Array(9).fill('empty')  // 右面 - 红色中心
    }
    
    // 设置初始中心块颜色
    this.faces.U[4] = 'white'   // 上面中心：白色
    this.faces.D[4] = 'yellow'  // 下面中心：黄色
    this.faces.F[4] = 'green'   // 前面中心：绿色
    this.faces.B[4] = 'blue'    // 后面中心：蓝色
    this.faces.L[4] = 'orange'  // 左面中心：橙色
    this.faces.R[4] = 'red'     // 右面中心：红色
    
    // 颜色映射
    this.colorMap = {
      'empty': 0,
      'white': 1,
      'yellow': 2,
      'green': 3,
      'blue': 4,
      'orange': 5,
      'red': 6
    }
  }

  // 设置某个位置的颜色
  setColor(face, position, color) {
    if (!this.faces[face]) return false
    if (position < 0 || position >= 9) return false
    if (position === 4) return false // 不能修改中心块
    
    this.faces[face][position] = color
    return true
  }

  // 获取某个位置的颜色
  getColor(face, position) {
    if (!this.faces[face]) return null
    if (position < 0 || position >= 9) return null
    return this.faces[face][position]
  }

  // 获取完整状态
  getState() {
    return {
      U: [...this.faces.U],
      D: [...this.faces.D], 
      F: [...this.faces.F],
      B: [...this.faces.B],
      L: [...this.faces.L],
      R: [...this.faces.R]
    }
  }

  // 获取状态字符串（用于求解算法）
  getStateString() {
    let result = ''
    const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B']
    
    faceOrder.forEach(face => {
      this.faces[face].forEach(color => {
        result += this.colorMap[color] || 0
      })
    })
    
    return result
  }

  // 检查是否完成录入
  isComplete() {
    for (let face in this.faces) {
      for (let i = 0; i < 9; i++) {
        if (this.faces[face][i] === 'empty') {
          return false
        }
      }
    }
    return true
  }

  // 获取已完成的面数
  getCompletedFaces() {
    let completed = 0
    for (let face in this.faces) {
      let faceComplete = true
      for (let i = 0; i < 9; i++) {
        if (this.faces[face][i] === 'empty') {
          faceComplete = false
          break
        }
      }
      if (faceComplete) completed++
    }
    return completed
  }

  // 验证魔方状态是否有效
  isValid() {
    if (!this.isComplete()) return false
    
    // 检查每种颜色是否都有9个
    const colorCount = {}
    for (let face in this.faces) {
      this.faces[face].forEach(color => {
        if (color !== 'empty') {
          colorCount[color] = (colorCount[color] || 0) + 1
        }
      })
    }
    
    const validColors = ['white', 'yellow', 'green', 'blue', 'orange', 'red']
    for (let color of validColors) {
      if (colorCount[color] !== 9) {
        return false
      }
    }
    
    return true
  }

  // 重置魔方
  reset() {
    for (let face in this.faces) {
      this.faces[face].fill('empty')
    }
    
    // 重新设置中心块
    this.faces.U[4] = 'white'
    this.faces.D[4] = 'yellow'
    this.faces.F[4] = 'green'
    this.faces.B[4] = 'blue'
    this.faces.L[4] = 'orange'
    this.faces.R[4] = 'red'
  }

  // 复制当前状态
  copy() {
    const newCube = new CubeModel()
    for (let face in this.faces) {
      newCube.faces[face] = [...this.faces[face]]
    }
    return newCube
  }

  // 执行移动（用于求解演示）
  executeMove(move) {
    switch(move) {
      case 'R':
        this.rotateR()
        break
      case 'R\'':
        this.rotateR()
        this.rotateR()
        this.rotateR()
        break
      case 'R2':
        this.rotateR()
        this.rotateR()
        break
      case 'L':
        this.rotateL()
        break
      case 'L\'':
        this.rotateL()
        this.rotateL()
        this.rotateL()
        break
      case 'L2':
        this.rotateL()
        this.rotateL()
        break
      case 'U':
        this.rotateU()
        break
      case 'U\'':
        this.rotateU()
        this.rotateU()
        this.rotateU()
        break
      case 'U2':
        this.rotateU()
        this.rotateU()
        break
      case 'D':
        this.rotateD()
        break
      case 'D\'':
        this.rotateD()
        this.rotateD()
        this.rotateD()
        break
      case 'D2':
        this.rotateD()
        this.rotateD()
        break
      case 'F':
        this.rotateF()
        break
      case 'F\'':
        this.rotateF()
        this.rotateF()
        this.rotateF()
        break
      case 'F2':
        this.rotateF()
        this.rotateF()
        break
      case 'B':
        this.rotateB()
        break
      case 'B\'':
        this.rotateB()
        this.rotateB()
        this.rotateB()
        break
      case 'B2':
        this.rotateB()
        this.rotateB()
        break
    }
  }

  // 旋转操作（简化实现）
  rotateR() {
    // 顺时针旋转右面
    this.rotateFace('R')
    // 旋转相邻面的相关边
    const temp = [this.faces.U[2], this.faces.U[5], this.faces.U[8]]
    this.faces.U[2] = this.faces.F[2]
    this.faces.U[5] = this.faces.F[5]
    this.faces.U[8] = this.faces.F[8]
    this.faces.F[2] = this.faces.D[2]
    this.faces.F[5] = this.faces.D[5]
    this.faces.F[8] = this.faces.D[8]
    this.faces.D[2] = this.faces.B[6]
    this.faces.D[5] = this.faces.B[3]
    this.faces.D[8] = this.faces.B[0]
    this.faces.B[6] = temp[0]
    this.faces.B[3] = temp[1]
    this.faces.B[0] = temp[2]
  }

  rotateL() {
    this.rotateFace('L')
    const temp = [this.faces.U[0], this.faces.U[3], this.faces.U[6]]
    this.faces.U[0] = this.faces.B[8]
    this.faces.U[3] = this.faces.B[5]
    this.faces.U[6] = this.faces.B[2]
    this.faces.B[8] = this.faces.D[0]
    this.faces.B[5] = this.faces.D[3]
    this.faces.B[2] = this.faces.D[6]
    this.faces.D[0] = this.faces.F[0]
    this.faces.D[3] = this.faces.F[3]
    this.faces.D[6] = this.faces.F[6]
    this.faces.F[0] = temp[0]
    this.faces.F[3] = temp[1]
    this.faces.F[6] = temp[2]
  }

  rotateU() {
    this.rotateFace('U')
    const temp = [this.faces.F[0], this.faces.F[1], this.faces.F[2]]
    this.faces.F[0] = this.faces.R[0]
    this.faces.F[1] = this.faces.R[1]
    this.faces.F[2] = this.faces.R[2]
    this.faces.R[0] = this.faces.B[0]
    this.faces.R[1] = this.faces.B[1]
    this.faces.R[2] = this.faces.B[2]
    this.faces.B[0] = this.faces.L[0]
    this.faces.B[1] = this.faces.L[1]
    this.faces.B[2] = this.faces.L[2]
    this.faces.L[0] = temp[0]
    this.faces.L[1] = temp[1]
    this.faces.L[2] = temp[2]
  }

  rotateD() {
    this.rotateFace('D')
    const temp = [this.faces.F[6], this.faces.F[7], this.faces.F[8]]
    this.faces.F[6] = this.faces.L[6]
    this.faces.F[7] = this.faces.L[7]
    this.faces.F[8] = this.faces.L[8]
    this.faces.L[6] = this.faces.B[6]
    this.faces.L[7] = this.faces.B[7]
    this.faces.L[8] = this.faces.B[8]
    this.faces.B[6] = this.faces.R[6]
    this.faces.B[7] = this.faces.R[7]
    this.faces.B[8] = this.faces.R[8]
    this.faces.R[6] = temp[0]
    this.faces.R[7] = temp[1]
    this.faces.R[8] = temp[2]
  }

  rotateF() {
    this.rotateFace('F')
    const temp = [this.faces.U[6], this.faces.U[7], this.faces.U[8]]
    this.faces.U[6] = this.faces.L[8]
    this.faces.U[7] = this.faces.L[5]
    this.faces.U[8] = this.faces.L[2]
    this.faces.L[8] = this.faces.D[2]
    this.faces.L[5] = this.faces.D[1]
    this.faces.L[2] = this.faces.D[0]
    this.faces.D[2] = this.faces.R[0]
    this.faces.D[1] = this.faces.R[3]
    this.faces.D[0] = this.faces.R[6]
    this.faces.R[0] = temp[0]
    this.faces.R[3] = temp[1]
    this.faces.R[6] = temp[2]
  }

  rotateB() {
    this.rotateFace('B')
    const temp = [this.faces.U[0], this.faces.U[1], this.faces.U[2]]
    this.faces.U[0] = this.faces.R[2]
    this.faces.U[1] = this.faces.R[5]
    this.faces.U[2] = this.faces.R[8]
    this.faces.R[2] = this.faces.D[8]
    this.faces.R[5] = this.faces.D[7]
    this.faces.R[8] = this.faces.D[6]
    this.faces.D[8] = this.faces.L[6]
    this.faces.D[7] = this.faces.L[3]
    this.faces.D[6] = this.faces.L[0]
    this.faces.L[6] = temp[0]
    this.faces.L[3] = temp[1]
    this.faces.L[0] = temp[2]
  }

  // 旋转单个面
  rotateFace(face) {
    const f = this.faces[face]
    const temp = f[0]
    f[0] = f[6]
    f[6] = f[8]
    f[8] = f[2]
    f[2] = temp
    
    const temp2 = f[1]
    f[1] = f[3]
    f[3] = f[7]
    f[7] = f[5]
    f[5] = temp2
  }
}

module.exports = CubeModel