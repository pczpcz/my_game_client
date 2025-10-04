import React, { useState, useEffect, useRef } from 'react';
import HealthBar from './components/HealthBar';
import SkillBar from './components/SkillBar';
import Inventory from './components/Inventory';
import ExperienceBar from './components/ExperienceBar';
import NetworkService from './services/NetworkService';
import './App.css';

const App = () => {
  // 网络服务实例
  const networkService = useRef(new NetworkService());
  
  // 玩家状态（从服务器同步）
  const [playerState, setPlayerState] = useState({
    health: 85,
    maxHealth: 100,
    exp: 250,
    maxExp: 500,
    level: 5,
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 }
  });
  
  // 本地输入状态
  const [keysPressed, setKeysPressed] = useState({});
  const [localInput, setLocalInput] = useState({
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 }
  });
  
  // 技能状态
  const [skills, setSkills] = useState([
    { name: '火球术', keybind: 'Q', manaCost: 10, icon: '🔥', id: 'fireball' },
    { name: '治疗术', keybind: 'W', manaCost: 15, icon: '💚', id: 'heal' },
    { name: '闪电链', keybind: 'E', manaCost: 20, icon: '⚡', id: 'lightning' },
    { name: '冰霜新星', keybind: 'R', manaCost: 25, icon: '❄️', id: 'frost' },
    { name: '召唤宠物', keybind: 'T', manaCost: 30, icon: '🐺', id: 'summon' }
  ]);
  const [activeSkill, setActiveSkill] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  
  // 背包状态
  const [inventoryItems, setInventoryItems] = useState([
    { name: '治疗药水', quantity: 3, quality: 'uncommon', icon: '🧪', id: 'potion_heal' },
    { name: '魔法卷轴', quantity: 1, quality: 'rare', icon: '📜', id: 'scroll_magic' },
    { name: '铁剑', quantity: 1, quality: 'common', icon: '⚔️', id: 'sword_iron' },
    { name: '金戒指', quantity: 1, quality: 'epic', icon: '💍', id: 'ring_gold' },
    null, null, null, null, null, null,
    null, null, null, null, null, null,
    null, null, null, null
  ]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // 连接状态
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const gameCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastMoveTimeRef = useRef(0);

  // 初始化网络连接
  useEffect(() => {
    const initNetwork = async () => {
      setConnectionStatus('connecting');
      
      // 注册网络事件处理器
      networkService.current.on('loginSuccess', handleLoginSuccess);
      networkService.current.on('loginFailed', handleLoginFailed);
      networkService.current.on('playerStateUpdate', handlePlayerStateUpdate);
      networkService.current.on('gameStateUpdate', handleGameStateUpdate);
      networkService.current.on('connectionLost', handleConnectionLost);
      networkService.current.on('error', handleNetworkError);
      
      // 连接服务器
      const connected = await networkService.current.connect();
      if (!connected) {
        setConnectionStatus('failed');
      }
    };

    initNetwork();

    return () => {
      // 清理网络连接
      if (networkService.current) {
        networkService.current.disconnect();
      }
    };
  }, []);

  // 网络事件处理函数
  const handleLoginSuccess = (data) => {
    console.log('登录成功:', data);
    setConnectionStatus('connected');
    
    // 初始化玩家状态
    if (data.playerState) {
      setPlayerState(prev => ({ ...prev, ...data.playerState }));
    }
  };

  const handleLoginFailed = (data) => {
    console.error('登录失败:', data);
    setConnectionStatus('failed');
  };

  const handlePlayerStateUpdate = (data) => {
    // 更新玩家状态（从服务器同步）
    setPlayerState(prev => ({
      ...prev,
      health: data.health !== undefined ? data.health : prev.health,
      maxHealth: data.maxHealth !== undefined ? data.maxHealth : prev.maxHealth,
      exp: data.exp !== undefined ? data.exp : prev.exp,
      maxExp: data.maxExp !== undefined ? data.maxExp : prev.maxExp,
      level: data.level !== undefined ? data.level : prev.level,
      position: data.position || prev.position,
      velocity: data.velocity || prev.velocity
    }));

    // 更新技能冷却
    if (data.skillCooldowns) {
      setCooldowns(data.skillCooldowns);
    }

    // 更新背包
    if (data.inventory) {
      setInventoryItems(data.inventory);
    }
  };

  const handleGameStateUpdate = (data) => {
    // 处理游戏全局状态更新
    console.log('游戏状态更新:', data);
  };

  const handleConnectionLost = () => {
    console.error('连接丢失');
    setConnectionStatus('disconnected');
  };

  const handleNetworkError = (data) => {
    console.error('网络错误:', data);
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      setKeysPressed(prev => ({ ...prev, [key]: true }));
      
      // 背包快捷键
      if (key === 'i') {
        setIsInventoryOpen(prev => !prev);
        e.preventDefault();
      }
      
      // 技能快捷键
      if (['q', 'w', 'e', 'r', 't'].includes(key)) {
        const skillIndex = ['q', 'w', 'e', 'r', 't'].indexOf(key);
        handleSkillClick(skills[skillIndex], skillIndex);
      }
    };

    const handleKeyUp = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [skills]);

  // 游戏循环 - 本地输入预测和网络同步
  useEffect(() => {
    const gameLoop = () => {
      // 处理WASD移动输入
      let velocityX = 0;
      let velocityY = 0;
      const moveSpeed = 5;

      if (keysPressed['w']) velocityY -= moveSpeed;
      if (keysPressed['s']) velocityY += moveSpeed;
      if (keysPressed['a']) velocityX -= moveSpeed;
      if (keysPressed['d']) velocityX += moveSpeed;

      // 更新本地输入状态
      const newVelocity = { x: velocityX, y: velocityY };
      const newPosition = {
        x: Math.max(0, Math.min(800, localInput.position.x + velocityX)),
        y: Math.max(0, Math.min(600, localInput.position.y + velocityY))
      };

      setLocalInput({
        position: newPosition,
        velocity: newVelocity
      });

      // 发送移动信息到服务器（节流）
      const now = Date.now();
      if (now - lastMoveTimeRef.current > 100) { // 每100ms发送一次
        if (velocityX !== 0 || velocityY !== 0) {
          networkService.current.sendPlayerMove(newPosition, newVelocity);
          lastMoveTimeRef.current = now;
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [keysPressed, localInput.position]);

  // 绘制游戏场景
  useEffect(() => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const drawGameScene = () => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制背景 - 游戏世界
      ctx.fillStyle = '#1a472a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制网格地面
      ctx.strokeStyle = '#2d5a3d';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // 绘制玩家角色（使用服务器同步的位置）
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(playerState.position.x, playerState.position.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制玩家朝向指示器
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerState.position.x, playerState.position.y);
      ctx.lineTo(playerState.position.x + 25, playerState.position.y);
      ctx.stroke();
      
      // 绘制玩家名称和连接状态
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`玩家 (${connectionStatus})`, playerState.position.x, playerState.position.y - 25);
    };

    drawGameScene();
  }, [playerState.position, connectionStatus]);

  // 处理技能点击
  const handleSkillClick = (skill, index) => {
    if (!skill || !networkService.current.isConnected) return;
    
    console.log(`使用技能: ${skill.name}`);
    setActiveSkill(index);
    
    // 发送技能使用到服务器
    networkService.current.sendPlayerAction('skill_use', null, {
      skillId: skill.id,
      skillName: skill.name
    });
    
    // 本地预测：设置冷却时间
    const cooldownTime = 3; // 3秒冷却
    setCooldowns(prev => ({ ...prev, [index]: cooldownTime }));
  };

  // 处理背包物品点击
  const handleItemClick = (item, index) => {
    if (!item || !networkService.current.isConnected) return;
    
    console.log(`使用物品: ${item.name}`);
    
    // 发送物品使用到服务器
    networkService.current.sendPlayerAction('item_use', null, {
      itemId: item.id,
      itemName: item.name,
      slotIndex: index
    });
  };

  // 处理物品拖拽
  const handleItemDrag = (fromIndex, toIndex, item) => {
    if (!networkService.current.isConnected) return;
    
    // 发送物品移动到服务器
    networkService.current.sendPlayerAction('item_move', null, {
      fromIndex: fromIndex,
      toIndex: toIndex,
      itemId: item.id
    });
  };

  // 冷却时间计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const newCooldowns = { ...prev };
        Object.keys(newCooldowns).forEach(key => {
          if (newCooldowns[key] > 0) {
            newCooldowns[key] -= 1;
          }
        });
        return newCooldowns;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 连接状态显示
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '已连接';
      case 'connecting': return '连接中...';
      case 'disconnected': return '未连接';
      case 'failed': return '连接失败';
      default: return connectionStatus;
    }
  };

  return (
    <div className="game-container">
      {/* 游戏场景画布 */}
      <canvas
        ref={gameCanvasRef}
        className="game-scene"
        width={800}
        height={600}
      />
      
      {/* 悬浮UI层 */}
      <div className="floating-ui">
        {/* 连接状态指示器 */}
        <div className={`connection-status ${connectionStatus}`}>
          {getConnectionStatusText()}
        </div>

        {/* 顶部状态栏 */}
        <div className="status-bar">
          <HealthBar 
            currentHealth={playerState.health} 
            maxHealth={playerState.maxHealth}
            size="large"
          />
          <ExperienceBar 
            currentExp={playerState.exp}
            maxExp={playerState.maxExp}
            level={playerState.level}
            size="large"
          />
        </div>

        {/* 底部技能栏 */}
        <div className="skill-bar-container">
          <SkillBar 
            skills={skills}
            onSkillClick={handleSkillClick}
            activeSkill={activeSkill}
            cooldowns={cooldowns}
            showCooldown={true}
          />
        </div>

        {/* 控制提示 */}
        <div className="control-hints">
          <div className="hint-item">移动: WASD</div>
          <div className="hint-item">背包: I</div>
          <div className="hint-item">技能: QWERT</div>
          <div className="hint-item">状态: {getConnectionStatusText()}</div>
        </div>

        {/* 背包 */}
        <Inventory 
          items={inventoryItems}
          onItemClick={handleItemClick}
          onItemDrag={handleItemDrag}
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          slots={20}
          columns={5}
        />
      </div>
    </div>
  );
};

export default App;
