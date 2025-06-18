import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend = 'neutral',
  trendValue,
  className = '',
  onClick
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-green-500/60" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-green-500/60';
    }
  };

  return (
    <div
      className={`yafa-card group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-green-500/80 text-sm font-medium tracking-wide uppercase">
          {title}
        </h3>
        {icon && (
          <div className="text-2xl opacity-60 group-hover:opacity-80 transition-opacity">
            {icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-3">
        <div className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
          {value}
        </div>
      </div>

      {/* Subtitle and Trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-green-500/60 text-sm">
            {subtitle}
          </p>
        )}
        
        {(trend !== 'neutral' || trendValue) && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            {trendValue && (
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};

export default StatsCard;