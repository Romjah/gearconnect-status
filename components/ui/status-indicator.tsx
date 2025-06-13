import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { StatusType, statusConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showText = true,
  showIcon = true,
  className,
}) => {
  const colors = statusConfig[status];
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const StatusIcon = () => {
    const iconClass = cn('inline-block', iconSizes[size]);
    
    switch (status) {
      case 'operational':
        return <CheckCircle className={cn(iconClass, 'text-green-600')} />;
      case 'degraded':
        return <AlertTriangle className={cn(iconClass, 'text-yellow-600')} />;
      case 'down':
        return <XCircle className={cn(iconClass, 'text-red-600')} />;
      default:
        return <Clock className={cn(iconClass, 'text-gray-600')} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'down':
        return 'Major Outage';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full border',
        colors.bg,
        colors.text,
        colors.border,
        textSizes[size],
        className
      )}
    >
      {showIcon && <StatusIcon />}
      {showText && (
        <span className="font-medium">
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator; 