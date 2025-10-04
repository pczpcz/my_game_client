# MMORPG UI 组件库

一个使用React构建的MMORPG游戏UI组件库，包含血量条、技能栏、背包、经验条等常用游戏UI组件。

## 功能特性

- 🎮 **血量条组件** - 动态显示生命值，支持颜色变化和尺寸调整
- ⚡ **技能栏组件** - 支持技能冷却、快捷键显示、法力消耗
- 🎒 **背包组件** - 支持物品拖拽、品质显示、数量统计
- 📈 **经验条组件** - 显示等级和经验进度，带有动画效果
- 🎨 **现代化设计** - 渐变色彩、动画效果、响应式布局

## 组件列表

### HealthBar 血量条
```jsx
<HealthBar 
  currentHealth={85}
  maxHealth={100}
  showNumbers={true}
  size="large"
/>
```

### SkillBar 技能栏
```jsx
<SkillBar 
  skills={skills}
  onSkillClick={handleSkillClick}
  activeSkill={activeSkill}
  cooldowns={cooldowns}
  showCooldown={true}
/>
```

### Inventory 背包
```jsx
<Inventory 
  items={inventoryItems}
  onItemClick={handleItemClick}
  onItemDrag={handleItemDrag}
  isOpen={isInventoryOpen}
  onClose={() => setIsInventoryOpen(false)}
  slots={20}
  columns={5}
/>
```

### ExperienceBar 经验条
```jsx
<ExperienceBar 
  currentExp={250}
  maxExp={500}
  level={5}
  showLevel={true}
  showNumbers={true}
/>
```

## 安装和使用

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 启动Electron应用
```bash
npm start
```

## 组件API

### HealthBar Props
| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| currentHealth | number | - | 当前生命值 |
| maxHealth | number | - | 最大生命值 |
| showNumbers | boolean | true | 是否显示数值 |
| size | string | 'medium' | 尺寸：'small', 'medium', 'large', 'xlarge' |

### SkillBar Props
| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| skills | array | [] | 技能数组 |
| onSkillClick | function | - | 技能点击回调 |
| activeSkill | number | null | 当前激活的技能索引 |
| cooldowns | object | {} | 冷却时间对象 |
| showCooldown | boolean | true | 是否显示冷却时间 |

### Inventory Props
| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| items | array | [] | 物品数组 |
| onItemClick | function | - | 物品点击回调 |
| onItemDrag | function | - | 物品拖拽回调 |
| isOpen | boolean | false | 是否打开背包 |
| onClose | function | - | 关闭背包回调 |
| slots | number | 20 | 背包格子数量 |
| columns | number | 5 | 背包列数 |

### ExperienceBar Props
| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| currentExp | number | - | 当前经验值 |
| maxExp | number | - | 升级所需经验值 |
| level | number | 1 | 当前等级 |
| showLevel | boolean | true | 是否显示等级 |
| showNumbers | boolean | true | 是否显示数值 |

## 示例数据

### 技能数据示例
```javascript
const skills = [
  { name: '火球术', keybind: 'Q', manaCost: 10, icon: '🔥' },
  { name: '治疗术', keybind: 'W', manaCost: 15, icon: '💚' },
  { name: '闪电链', keybind: 'E', manaCost: 20, icon: '⚡' },
  { name: '冰霜新星', keybind: 'R', manaCost: 25, icon: '❄️' },
  { name: '召唤宠物', keybind: 'T', manaCost: 30, icon: '🐺' }
];
```

### 物品数据示例
```javascript
const inventoryItems = [
  { name: '治疗药水', quantity: 3, quality: 'uncommon', icon: '🧪' },
  { name: '魔法卷轴', quantity: 1, quality: 'rare', icon: '📜' },
  { name: '铁剑', quantity: 1, quality: 'common', icon: '⚔️' },
  { name: '金戒指', quantity: 1, quality: 'epic', icon: '💍' },
  // ... 更多物品
];
```

## 技术栈

- **React 19** - 用户界面库
- **CSS3** - 样式和动画
- **Webpack** - 模块打包工具
- **Babel** - JavaScript编译器
- **Electron** - 桌面应用框架

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

ISC License

## 贡献

欢迎提交Issue和Pull Request来改进这个组件库！
