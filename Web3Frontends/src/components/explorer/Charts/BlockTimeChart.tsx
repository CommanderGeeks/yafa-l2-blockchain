import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface BlockTimeData {
  blockNumber: number;
  timestamp: string;
  blockTime: number;
  averageBlockTime?: number;
}

interface BlockTimeChartProps {
  period?: '1h' | '6h' | '24h' | '7d';
  className?: string;
}

const BlockTimeChart: React.FC<BlockTimeChartProps> = ({ 
  period = '24h', 
  className = '' 
}) => {
  const [data, setData] = useState<BlockTimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageBlockTime: 0,
    trend: 0,
    minBlockTime: 0,
    maxBlockTime: 0
  });

  const periods = ['1h', '6h', '24h', '7d'];
  
  useEffect(() => {
    fetchBlockTimeData();
  }, [period]);

  const fetchBlockTimeData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stats/charts/blocks?period=${period}`
      );
      const result = await response.json();
      
      if (result.success && result.data) {
        const processedData = processBlockTimeData(result.data);
        setData(processedData);
        calculateStats(processedData);
      }
    } catch (error) {
      console.error('Failed to fetch block time data:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const processBlockTimeData = (rawData: any[]): BlockTimeData[] => {
    return rawData.map((item, index) => {
      const blockTime = index > 0 
        ? (new Date(item.timestamp).getTime() - new Date(rawData[index - 1].timestamp).getTime()) / 1000
        : 12; // Default block time
      
      return {
        blockNumber: item.number,
        timestamp: item.timestamp,
        blockTime: Math.max(blockTime, 0.1) // Ensure positive block time
      };
    });
  };

  const generateMockData = () => {
    const mockData: BlockTimeData[] = [];
    const now = Date.now();
    const intervals = period === '1h' ? 60 : period === '6h' ? 360 : period === '24h' ? 1440 : 10080;
    
    for (let i = intervals; i >= 0; i -= 5) {
      const timestamp = new Date(now - (i * 60 * 1000));
      const blockTime = 12 + (Math.random() - 0.5) * 4; // 10-14 seconds
      
      mockData.push({
        blockNumber: 1000000 - i,
        timestamp: timestamp.toISOString(),
        blockTime: Math.max(blockTime, 0.1)
      });
    }
    
    setData(mockData);
    calculateStats(mockData);
  };

  const calculateStats = (data: BlockTimeData[]) => {
    if (data.length === 0) return;
    
    const blockTimes = data.map(d => d.blockTime);
    const average = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
    const min = Math.min(...blockTimes);
    const max = Math.max(...blockTimes);
    
    // Calculate trend (last 10 vs previous 10)
    const recent = blockTimes.slice(-10);
    const previous = blockTimes.slice(-20, -10);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.length > 0 
      ? previous.reduce((a, b) => a + b, 0) / previous.length 
      : recentAvg;
    
    const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
    
    setStats({
      averageBlockTime: average,
      trend,
      minBlockTime: min,
      maxBlockTime: max
    });
  };

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    if (period === '1h' || period === '6h') {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
  };

  if (loading) {
    return (
      <div className={`h-64 flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-400">Block Time Analysis</h3>
        <div className="flex space-x-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => fetchBlockTimeData()}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                period === p
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-green-500/70 hover:text-green-400'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-green-500/70 text-xs uppercase tracking-wide">Average</p>
          <p className="text-green-400 text-lg font-bold">{formatNumber(stats.averageBlockTime)}s</p>
        </div>
        <div className="text-center">
          <p className="text-green-500/70 text-xs uppercase tracking-wide">Min</p>
          <p className="text-emerald-400 text-lg font-bold">{formatNumber(stats.minBlockTime)}s</p>
        </div>
        <div className="text-center">
          <p className="text-green-500/70 text-xs uppercase tracking-wide">Max</p>
          <p className="text-yellow-400 text-lg font-bold">{formatNumber(stats.maxBlockTime)}s</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <p className="text-green-500/70 text-xs uppercase tracking-wide">Trend</p>
            {stats.trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-red-400" />
            ) : stats.trend < 0 ? (
              <TrendingDown className="w-3 h-3 text-emerald-400" />
            ) : null}
          </div>
          <p className={`text-lg font-bold ${
            stats.trend > 0 ? 'text-red-400' : stats.trend < 0 ? 'text-emerald-400' : 'text-green-400'
          }`}>
            {stats.trend > 0 ? '+' : ''}{formatNumber(stats.trend)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="blockTimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(16, 185, 129, 0.1)" 
              vertical={false}
            />
            
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="rgba(16, 185, 129, 0.5)"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              stroke="rgba(16, 185, 129, 0.5)"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}s`}
            />
            
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                color: '#10b981'
              }}
              formatter={(value: any, name: string) => [
                `${formatNumber(value)}s`, 
                'Block Time'
              ]}
              labelFormatter={(timestamp: string) => 
                new Date(timestamp).toLocaleString()
              }
            />
            
            <Area
              type="monotone"
              dataKey="blockTime"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#blockTimeGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: '#10b981',
                stroke: '#064e3b',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BlockTimeChart;