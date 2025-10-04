// 网络服务 - 处理与C++服务器的UDP通信
class NetworkService {
  constructor() {
    this.socket = null;
    this.serverAddress = '127.0.0.1'; // 服务器地址
    this.serverPort = 8888; // 服务器端口
    this.clientPort = 8889; // 客户端端口
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatInterval = null;
    
    // 消息类型常量
    this.MESSAGE_TYPES = {
      LOGIN: 1,
      LOGIN_RESPONSE: 2,
      HEARTBEAT: 3,
      HEARTBEAT_RESPONSE: 4,
      PLAYER_STATE: 5,
      PLAYER_MOVE: 6,
      PLAYER_ACTION: 7,
      GAME_STATE: 8,
      ERROR: 99
    };
  }

  // 初始化连接
  async connect() {
    try {
      // 创建UDP socket
      this.socket = new UDPSocket();
      await this.socket.bind(this.clientPort);
      
      console.log(`UDP客户端已启动，监听端口: ${this.clientPort}`);
      
      // 开始接收消息
      this.startReceiving();
      
      // 发送登录请求
      await this.sendLogin();
      
      // 启动心跳
      this.startHeartbeat();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      return true;
    } catch (error) {
      console.error('连接服务器失败:', error);
      this.handleConnectionError();
      return false;
    }
  }

  // 发送登录请求
  async sendLogin() {
    const loginData = {
      type: this.MESSAGE_TYPES.LOGIN,
      playerId: this.generatePlayerId(),
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    await this.sendMessage(loginData);
    console.log('发送登录请求:', loginData);
  }

  // 发送消息到服务器
  async sendMessage(data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket未连接，无法发送消息');
      return false;
    }

    try {
      const message = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(message);
      
      await this.socket.send(dataBuffer, this.serverAddress, this.serverPort);
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      this.handleConnectionError();
      return false;
    }
  }

  // 开始接收消息
  startReceiving() {
    if (!this.socket) return;

    this.socket.onmessage = (event) => {
      try {
        const decoder = new TextDecoder();
        const message = decoder.decode(event.data);
        const data = JSON.parse(message);
        
        this.handleReceivedMessage(data);
      } catch (error) {
        console.error('解析接收到的消息失败:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Socket错误:', error);
      this.handleConnectionError();
    };
  }

  // 处理接收到的消息
  handleReceivedMessage(data) {
    console.log('收到服务器消息:', data);
    
    // 根据消息类型分发处理
    switch (data.type) {
      case this.MESSAGE_TYPES.LOGIN_RESPONSE:
        this.handleLoginResponse(data);
        break;
      case this.MESSAGE_TYPES.HEARTBEAT_RESPONSE:
        this.handleHeartbeatResponse(data);
        break;
      case this.MESSAGE_TYPES.PLAYER_STATE:
        this.handlePlayerState(data);
        break;
      case this.MESSAGE_TYPES.GAME_STATE:
        this.handleGameState(data);
        break;
      case this.MESSAGE_TYPES.ERROR:
        this.handleError(data);
        break;
      default:
        console.warn('未知消息类型:', data.type);
    }
    
    // 调用注册的消息处理器
    if (this.messageHandlers.has(data.type)) {
      this.messageHandlers.get(data.type).forEach(handler => handler(data));
    }
  }

  // 处理登录响应
  handleLoginResponse(data) {
    if (data.success) {
      console.log('登录成功，玩家ID:', data.playerId);
      this.playerId = data.playerId;
      this.emit('loginSuccess', data);
    } else {
      console.error('登录失败:', data.error);
      this.emit('loginFailed', data);
    }
  }

  // 处理玩家状态更新
  handlePlayerState(data) {
    this.emit('playerStateUpdate', data);
  }

  // 处理游戏状态更新
  handleGameState(data) {
    this.emit('gameStateUpdate', data);
  }

  // 处理心跳响应
  handleHeartbeatResponse(data) {
    // 心跳响应处理，可以更新连接状态等
    this.emit('heartbeat', data);
  }

  // 处理错误消息
  handleError(data) {
    console.error('服务器错误:', data.error);
    this.emit('error', data);
  }

  // 发送玩家移动
  sendPlayerMove(position, velocity) {
    const moveData = {
      type: this.MESSAGE_TYPES.PLAYER_MOVE,
      playerId: this.playerId,
      position: position,
      velocity: velocity,
      timestamp: Date.now()
    };
    
    return this.sendMessage(moveData);
  }

  // 发送玩家动作（使用技能等）
  sendPlayerAction(actionType, targetId = null, extraData = {}) {
    const actionData = {
      type: this.MESSAGE_TYPES.PLAYER_ACTION,
      playerId: this.playerId,
      actionType: actionType,
      targetId: targetId,
      timestamp: Date.now(),
      ...extraData
    };
    
    return this.sendMessage(actionData);
  }

  // 开始心跳
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const heartbeatData = {
        type: this.MESSAGE_TYPES.HEARTBEAT,
        playerId: this.playerId,
        timestamp: Date.now()
      };
      
      this.sendMessage(heartbeatData);
    }, 5000); // 每5秒发送一次心跳
  }

  // 处理连接错误
  handleConnectionError() {
    this.isConnected = false;
    this.stopHeartbeat();
    
    // 尝试重连
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, 3000);
    } else {
      console.error('达到最大重连次数，连接失败');
      this.emit('connectionLost');
    }
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 断开连接
  disconnect() {
    this.stopHeartbeat();
    this.isConnected = false;
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    console.log('已断开服务器连接');
  }

  // 事件系统
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  emit(event, data) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => handler(data));
    }
  }

  // 生成玩家ID（临时方案，实际应该由服务器分配）
  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }
}

// UDP Socket模拟类（集成模拟服务器）
class UDPSocket {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
    this.isBound = false;
    this.clientId = null;
  }

  async bind(port) {
    this.port = port;
    this.isBound = true;
    this.clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 注册到模拟服务器
    if (typeof window !== 'undefined' && window.mockServer) {
      window.mockServerCallback = (clientId, data) => {
        if (clientId === this.clientId && this.onmessage) {
          const encoder = new TextEncoder();
          const dataBuffer = encoder.encode(JSON.stringify(data));
          this.onmessage({ data: dataBuffer });
        }
      };
    }
    
    console.log(`UDP Socket绑定到端口: ${port}, 客户端ID: ${this.clientId}`);
  }

  async send(data, address, port) {
    if (!this.isBound) {
      throw new Error('Socket未绑定');
    }
    
    // 解码消息并发送到模拟服务器
    const decoder = new TextDecoder();
    const message = decoder.decode(data);
    const messageData = JSON.parse(message);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
    
    // 发送到模拟服务器
    if (typeof window !== 'undefined' && window.mockServer) {
      window.mockServer.handleClientMessage(this.clientId, message);
      console.log(`发送消息到模拟服务器:`, messageData);
    } else {
      console.log(`发送UDP消息到 ${address}:${port}`, messageData);
    }
    
    return true;
  }

  close() {
    this.isBound = false;
    
    // 从模拟服务器断开
    if (typeof window !== 'undefined' && window.mockServer && this.clientId) {
      window.mockServer.disconnectClient(this.clientId);
    }
    
    console.log('UDP Socket已关闭');
  }
}

export default NetworkService;
