import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface LiveUpdate {
  id: string;
  type: 'block' | 'transaction';
  message: string;
  timestamp: number;
  data?: any;
}

const LiveUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // WebSocket connection for live updates
    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to live updates');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleLiveUpdate(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      ws.close();
    };
  }, []);

  const handleLiveUpdate = (data: any) => {
    const update: LiveUpdate = {
      id: `${data.type}-${Date.now()}`,
      type: data.type,
      message: formatUpdateMessage(data),
      timestamp: Date.now(),
      data
    };

    setUpdates(prev => [update, ...prev.slice(0, 4)]); // Keep only last 5 updates
  };

  const formatUpdateMessage = (data: any): string => {
    switch (data.type) {
      case 'block':
        return `New block #${data.number} with ${data.transactionCount} transactions`;
      case 'transaction':
        return `New transaction ${data.hash.slice(0, 10)}... (${data.value} ETH)`;
      default:
        return 'New update available';
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (!isVisible || updates.length === 0) {
    return (
      <div className="fixed top-24 right-4 z-50">
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-900/80 backdrop-blur-lg border border-green-500/30 rounded-lg">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs text-green-400">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-24 right-4 z-50 w-80">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Live Updates</span>
            {isConnected && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-green-500/60 hover:text-green-400 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Updates List */}
        <div className="space-y-2">
          {updates.map((update, index) => (
            <div
              key={update.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                index === 0
                  ? 'border-green-400/50 bg-green-500/10'
                  : 'border-green-500/20 bg-green-500/5'
              }`}
              style={{
                opacity: 1 - (index * 0.15),
                transform: `scale(${1 - (index * 0.02)})`
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-400/90 font-medium truncate">
                    {update.message}
                  </p>
                  <p className="text-xs text-green-500/60 mt-1">
                    {formatTimeAgo(update.timestamp)}
                  </p>
                </div>
                <div className="ml-2">
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full capitalize">
                    {update.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection Status */}
        <div className="mt-3 pt-3 border-t border-green-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-500/60">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
            <span className="text-green-500/60">
              {updates.length} recent updates
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveUpdates;