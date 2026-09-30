import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  X,
  Pencil,
  Layers,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function InstagramAnalyticsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [accounts, setAccounts] = useState([]);
  const [lastSyncedFormatted, setLastSyncedFormatted] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Add handle modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    username: '',
    followersCount: '',
    profileImage: '',
    lastPostUrl: '',
  });

  // Edit account & last post modal state
  const [editingAccount, setEditingAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({
    accountName: '',
    followersCount: '',
    totalPosts: '',
    lastPostDate: '',
    lastPostUrl: '',
    lastPostThumbnail: '',
    lastPostCaption: '',
  });


  const fetchAccounts = async () => {
    try {
      const res = await api.getInstagramAccounts();
      if (res.success) {
        setAccounts(res.accounts || []);
        setLastSyncedFormatted(res.lastSyncedFormatted || 'Never');
      }
    } catch (err) {
      toast.error('Unable to load Instagram data. Showing the last successfully synchronized data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSyncNow = async () => {
    if (!isAdmin) return;
    setSyncing(true);
    try {
      const res = await api.syncInstagram();
      toast.success(res.message || 'Instagram accounts synchronized successfully!');
      await fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Synchronization failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!formData.accountName || !formData.username) {
      toast.error('Please provide an account name and Instagram handle.');
      return;
    }

    setSubmitting(true);
    try {
      await api.addInstagramAccount({
        accountName: formData.accountName,
        username: formData.username,
        followersCount: formData.followersCount ? parseInt(formData.followersCount, 10) : 10000,
        profileImage: '/logos/suryadatta_crest.png',
        lastPostUrl: formData.lastPostUrl || undefined,
      });
      toast.success('Instagram handle added successfully!');
      setShowAddModal(false);
      setFormData({ accountName: '', username: '', followersCount: '', profileImage: '', lastPostUrl: '' });
      await fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to add Instagram handle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove @${name} from tracked accounts?`)) {
      return;
    }
    try {
      await api.deleteInstagramAccount(id);
      toast.success(`Removed @${name} from tracked accounts.`);
      await fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to remove Instagram handle.');
    }
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setEditFormData({
      accountName: acc.account_name || '',
      followersCount: acc.followers_count || '',
      totalPosts: acc.total_posts || '',
      lastPostDate: acc.last_post_date ? new Date(acc.last_post_date).toISOString().slice(0, 16) : '',
      lastPostUrl: acc.last_post_url || '',
      lastPostThumbnail: acc.last_post_thumbnail || '',
      lastPostCaption: acc.last_post_caption || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;
    setSubmitting(true);
    try {
      await api.updateInstagramAccount(editingAccount.id, {
        accountName: editFormData.accountName,
        followersCount: editFormData.followersCount ? parseInt(editFormData.followersCount, 10) : undefined,
        totalPosts: editFormData.totalPosts ? parseInt(editFormData.totalPosts, 10) : undefined,
        lastPostDate: editFormData.lastPostDate ? new Date(editFormData.lastPostDate).toISOString() : undefined,
        lastPostUrl: editFormData.lastPostUrl || undefined,
        lastPostThumbnail: editFormData.lastPostThumbnail || undefined,
        lastPostCaption: editFormData.lastPostCaption || undefined,
      });
      toast.success(`Updated @${editingAccount.username} successfully!`);
      setEditingAccount(null);
      await fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to update Instagram details.');
    } finally {
      setSubmitting(false);
    }
  };


  const formatFollowers = (num) => {
    if (!num) return '0';
    return Number(num).toLocaleString('en-US');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Instagram Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100 flex items-center gap-1">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
              {accounts.length} Handles Monitored
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time automated follower tracking and latest published content feed for official Suryadatta channels.
          </p>
        </div>

        {/* Sync Status & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-xs">
            <span className="text-slate-400 font-medium">Last Synced: </span>
            <strong className="text-slate-700">{lastSyncedFormatted}</strong>
          </div>

          {isAdmin && (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/80 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Add Handle</span>
              </button>

              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-pink-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </>
          )}
        </div>
      </div>


      {/* Cards Grid: Exactly 8 Accounts */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading Instagram channels...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {accounts.map((acc) => {
            const formattedPostDate = acc.last_post_date
              ? new Date(acc.last_post_date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Unknown date';

            return (
              <div
                key={acc.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Account Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={acc.profile_image || `/logos/${acc.username}.png`}
                        alt={acc.account_name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/logos/suryadatta_crest.png';
                        }}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-100 p-0.5 group-hover:scale-105 transition-transform bg-white shadow-2xs"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate leading-snug">
                          {acc.account_name}
                        </h3>
                        <p className="text-xs font-semibold text-pink-600 truncate">
                          @{acc.username}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          title="Edit account & last post details"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.username)}
                          title="Remove handle from tracking"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Followers & Total Posts Metric */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-pink-50/40 border border-slate-100 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          Followers
                        </span>
                        <span className="text-base font-black text-slate-900">
                          {formatFollowers(acc.followers_count)}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-pink-600 shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-100 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          Total Posts
                        </span>
                        <span className="text-base font-black text-slate-900">
                          {formatFollowers(acc.total_posts || 0)}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-purple-600 shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Last Post Section */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span className="uppercase tracking-wider">Last Post</span>
                      <span className="text-pink-600 flex items-center gap-1 text-[10px] font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                        <Clock className="w-3 h-3" />
                        {acc.timeSinceLastPost}
                      </span>
                    </div>

                    {/* Date label */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formattedPostDate}</span>
                    </div>
                  </div>
                </div>

                {/* Open Instagram Button */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <a
                    href={acc.last_post_url || `https://instagram.com/${acc.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 font-semibold text-xs rounded-xl border border-slate-200/60 hover:border-pink-200 transition-colors flex items-center justify-center gap-2 group/btn"
                  >
                    <span>View Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-pink-600 transition-colors" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Handle Modal for Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Add Instagram Handle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Account Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suryadatta Institute"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Handle or Instagram URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. @suryadatta_group or https://instagram.com/suryadatta_group"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Followers Count (approx.)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={formData.followersCount}
                  onChange={(e) => setFormData({ ...formData, followersCount: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Direct Instagram Link (optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.instagram.com/suryadatta_group"
                  value={formData.lastPostUrl}
                  onChange={(e) => setFormData({ ...formData, lastPostUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-pink-600/20 hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account & Last Post Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Edit Account & Last Post
                  </h3>
                  <p className="text-xs text-pink-600 font-semibold">@{editingAccount.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Account Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.accountName}
                  onChange={(e) => setEditFormData({ ...editFormData, accountName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Current Followers
                  </label>
                  <input
                    type="number"
                    value={editFormData.followersCount}
                    onChange={(e) => setEditFormData({ ...editFormData, followersCount: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Total Published Posts
                  </label>
                  <input
                    type="number"
                    value={editFormData.totalPosts}
                    onChange={(e) => setEditFormData({ ...editFormData, totalPosts: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Latest Post Deliverable
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Last Post Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editFormData.lastPostDate}
                    onChange={(e) => setEditFormData({ ...editFormData, lastPostDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Last Post URL (Instagram link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/p/..."
                    value={editFormData.lastPostUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, lastPostUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Post Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editFormData.lastPostThumbnail}
                    onChange={(e) => setEditFormData({ ...editFormData, lastPostThumbnail: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Post Caption / Content Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Write a brief description of the latest post..."
                    value={editFormData.lastPostCaption}
                    onChange={(e) => setEditFormData({ ...editFormData, lastPostCaption: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


