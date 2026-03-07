import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

const FriendRequests = ({ onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/friend-requests/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    }
    setLoading(false);
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/friend-request/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setRequests(requests.filter(req => req.request_id !== requestId));
      }
    } catch (err) {
      setError('Failed to accept request');
      console.error(err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/friend-request/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setRequests(requests.filter(req => req.request_id !== requestId));
      }
    } catch (err) {
      setError('Failed to reject request');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-screen overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Friend Requests</h2>
            <p className="text-sm text-gray-500 mt-1">{requests.length} pending</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && requests.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
              <p className="font-medium">No pending requests</p>
            </div>
          )}

          {!loading && requests.map((request) => (
            <div key={request.request_id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-purple-200">
                  {request.from_profile_picture ? (
                    <img src={request.from_profile_picture} alt={request.from_username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-purple-700 font-bold">
                      {request.from_username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {request.from_username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{request.from_email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.request_id)}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.request_id)}
                  className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
