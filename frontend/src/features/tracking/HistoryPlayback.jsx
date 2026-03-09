import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Play, Square, FastForward } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const HistoryPlayback = ({ onBack, selectedFriend, onHistoryUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [pathData, setPathData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch history data from backend
  useEffect(() => {
    if (!selectedFriend) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_BASE_URL}/history/${selectedFriend.id}?date=${selectedDate}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await response.json();
        setPathData(data.path || []);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [selectedFriend, selectedDate]);

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying || pathData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev + 1 >= pathData.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, pathData, playbackSpeed]);

  // Update map with current position
  useEffect(() => {
    if (pathData.length > 0 && currentIndex < pathData.length) {
      const current = pathData[currentIndex];
      onHistoryUpdate({
        lat: current.lat,
        lng: current.lng,
        time: current.time,
        isPlaying
      });
    }
  }, [currentIndex, pathData, isPlaying, onHistoryUpdate]);

  const progress = pathData.length > 0 ? (currentIndex / (pathData.length - 1)) * 100 : 0;

  return (
    <div className="absolute top-6 left-6 right-6 lg:left-24 lg:right-24 z-30 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/40 pointer-events-auto max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Header & Date Picker */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 group-active:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">
                {selectedFriend ? `${selectedFriend.name}'s Movement` : 'Movement History'}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm font-semibold text-gray-500">
                <Calendar className="w-4 h-4" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 cursor-pointer hover:text-blue-600 transition"
                />
                {isLoading && <span className="text-orange-500">Loading...</span>}
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={pathData.length === 0 || isLoading}
              className={`p-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isPlaying ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span className="font-bold uppercase text-[10px] tracking-widest">
                {isPlaying ? 'Stop' : 'Play Path'}
              </span>
            </button>

            <div className="h-10 w-px bg-gray-300 mx-2 hidden sm:block" />

            <div className="flex gap-1">
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-3 py-2 rounded-lg text-xs font-black transition ${
                    playbackSpeed === speed 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Slider Overlay */}
        <div className="mt-8 relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all" 
            style={{ width: `${progress}%` }} 
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md transition-all" 
            style={{ left: `${progress}%`, marginLeft: '-8px' }} 
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          <span>Start</span>
          <span>{pathData.length > 0 ? `${pathData[currentIndex]?.time || ''}` : '00:00'}</span>
          <span>End</span>
          <span className={isPlaying ? 'text-red-600' : 'text-blue-600'}>
            {currentIndex + 1} / {pathData.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HistoryPlayback;
