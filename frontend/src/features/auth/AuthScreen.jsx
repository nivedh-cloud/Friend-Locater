import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, MapPin, Camera } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AuthScreen = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profile_picture: null,
  });
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please choose an image smaller than 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, profile_picture: reader.result});
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // Login Logic
        const details = {
          'username': formData.email, // Accepting email OR username as the "username" field
          'password': formData.password,
        };
        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');
        
        const response = await fetch(`${API_BASE_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody,
        });
        
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.access_token);
          onLoginSuccess();
        } else {
          // Flatten FastAPI error response if it exists
          const errorMsg = typeof data.detail === 'string' ? data.detail : 
                          Array.isArray(data.detail) ? data.detail[0].msg : 'Login failed';
          setError(errorMsg);
        }
      } else {
        // Registration Logic
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            profile_picture: formData.profile_picture
          }),
        });
        
        const data = await response.json();
        if (response.ok) {
          setIsLogin(true);
          setError('Account created! Please login.');
        } else {
          const errorMsg = typeof data.detail === 'string' ? data.detail : 
                          Array.isArray(data.detail) ? data.detail[0].msg : 'Registration failed';
          setError(errorMsg);
        }
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Decorative Map Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none scale-150 transform rotate-12">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-500">
          
          {/* Header */}
          <div className="p-8 pt-12 text-center bg-blue-700 text-white relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-blue-50/20">
              <MapPin className="w-10 h-10 text-blue-700" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-4">FriendLocator</h1>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}
            
            {isLogin ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Email or Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your email/username"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-slate-700 shadow-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Full Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. jeevan_tracker"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-slate-700 shadow-sm"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="friend@locator.com"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-slate-700 shadow-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Profile Picture (Optional)</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl py-5 px-4 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <div className="text-center">
                      <span className="block text-sm font-semibold text-slate-600">
                        {profileImagePreview ? 'Change Photo' : 'Upload Photo'}
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">Max 2MB</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                  {profileImagePreview && (
                    <div className="relative w-full flex justify-center">
                      <img src={profileImagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-blue-600 shadow-md" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-slate-700 shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isLogin ? 'Enter Dashboard' : 'Sign Up Now'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <footer className="p-6 bg-slate-50 text-center border-t border-slate-100">
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? "New to FriendLocator?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-700 font-black hover:text-blue-800 transition underline underline-offset-4"
              >
                {isLogin ? 'Create Account' : 'Login instead'}
              </button>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
