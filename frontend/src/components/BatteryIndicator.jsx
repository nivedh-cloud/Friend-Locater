import React from 'react';
import { Battery as BatteryIcon, BatteryCharging, BatteryWarning } from 'lucide-react';

const BatteryIndicator = ({ percentage, isCharging = false }) => {
  const getBatteryIcon = () => {
    if (isCharging) return <BatteryCharging className="w-5 h-5 text-blue-500" />;
    if (percentage < 20) return <BatteryWarning className="w-5 h-5 text-red-500" />;
    return <BatteryIcon className="w-5 h-5 text-green-500" />;
  };

  const getPercentageColor = () => {
    if (percentage < 20) return 'text-red-500';
    if (percentage < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex items-center gap-2">
      {getBatteryIcon()}
      <span className={`text-sm font-medium ${getPercentageColor()}`}>
        {percentage}%
      </span>
    </div>
  );
};

export default BatteryIndicator;
