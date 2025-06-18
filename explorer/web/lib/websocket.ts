// WebSocket client for real-time updates
type EventHandler = (data: any) => void;

interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class YafaWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private heartbeatInterval: number;
  private reconnectAttempts: number = 0;
  private isConnecting: boolean = false;
  private isIntentionallyClosed: boolean = false;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // Event handlers
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private connectionHandlers: (() => void)[] = [];
  private disconnectionHandlers: (() => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];

  constructor(config: WebSocketConfig = {}) {
    this.url = config.url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
  }

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for current connection attempt
        const checkConnection = () => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;
      this.isIntentionallyClosed = false;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('🔗 WebSocket connected to', this.url);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.disconnectionHandlers.forEach(handler => handler());

          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.errorHandlers.forEach(handler => handler(error));
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  // Send message to server
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Subscribe to specific events
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  // Unsubscribe from events
  off(event: string, handler?: EventHandler): void {
    if (!this.eventHandlers.has(event)) return;

    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  // Connection event handlers
  onConnect(handler: () => void): void {
    this.connectionHandlers.push(handler);
  }

  onDisconnect(handler: () => void): void {
    this.disconnectionHandlers.push(handler);
  }

  onError(handler: (error: Event) => void): void {
    this.errorHandlers.push(handler);
  }

  // Get connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  // Private methods
  private handleMessage(data: any): void {
    const { type, payload } = data;
    
    if (type === 'heartbeat') {
      this.send({ type: 'heartbeat_ack' });
      return;
    }

    // Emit to specific event handlers
    if (this.eventHandlers.has(type)) {
      this.eventHandlers.get(type)!.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }

    // Emit to global handlers
    if (this.eventHandlers.has('*')) {
      this.eventHandlers.get('*')!.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in global event handler:', error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'heartbeat' });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Singleton instance
let wsInstance: YafaWebSocket | null = null;

export function getWebSocket(config?: WebSocketConfig): YafaWebSocket {
  if (!wsInstance) {
    wsInstance = new YafaWebSocket(config);
  }
  return wsInstance;
}

// Hook for React components
export function useWebSocket() {
  const ws = getWebSocket();
  
  return {
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    send: (data: any) => ws.send(data),
    on: (event: string, handler: EventHandler) => ws.on(event, handler),
    off: (event: string, handler?: EventHandler) => ws.off(event, handler),
    isConnected: ws.isConnected,
    connectionState: ws.connectionState
  };
}

// Specialized hooks for different data types
export function useBlockUpdates(handler: (block: any) => void) {
  const ws = getWebSocket();
  
  React.useEffect(() => {
    ws.on('new_block', handler);
    return () => ws.off('new_block', handler);
  }, [handler]);
}

export function useTransactionUpdates(handler: (tx: any) => void) {
  const ws = getWebSocket();
  
  React.useEffect(() => {
    ws.on('new_transaction', handler);
    return () => ws.off('new_transaction', handler);
  }, [handler]);
}

export function useStatsUpdates(handler: (stats: any) => void) {
  const ws = getWebSocket();
  
  React.useEffect(() => {
    ws.on('stats_update', handler);
    return () => ws.off('stats_update', handler);
  }, [handler]);
}