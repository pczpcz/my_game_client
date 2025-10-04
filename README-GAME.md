# MMORPG 游戏集成版

基于Electron框架的完整MMORPG游戏客户端，包含悬浮UI控件和游戏场景。

## 🎮 游戏功能

### 核心游戏机制
- **WASD移动控制** - 使用键盘WASD键控制角色移动
- **鼠标控制** - 支持鼠标移动和点击交互
- **实时游戏场景** - Canvas渲染的游戏世界
- **悬浮UI系统** - UI控件悬浮在游戏场景之上

### 游戏场景特性
- 网格地面系统
- 玩家角色渲染
- 角色朝向指示器
- 边界碰撞检测
- 平滑移动动画

### 控制说明
- **W** - 向上移动
- **A** - 向左移动  
- **S** - 向下移动
- **D** - 向右移动
- **I** - 打开/关闭背包
- **Q/W/E/R/T** - 使用技能

## 🛠️ 技术架构

### 前端技术栈
- **React 19** - 用户界面和状态管理
- **Canvas API** - 游戏场景渲染
- **CSS3** - 悬浮UI样式和动画
- **Webpack** - 模块打包和热重载

### Electron集成
- **主进程** - 窗口管理和系统集成
- **渲染进程** - React应用运行环境
- **预加载脚本** - 安全的进程间通信

## 🎯 项目结构

```
src/
├── components/           # UI组件库
│   ├── HealthBar.js     # 血量条组件
│   ├── SkillBar.js      # 技能栏组件  
│   ├── Inventory.js     # 背包组件
│   └── ExperienceBar.js # 经验条组件
├── App.js               # 主应用组件
├── App.css              # 游戏样式
└── index.js             # React入口

electron/
├── main.js              # Electron主进程
├── preload.js           # 预加载脚本
└── render.js            # 渲染进程
```

## 🚀 快速开始

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3002 查看Web版本

### Electron桌面应用
```bash
npm start
```
启动完整的Electron桌面客户端

### 构建生产版本
```bash
npm run build
npm run package
```

## 🎨 UI组件系统

### 悬浮布局设计
- **状态栏** - 顶部居中显示血量和经验
- **技能栏** - 底部居中显示技能图标
- **控制提示** - 右上角显示操作说明
- **背包系统** - 模态弹窗物品管理

### 交互特性
- **指针事件隔离** - UI层不干扰游戏场景
- **键盘快捷键** - 快速访问常用功能
- **拖拽支持** - 背包物品拖拽管理
- **冷却系统** - 技能使用时间限制

## 🎪 游戏循环

### 实时渲染
- 60FPS游戏循环
- Canvas场景重绘
- 角色位置更新
- 碰撞检测

### 状态管理
- 玩家属性（生命、经验、等级）
- 技能冷却计时
- 背包物品状态
- 键盘输入状态

## 🔧 自定义配置

### 游戏参数调整
```javascript
// 在App.js中修改游戏参数
const moveSpeed = 5;        // 移动速度
const playerRadius = 15;    // 玩家角色大小
const gameWidth = 800;      // 游戏场景宽度
const gameHeight = 600;     // 游戏场景高度
```

### UI样式定制
```css
/* 在App.css中修改UI样式 */
.status-bar {
  /* 状态栏样式 */
}

.skill-bar-container {
  /* 技能栏样式 */
}

.control-hints {
  /* 控制提示样式 */
}
```

## 🎯 扩展功能

### 计划中的功能
- [ ] 多人联机支持
- [ ] 怪物和NPC系统
- [ ] 任务系统
- [ ] 地图系统
- [ ] 音效系统
- [ ] 存档系统

### 技术优化
- [ ] WebGL渲染
- [ ] 性能监控
- [ ] 内存优化
- [ ] 网络同步

## 📋 系统要求

### 开发环境
- Node.js 16+
- npm 7+
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）

### 运行环境
- Windows 10/11
- macOS 10.14+
- Linux (Ubuntu 18.04+)

## 🐛 故障排除

### 常见问题
1. **端口占用** - 修改webpack.config.js中的端口号
2. **依赖安装失败** - 清除node_modules后重新安装
3. **Electron启动失败** - 检查系统权限和依赖

### 调试工具
- Chrome DevTools (F12)
- Electron DevTools
- React Developer Tools

## 📄 许可证

ISC License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个游戏项目！

---

**立即体验**: 运行 `npm run dev` 启动开发服务器，或 `npm start` 启动Electron桌面应用！
