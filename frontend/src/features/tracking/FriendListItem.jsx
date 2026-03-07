import React from 'react';
import BatteryIndicator from '../../components/BatteryIndicator';
import { User, Signal, SignalLow, MapPin } from 'lucide-react';

const FriendListItem = ({ friend, isSelected, onSelect }) => {
  const { name, isOnline, battery, isCharging, lastSeen } = friend;

  const getStatusIcon = () => {
    return isOnline ? (
      <Signal className="w-5 h-5 text-green-500" />
    ) : (
      <SignalLow className="w-5 h-5 text-gray-400" />
    );
  };

  return (
    <article
      onClick={() => onSelect(friend)}
      className={`p-4 mb-2 rounded-xl transition cursor-pointer border-2 hover:shadow-md ${
        isSelected ? 'bg-blue-50 border-blue-600' : 'bg-white border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 overflow-hidden ${isOnline ? 'border-green-400' : 'border-gray-300'}`}>
            {friend.profile_picture ? (
              <img src={friend.profile_picture} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-blue-600" />
            )}
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold text-gray-800 truncate">{name}</h3>
            {getStatusIcon()}
          </div>

          <div className="flex items-center justify-between mt-2">
            <BatteryIndicator percentage={battery} isCharging={isCharging} />
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] uppercase font-semibold">
                {isOnline ? 'Tracking' : lastSeen || 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default FriendListItem;
