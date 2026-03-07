import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../config';
import BatteryIndicator from '../../components/BatteryIndicator';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 40.7128, // Default center (New York)
  lng: -74.0060,
};

// Custom marker component that displays profile picture as larger image
const ProfileImageMarker = ({ friend, isSelected, isOwn, onClick }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-transform hover:scale-110"
      style={{
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
      }}
    >
      <div
        className={`w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center bg-white shadow-xl ${
          isSelected 
            ? 'border-blue-500 ring-4 ring-blue-300' 
            : isOwn 
            ? 'border-green-500 ring-2 ring-green-200'
            : 'border-slate-300'
        }`}
        style={{
          boxShadow: isSelected 
            ? '0 0 0 4px rgba(59, 130, 246, 0.6)' 
            : isOwn
            ? '0 0 0 3px rgba(34, 197, 94, 0.4)'
            : '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        {friend.profile_picture ? (
          <img
            src={friend.profile_picture}
            alt={friend.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center font-bold text-white text-2xl ${
            isOwn ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
          }`}>
            {getInitials(friend.name)}
          </div>
        )}
        {isOwn && (
          <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
      </div>
      {/* Name label below marker */}
      <div className="mt-2 px-3 py-1.5 bg-white rounded-lg shadow-lg text-center text-sm font-bold text-slate-700 whitespace-nowrap border border-slate-200">
        {isOwn ? `${friend.name} (You)` : friend.name}
      </div>
    </div>
  );
};

const MapProvider = ({ friends, currentUser, userLocation, selectedFriend, historyLocation }) => {
  const [activeMarker, setActiveMarker] = useState(null);
  const [openInfoWindowId, setOpenInfoWindowId] = useState(null);

  // Auto-open info window when a friend is selected from the list
  useEffect(() => {
    if (selectedFriend?.id) {
      setOpenInfoWindowId(selectedFriend.id);
    }
  }, [selectedFriend?.id]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const handleMarkerClick = (friend) => {
    setActiveMarker(friend.id === activeMarker ? null : friend.id);
    setOpenInfoWindowId(friend.id === openInfoWindowId ? null : friend.id);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 animate-pulse">
        <div className="text-gray-400 font-medium">Loading Google Maps...</div>
      </div>
    );
  }

  // Determine map center - prioritize user location, then selected friend, then default
  const displayCenter = userLocation 
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : historyLocation 
    ? { lat: historyLocation.lat, lng: historyLocation.lng }
    : (selectedFriend ? { lat: selectedFriend.lat, lng: selectedFriend.lng } : center);

  // Zoom level based on view
  const zoomLevel = userLocation && selectedFriend 
    ? 14 
    : selectedFriend 
    ? 15 
    : userLocation 
    ? 15
    : 12;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={displayCenter}
      zoom={zoomLevel}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
    >
      {/* Show user's realtime location marker */}
      {userLocation && currentUser && (
        <OverlayView
          position={{ lat: userLocation.lat, lng: userLocation.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelOffset={() => new window.google.maps.Size(-48, -56)}
        >
          <div className="flex flex-col items-center">
            <ProfileImageMarker
              friend={currentUser}
              isSelected={false}
              isOwn={true}
              onClick={() => {}}
            />
            {/* Realtime location indicator */}
            <div className="absolute mt-1 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-md border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-600">Live</span>
            </div>
          </div>
        </OverlayView>
      )}

      {/* Show history playback marker if in history mode */}
      {historyLocation && selectedFriend && (
        <OverlayView
          position={{ lat: historyLocation.lat, lng: historyLocation.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelOffset={() => new window.google.maps.Size(-48, -56)}
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-500 bg-white shadow-lg flex items-center justify-center">
              {selectedFriend.profile_picture ? (
                <img
                  src={selectedFriend.profile_picture}
                  alt={selectedFriend.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-2xl bg-gradient-to-br from-yellow-400 to-yellow-600">
                  {selectedFriend.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mt-2 px-3 py-1.5 bg-white rounded-lg shadow-lg text-sm font-semibold text-slate-700 whitespace-nowrap border border-slate-200">
              {selectedFriend.name} (History)
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              {historyLocation.time || 'Playback'}
            </div>
          </div>
        </OverlayView>
      )}

      {/* Show friends markers only in live mode */}
      {!historyLocation && friends?.map((friend) => (
        <React.Fragment key={friend.id}>
          <OverlayView
            position={{ lat: friend.lat, lng: friend.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelOffset={() => new window.google.maps.Size(-48, -56)}
          >
            <div onClick={() => handleMarkerClick(friend)}>
              <ProfileImageMarker
                friend={friend}
                isSelected={activeMarker === friend.id || selectedFriend?.id === friend.id}
                isOwn={friend.isOwn}
              />
            </div>
          </OverlayView>

          {/* Info window for friend */}
          {openInfoWindowId === friend.id && (
            <OverlayView
              position={{ lat: friend.lat + 0.001, lng: friend.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelOffset={() => new window.google.maps.Size(80, -60)}
            >
              <div className="bg-white rounded-xl shadow-2xl p-4 w-64 border-2 border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-slate-300 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {friend.profile_picture ? (
                      <img
                        src={friend.profile_picture}
                        alt={friend.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-slate-400 font-bold text-lg">
                        {friend.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-800">
                      {friend.isOwn ? `${friend.name} (You)` : friend.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {friend.isOnline ? "🟢 Live Tracking" : "🔴 Offline"}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-3 flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                    <span className="text-xs font-bold text-slate-600 uppercase">Battery</span>
                    <BatteryIndicator percentage={friend.battery} isCharging={friend.isCharging} />
                  </div>
                  <div className="flex justify-between items-center px-2 py-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Latitude</span>
                    <span className="text-xs font-semibold text-slate-700 font-mono">{friend.lat.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Longitude</span>
                    <span className="text-xs font-semibold text-slate-700 font-mono">{friend.lng.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Last Seen</span>
                    <span className="text-xs font-semibold text-slate-700">{friend.lastSeen}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenInfoWindowId(null);
                  }}
                  className="mt-4 w-full px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-gray-100 transition-colors rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </OverlayView>
          )}
        </React.Fragment>
      ))}
    </GoogleMap>
  );
};

export default React.memo(MapProvider);
