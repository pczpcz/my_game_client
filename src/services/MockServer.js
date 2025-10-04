// 模拟C++服务器 - 用于测试网络通信
class MockServer {
  constructor() {
    this.connectedClients = new Map();
    this.gameState = {
      players: new Map(),
      gameTime: 0
    };
    
    // 模拟服务器响应
    setInterval(() => {
      this.broadcastGameState();
    }, 100); // 每100ms广播一次游戏状态
  }

  // 处理客户端消息
  handleClientMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 1: // LOGIN
          this.handleLogin(clientId, data);
          break;
        case 3: // HEARTBEAT
          this.handleHeartbeat(clientId, data);
          break;
        case 6: // PLAYER_MOVE
          this.handlePlayerMove(clientId, data);
          break;
        case 7: // PLAYER_ACTION
          this.handlePlayerAction(clientId, data);
          break;
        default:
          console.log(`未知消息类型: ${data.type}`);
      }
    } catch (error) {
      console.error('处理客户端消息失败:', error);
    }
  }

  // 处理登录
  handleLogin(clientId, data) {
    console.log(`客户端 ${clientId} 登录:`, data);
    
    // 创建玩家状态
    const playerState = {
      playerId: clientId,
      health: 100,
      maxHealth: 100,
      exp: 0,
      maxExp: 100,
      level: 1,
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      skillCooldowns: {},
      inventory: this.generateInitialInventory()
    };
    
    this.connectedClients.set(clientId, {
      lastHeartbeat: Date.now(),
      playerState: playerState
    });
    
    this.gameState.players.set(clientId, playerState);
    
    // 发送登录响应
    this.sendToClient(clientId, {
      type: 2, // LOGIN_RESPONSE
      success: true,
      playerId: clientId,
      playerState: playerState,
      timestamp: Date.now()
    });
    
    console.log(`玩家 ${clientId} 登录成功`);
  }

  // 处理心跳
  handleHeartbeat(clientId, data) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.lastHeartbeat = Date.now();
      
      // 发送心跳响应
      this.sendToClient(clientId, {
        type: 4, // HEARTBEAT_RESPONSE
        timestamp: Date.now()
      });
    }
  }

  // 处理玩家移动
  handlePlayerMove(clientId, data) {
    const client = this.connectedClients.get(clientId);
    if (!client) return;

    // 更新玩家位置（服务器验证和同步）
    const playerState = client.playerState;
    playerState.position = data.position;
    playerState.velocity = data.velocity;
    
    // 边界检查
    playerState.position.x = Math.max(0, Math.min(800, playerState.position.x));
    playerState.position.y = Math.max(0, Math.min(600, playerState.position.y));
    
    // 更新游戏状态
    this.gameState.players.set(clientId, playerState);
    
    console.log(`玩家 ${clientId} 移动到:`, data.position);
  }

  // 处理玩家动作
  handlePlayerAction(clientId, data) {
    const client = this.connectedClients.get(clientId);
    if (!client) return;

    const playerState = client.playerState;
    
    switch (data.actionType) {
      case 'skill_use':
        this.handleSkillUse(clientId, data, playerState);
        break;
      case 'item_use':
        this.handleItemUse(clientId, data, playerState);
        break;
      case 'item_move':
        this.handleItemMove(clientId, data, playerState);
        break;
      default:
        console.log(`未知动作类型: ${data.actionType}`);
    }
  }

  // 处理技能使用
  handleSkillUse(clientId, data, playerState) {
    console.log(`玩家 ${clientId} 使用技能:`, data.skillName);
    
    // 模拟技能效果
    let skillEffect = {};
    switch (data.skillId) {
      case 'heal':
        // 治疗术：恢复生命值
        playerState.health = Math.min(playerState.maxHealth, playerState.health + 20);
        skillEffect = { healthChange: 20 };
        break;
      case 'fireball':
        // 火球术：造成伤害（这里模拟对自己造成伤害）
        playerState.health = Math.max(0, playerState.health - 10);
        skillEffect = { healthChange: -10 };
        break;
      default:
        // 其他技能
        skillEffect = { message: `使用了 ${data.skillName}` };
    }
    
    // 设置技能冷却
    const skillIndex = this.getSkillIndex(data.skillId);
    if (skillIndex !== -1) {
      playerState.skillCooldowns = playerState.skillCooldowns || {};
      playerState.skillCooldowns[skillIndex] = 3; // 3秒冷却
    }
    
    // 发送技能效果到客户端
    this.sendToClient(clientId, {
      type: 5, // PLAYER_STATE
      ...playerState,
      skillEffect: skillEffect,
      timestamp: Date.now()
    });
  }

  // 处理物品使用
  handleItemUse(clientId, data, playerState) {
    console.log(`玩家 ${clientId} 使用物品:`, data.itemName);
    
    let itemEffect = {};
    switch (data.itemId) {
      case 'potion_heal':
        // 治疗药水：恢复生命值
        playerState.health = Math.min(playerState.maxHealth, playerState.health + 30);
        itemEffect = { healthChange: 30 };
        
        // 减少物品数量
        this.consumeItem(playerState.inventory, data.slotIndex);
        break;
      default:
        itemEffect = { message: `使用了 ${data.itemName}` };
    }
    
    // 发送物品效果到客户端
    this.sendToClient(clientId, {
      type: 5, // PLAYER_STATE
      ...playerState,
      itemEffect: itemEffect,
      timestamp: Date.now()
    });
  }

  // 处理物品移动
  handleItemMove(clientId, data, playerState) {
    console.log(`玩家 ${clientId} 移动物品:`, data.fromIndex, '->', data.toIndex);
    
    // 在服务器端验证物品移动
    const inventory = playerState.inventory;
    const item = inventory[data.fromIndex];
    
    if (item && item.id === data.itemId) {
      // 移动物品
      inventory[data.toIndex] = item;
      inventory[data.fromIndex] = null;
      
      // 发送更新后的背包状态
      this.sendToClient(clientId, {
        type: 5, // PLAYER_STATE
        ...playerState,
        inventory: [...inventory], // 发送副本
        timestamp: Date.now()
      });
    }
  }

  // 广播游戏状态给所有客户端
  broadcastGameState() {
    this.gameState.gameTime = Date.now();
    
    for (const [clientId, client] of this.connectedClients) {
      // 发送玩家状态更新
      this.sendToClient(clientId, {
        type: 5, // PLAYER_STATE
        ...client.playerState,
        timestamp: this.gameState.gameTime
      });
      
      // 定期发送完整游戏状态
      if (this.gameState.gameTime % 5000 < 100) { // 每5秒发送一次
        this.sendToClient(clientId, {
          type: 8, // GAME_STATE
          players: Array.from(this.gameState.players.entries()).map(([id, state]) => ({
            playerId: id,
            position: state.position
          })),
          gameTime: this.gameState.gameTime,
          timestamp: this.gameState.gameTime
        });
      }
    }
  }

  // 发送消息到客户端（模拟）
  sendToClient(clientId, data) {
    // 在实际环境中，这里应该通过UDP发送数据到客户端
    console.log(`发送到客户端 ${clientId}:`, data);
    
    // 模拟网络延迟
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.mockServerCallback) {
        window.mockServerCallback(clientId, data);
      }
    }, Math.random() * 50 + 20); // 20-70ms延迟
  }

  // 生成初始背包
  generateInitialInventory() {
    return [
      { name: '治疗药水', quantity: 3, quality: 'uncommon', icon: '🧪', id: 'potion_heal' },
      { name: '魔法卷轴', quantity: 1, quality: 'rare', icon: '📜', id: 'scroll_magic' },
      { name: '铁剑', quantity: 1, quality: 'common', icon: '⚔️', id: 'sword_iron' },
      { name: '金戒指', quantity: 1, quality: 'epic', icon: '💍', id: 'ring_gold' },
      null, null, null, null, null, null,
      null, null, null, null, null, null,
      null, null, null, null
    ];
  }

  // 获取技能索引
  getSkillIndex(skillId) {
    const skillMap = {
      'fireball': 0,
      'heal': 1,
      'lightning': 2,
      'frost': 3,
      'summon': 4
    };
    return skillMap[skillId] || -1;
  }

  // 消耗物品
  consumeItem(inventory, slotIndex) {
    const item = inventory[slotIndex];
    if (item && item.quantity > 1) {
      item.quantity -= 1;
    } else {
      inventory[slotIndex] = null;
    }
  }

  // 断开客户端连接
  disconnectClient(clientId) {
    this.connectedClients.delete(clientId);
    this.gameState.players.delete(clientId);
    console.log(`客户端 ${clientId} 已断开连接`);
  }
}

// 创建全局模拟服务器实例
const mockServer = new MockServer();

// 在浏览器环境中注册回调
if (typeof window !== 'undefined') {
  window.mockServer = mockServer;
  window.mockServerCallback = (clientId, data) => {
    // 这个函数会被NetworkService调用
  };
}

export default mockServer;
