import { Menu, Calendar, Bell, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Header({ onMenuClick }) {
  const { user, isAdmin } = useAuth();
  const isDemo = api.isDemoMode();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left section: mobile hamburger + today's date badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>{formattedDate}</span>
        </div>

        {isDemo && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg">
            <Zap className="w-3 h-3 text-amber-600" />
            Standalone Demo Mode
          </span>
        )}
      </div>

      {/* Right section: user badge and profile link */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200/60"
        >
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 capitalize">
              {user?.role} {user?.department ? `• ${user.department}` : ''}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
