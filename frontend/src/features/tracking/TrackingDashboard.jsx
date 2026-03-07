import React, { useState, useEffect } from 'react';
import { MapPin, Signal, History, Bell, ShieldCheck, LogOut, UserPlus } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import FriendListItem from './FriendListItem';
import MapProvider from './MapProvider';
import HistoryPlayback from './HistoryPlayback';
import GeofenceSettings from './GeofenceSettings';
import InviteFriend from './InviteFriend';
import FriendRequests from './FriendRequests';

const API_BASE_URL = "http://localhost:8000";

const TrackingDashboard = ({ onLogout }) => {
  const [friends, setFriends] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('live');
  const [isLoading, setIsLoading] = useState(true);
  const [historyLocation, setHistoryLocation] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [trackingStatus, setTrackingStatus] = useState('idle'); // idle, tracking, error

  // Fetch live friend data from backend
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/friends/live`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          onLogout();
          return;
        }

        const data = await response.json();
        setFriends(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        setIsLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          onLogout();
          return;
        }

        const data = await response.json();
        setCurrentUser({
          ...data,
          isOwn: true,
          isOnline: true
        });
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/friend-requests/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setPendingRequestCount(data.requests?.length || 0);
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
      }
    };

    fetchFriends();
    fetchCurrentUser();
    fetchPendingRequests();
    
    const friendInterval = setInterval(fetchFriends, 10000); // Polling every 10s
    const userInterval = setInterval(fetchCurrentUser, 30000); // Fetch user every 30s
    const requestInterval = setInterval(fetchPendingRequests, 15000); // Check requests every 15s
    
    return () => {
      clearInterval(friendInterval);
      clearInterval(userInterval);
      clearInterval(requestInterval);
    };
  }, [onLogout]);

  // Geolocation tracking - send location updates to backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    let watchId = null;

    const sendLocationUpdate = async (latitude, longitude, battery = null, charging = null) => {
      try {
        const response = await fetch(`${API_BASE_URL}/location/update`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude,
            longitude,
            battery,
            charging
          })
        });

        if (response.status === 401) {
          onLogout();
          return;
        }

        if (!response.ok) {
          console.error('Failed to update location');
        }
      } catch (error) {
        console.error('Location update error:', error);
      }
    };

    const getBatteryInfo = async () => {
      try {
        if (navigator.getBattery) {
          const battery = await navigator.getBattery();
          return {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          };
        } else if ('getBattery' in navigator) {
          // Fallback for older APIs
          const battery = await navigator.getBattery();
          return {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          };
        }
      } catch (error) {
        console.log('Battery API not available');
      }
      return null;
    };

    const startTracking = async () => {
      try {
        setTrackingStatus('tracking');

        // Request location permission
        const permission = await Geolocation.requestPermissions({
          permissions: ['geolocation']
        });

        if (permission.geolocation !== 'granted') {
          setTrackingStatus('error');
          console.log('Geolocation permission denied');
          return;
        }

        // Start watching position using Capacitor
        watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
          },
          async (position) => {
            if (position) {
              const { latitude, longitude } = position.coords;
              
              // Update user location state for map
              setUserLocation({
                lat: latitude,
                lng: longitude
              });
              
              // Get battery info
              const batteryInfo = await getBatteryInfo();
              
              sendLocationUpdate(
                latitude,
                longitude,
                batteryInfo?.level || null,
                batteryInfo?.charging || null
              );
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setTrackingStatus('error');
          }
        );
      } catch (error) {
        console.error('Error starting tracking:', error);
        setTrackingStatus('error');
      }
    };

    startTracking();

    // Cleanup
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [onLogout]);

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden absolute top-6 left-6 z-50 p-3 text-white rounded-xl shadow-2xl transition-all active:scale-95 border-2 border-white/20 ${
          isSidebarOpen ? 'bg-blue-800' : 'bg-blue-600'
        }`}
      >
        <MapPin className={`w-6 h-6 transition-transform ${isSidebarOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Mode Specific Overlays */}
      {viewMode === 'history' && (
        <HistoryPlayback 
          onBack={() => {
            setViewMode('live');
            setHistoryLocation(null);
          }}
          selectedFriend={selectedFriend}
          onHistoryUpdate={setHistoryLocation}
        />
      )}

      {viewMode === 'geofence' && (
        <GeofenceSettings onBack={() => setViewMode('live')} />
      )}

      {/* Invite Friend Modal */}
      {showInviteModal && (
        <InviteFriend onClose={() => setShowInviteModal(false)} />
      )}

      {/* Friend Requests Modal */}
      {showRequestsModal && (
        <FriendRequests onClose={() => {
          setShowRequestsModal(false);
          setPendingRequestCount(0);
        }} />
      )}

      {/* Sidebar: Friend List */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-slate-50 border-r border-gray-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <header className="p-6 pt-20 lg:pt-6 border-b border-gray-200 bg-blue-700 text-white flex justify-between items-center shadow-md">
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            FriendLocator
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowInviteModal(true)}
              className="hover:bg-blue-600 p-2 rounded-xl transition bg-white/10"
              title="Invite friend"
            >
              <UserPlus className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => setShowRequestsModal(true)}
              className="hover:bg-blue-600 p-2 rounded-xl transition bg-white/10 relative"
              title="Friend requests"
            >
              <Bell className="w-5 h-5 text-white" />
              {pendingRequestCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequestCount}
                </span>
              )}
            </button>
            <button 
              onClick={onLogout}
              className="hover:bg-red-600 p-2 rounded-xl transition bg-white/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>

        <nav className="flex-grow overflow-y-auto p-4 flex flex-col gap-2">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 mb-2">
            My Friends
          </h2>
          {isLoading ? (
            <div className="flex justify-center p-8 animate-pulse text-gray-400 font-bold uppercase text-[10px]">
              Syncing Locations...
            </div>
          ) : (
            friends.map((friend) => (
              <FriendListItem
                key={friend.id}
                friend={friend}
                isSelected={selectedFriend?.id === friend.id}
                onSelect={(f) => {
                  setSelectedFriend(f);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
              />
            ))
          )}
        </nav>

        <footer className="p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setViewMode('history')}
              className={`flex flex-col items-center gap-1.5 transition group ${
                viewMode === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
              }`}
            >
              <div className={`p-2 rounded-lg transition ${
                viewMode === 'history' ? 'bg-blue-50' : 'bg-gray-100 group-hover:bg-blue-50'
              }`}>
                <History className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase">History</span>
            </button>
            <button 
              onClick={() => setViewMode('geofence')}
              className={`flex flex-col items-center gap-1.5 transition group ${
                viewMode === 'geofence' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
              }`}
            >
              <div className={`p-2 rounded-lg transition ${
                viewMode === 'geofence' ? 'bg-blue-50' : 'bg-gray-100 group-hover:bg-blue-50'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase">Safe Zones</span>
            </button>
          </div>
        </footer>
      </aside>

      {/* Main Map Content */}
      <main className="flex-grow relative bg-slate-200">
        <div className="absolute inset-0">
          <MapProvider 
            friends={friends} 
            currentUser={currentUser}
            userLocation={userLocation}
            selectedFriend={selectedFriend}
            historyLocation={viewMode === 'history' ? historyLocation : null}
          />
        </div>

        {/* Floating Search/Selection Message (Only if no friend selected) */}
        {!selectedFriend && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50">
              <div className="relative inline-block">
                <MapPin className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Select a Friend</h2>
              <p className="text-gray-600 mt-2 font-medium max-w-xs mx-auto">
                Pick a friend from the sidebar to track their live location on the map.
              </p>
            </div>
          </div>
        )}

        {/* Floating Controls Overlay (Top Right) */}
        <div className="absolute top-6 right-6 flex flex-col gap-4">
          <button 
            className={`p-3 rounded-xl shadow-xl hover:opacity-80 transition border ${
              trackingStatus === 'tracking' 
                ? 'bg-green-500 text-white border-green-600' 
                : trackingStatus === 'error'
                ? 'bg-red-500 text-white border-red-600'
                : 'bg-white text-green-500 border-gray-100'
            }`}
            title={`Tracking: ${trackingStatus}`}
          >
            <div className="flex items-center gap-2">
              <Signal className="w-5 h-5" />
              <span className="text-xs font-bold">{trackingStatus === 'tracking' ? '●' : '○'}</span>
            </div>
          </button>
          <button className="p-3 bg-white rounded-xl shadow-xl hover:bg-gray-50 transition border border-gray-100">
            <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-700">+</div>
          </button>
          <button className="p-3 bg-white rounded-xl shadow-xl hover:bg-gray-50 transition border border-gray-100">
            <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-700">-</div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default TrackingDashboard;
