import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Lock,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Camera,
  Upload,
  Trash2,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Keep local state synced if user auth changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setProfilePhoto(user.profilePhoto || '');
    }
  }, [user]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result);
      toast.success('Photo uploaded to preview. Click "Save Profile Changes" to save.');
    };
    reader.onerror = () => {
      toast.error('Failed to process image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.updateProfile({
        name,
        phone,
        profilePhoto: profilePhoto || '',
      });
      if (res.success && res.user) {
        updateUser(res.user);
        toast.success('Profile details & photo updated successfully.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">User Profile & Security</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account profile details, avatar, and authentication credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pb-6 border-b border-slate-100">
            <div className="relative group">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={name || user?.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 font-bold text-2xl flex items-center justify-center border-2 border-indigo-100 shadow-xs">
                  {name ? name[0].toUpperCase() : 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Photo"
                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-lg font-bold text-slate-900">{name || user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user?.role}
                </span>
                {user?.department && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photo Actions Bar */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                Change Profile Picture
              </span>
              {profilePhoto && (
                <button
                  type="button"
                  onClick={() => setProfilePhoto('')}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  showUrlInput
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                URL Link
              </button>
            </div>

            {showUrlInput && (
              <div className="pt-1">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            )}

            {/* Avatar Presets */}
            <div className="pt-1 border-t border-slate-200/60">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" /> Quick Avatar Presets
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfilePhoto(url)}
                    className={`w-8 h-8 rounded-xl overflow-hidden shrink-0 border-2 transition-transform hover:scale-110 ${
                      profilePhoto === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address (Managed)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {user?.department && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    disabled
                    value={user.department}
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {profileLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Ensure your account is using a strong password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full mt-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {passwordLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Update Password
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Passwords are hashed with bcrypt before storing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
