import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { formatTimeAgo } from '../../lib/utils';

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
      // Generate mock data for demonstration
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const processBlockTimeData = (rawData: any[]): BlockTimeData[] => {
    return rawData.map((item, index) => {
      const blockTime = index > 0 
        ? (new Date(item.timestamp).getTime()