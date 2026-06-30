import React, { useState } from 'react';
import { X, User, Mail, Shield, Key, Calendar, Clock, RefreshCw, AlertTriangle, CheckCircle2, Save, Lock } from 'lucide-react';
import { api } from '../utils/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onProfileUpdate: (updatedUser: any) => void;
  onLogout: () => void;
}

export default function UserProfileModal({ isOpen, onClose, currentUser, onProfileUpdate, onLogout }: UserProfileModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'edit' | 'password'>('details');

  // Edit profile state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.profilePicture || '');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!editName.trim()) {
        throw new Error('Name cannot be left empty.');
      }
      const response = await api.updateProfile({
        name: editName,
        profilePicture: selectedAvatar
      });
      onProfileUpdate(response.user);
      setSuccess('Enterprise profile updated successfully!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to modify profile records.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (newPassword !== confirmNewPassword) {
        throw new Error('New passwords do not match.');
      }
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }
      await api.changePassword({
        currentPassword,
        newPassword
      });
      setSuccess('Analyst security key modified successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update credentials key.');
    } finally {
      setLoading(false);
    }
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face'
  ];

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-md animate-fadeIn">
      
      <div className="w-full max-w-lg glass-panel border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#0E1117]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#4F8CFF]/10 rounded-xl border border-[#4F8CFF]/20 text-[#4F8CFF]">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-serif italic text-base text-white">Analyst Account Console</h3>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">Manage session identity and security tokens</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.04] text-white/40 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.06] bg-[#0E1117]/30 font-mono text-[10px] uppercase tracking-wider">
          <button
            onClick={() => { setActiveSubTab('details'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 border-b text-center cursor-pointer transition-colors ${
              activeSubTab === 'details'
                ? 'border-[#4F8CFF] text-[#4F8CFF] bg-white/[0.02] font-bold'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            Identity Specs
          </button>
          <button
            onClick={() => { setActiveSubTab('edit'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 border-b text-center cursor-pointer transition-colors ${
              activeSubTab === 'edit'
                ? 'border-[#4F8CFF] text-[#4F8CFF] bg-white/[0.02] font-bold'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => { setActiveSubTab('password'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 border-b text-center cursor-pointer transition-colors ${
              activeSubTab === 'password'
                ? 'border-[#4F8CFF] text-[#4F8CFF] bg-white/[0.02] font-bold'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            Change Secret Key
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          
          {error && (
            <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] rounded-xl flex gap-2.5 items-start font-mono shadow-md animate-fadeIn">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-[#32D583]/10 border border-[#32D583]/20 text-[#32D583] text-[11px] rounded-xl flex gap-2.5 items-start font-mono shadow-md animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{success}</span>
            </div>
          )}

          {/* TAB 1: DETAILS */}
          {activeSubTab === 'details' && (
            <div className="space-y-5">
              
              {/* Profile card view */}
              <div className="flex items-center gap-4 p-4 bg-[#141922]/30 border border-white/[0.05] rounded-2xl shadow-inner">
                <img
                  src={currentUser?.profilePicture || avatarPresets[0]}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border border-white/[0.1] shadow-lg flex-shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-serif italic text-lg text-white truncate leading-tight">{currentUser?.name}</h4>
                  <p className="text-xs text-white/50 font-mono truncate">{currentUser?.email}</p>
                  
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${
                    currentUser?.role === 'admin'
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'
                      : 'bg-[#7C5CFF]/10 border-[#7C5CFF]/20 text-[#7C5CFF]'
                  }`}>
                    <Shield className="w-3 h-3" />
                    ROLE: {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Specs parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="bg-[#141922]/20 border border-white/[0.04] p-4 rounded-xl flex gap-3 items-start">
                  <Calendar className="w-4 h-4 text-white/35 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-white/30 uppercase block tracking-wider font-bold">Member Since</span>
                    <span className="text-xs font-mono text-white/80 block mt-0.5">{currentUser?.memberSince || 'January 2026'}</span>
                  </div>
                </div>

                <div className="bg-[#141922]/20 border border-white/[0.04] p-4 rounded-xl flex gap-3 items-start">
                  <Clock className="w-4 h-4 text-white/35 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-white/30 uppercase block tracking-wider font-bold">Last Active Login</span>
                    <span className="text-xs font-mono text-white/80 block mt-0.5">{formatTimestamp(currentUser?.lastLogin)}</span>
                  </div>
                </div>

              </div>

              {/* Logout Action */}
              <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                <button
                  onClick={onLogout}
                  className="px-4.5 py-2.5 bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Terminate Active Session (Logout)
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeSubTab === 'edit' && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              
              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
                  Corporate Analyst Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-white/35" />
                  </span>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2 font-bold">
                  Select Profile Avatar Preset
                </label>
                <div className="flex gap-3 flex-wrap">
                  {avatarPresets.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                        selectedAvatar === avatar
                          ? 'border-[#4F8CFF] scale-105 shadow-lg shadow-[#4F8CFF]/15'
                          : 'border-white/[0.06] opacity-60 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <img
                        src={avatar}
                        alt={`Preset ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 object-cover"
                      />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 bg-[#4F8CFF]/10 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-[#4F8CFF] border border-white flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4.5 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md active:scale-95 border-t border-white/10"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Commit Metadata Changes
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: PASSWORD */}
          {activeSubTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              
              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
                  Current Secrets Key (Password)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-white/35" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
                  New Secrets Key (Password)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-white/35" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
                  Confirm New Secrets Key
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-white/35" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4.5 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md active:scale-95 border-t border-white/10"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                  Encrypt & Update Key
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
