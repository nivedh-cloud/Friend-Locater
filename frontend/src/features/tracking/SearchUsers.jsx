import React, { useState, useEffect } from 'react';
import { Search, X, Send, Clock, UserCheck } from 'lucide-react';

const SearchUsers = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());

  const searchUsers = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/search-users?query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setResults(data.users || []);
    } catch (err) {
      setError('Failed to search users');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/friend-request/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient_id: userId })
      });
      
      if (response.ok) {
        setSentRequests(new Set([...sentRequests, userId]));
        setTimeout(() => {
          setResults(results.map(user => 
            user.id === userId ? { ...user, status: 'pending' } : user
          ));
        }, 500);
      }
    } catch (err) {
      setError('Failed to send request');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'pending') return 'text-orange-500';
    if (status === 'accepted') return 'text-green-500';
    return 'text-gray-500';
  };

  const getStatusIcon = (status) => {
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    if (status === 'accepted') return <UserCheck className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-screen overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800">Add Friends</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {!loading && results.length === 0 && query && (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <p>No users found</p>
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <p>Type at least 2 characters to search</p>
            </div>
          )}

          {!loading && results.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {user.status === 'not_friends' ? (
                <button
                  onClick={() => sendFriendRequest(user.id)}
                  disabled={sentRequests.has(user.id)}
                  className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition flex-shrink-0"
                  title="Send friend request"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <div className={`ml-2 flex items-center gap-1 text-sm font-semibold ${getStatusColor(user.status)}`}>
                  {getStatusIcon(user.status)}
                  {user.status === 'pending' ? 'Pending' : 'Friends'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
