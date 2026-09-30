import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Server,
  AlertTriangle,
  Settings,
  RefreshCw,
  CheckCircle2,
  Globe,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { user, login, isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [is404Error, setIs404Error] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const isDemo = api.isDemoMode();

  useEffect(() => {
    setServerUrlInput(api.getBackendUrl());
  }, []);

  const socialMediaInterns = [
    { name: 'Ganesh', username: 'ganesh', dept: 'SIHS' },
    { name: 'Shravan', username: 'shravan', dept: 'MBA/SIFT' },
    { name: 'Sakshi', username: 'sakshi', dept: 'SCMIRT' },
    { name: 'Chinmay', username: 'chinmay', dept: 'SGI/SLC' },
    { name: 'Chiranjeev', username: 'chiranjeev', dept: 'SNS' },
    { name: 'Anushka', username: 'anushka', dept: 'SCHMTT' },
    { name: 'Neel Rathod', username: 'neel', dept: 'SCPHR' },
    { name: 'Hena', username: 'hena', dept: 'MCA/BCA' },
    { name: 'Harshali', username: 'harshali', dept: 'SJC/SPS' },
    { name: 'Harshad', username: 'harshad', dept: 'SCNPST/SIICS' },
  ];

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIs404Error(false);

    if (!identifier.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('[Login Error]:', err);
      if (err.isBackendUnavailable || err.is404 || err.status === 404) {
        setIs404Error(true);
        setError('Request failed with status 404: Backend API server is not reachable from this Netlify domain.');
      } else {
        setError(err.message || 'Invalid username or password.');
        toast.error(err.message || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnableDemoMode = async () => {
    api.setDemoMode(true);
    setIs404Error(false);
    setError('');
    toast.success('⚡ Demo Mode enabled! Logging in...');

    const chosenId = identifier.trim() || 'harshad';
    const chosenPass = password || (chosenId === 'harshad' ? '123321' : 'Password123!');

    setLoading(true);
    try {
      const loggedUser = await login(chosenId, chosenPass);
      toast.success(`Welcome, ${loggedUser.name}!`);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAndSaveServerUrl = async (e) => {
    e.preventDefault();
    setTestingConnection(true);
    setTestResult(null);

    const cleanUrl = serverUrlInput.trim().replace(/\/+$/, '');
    try {
      const healthCheck = await fetch(`${cleanUrl}/health`, { signal: AbortSignal.timeout(6000) });
      if (healthCheck.ok) {
        const data = await healthCheck.json();
        setTestResult({ success: true, message: `Connected! Service: ${data.service || 'Backend API'}` });
        api.setBackendUrl(cleanUrl);
        toast.success('Backend connected successfully!');
        setTimeout(() => setShowServerModal(false), 1200);
      } else {
        setTestResult({ success: false, message: `Server responded with status ${healthCheck.status}` });
      }
    } catch (err) {
      // If /health not found, still save if user wants
      setTestResult({
        success: false,
        message: `Could not reach ${cleanUrl}. Ensure CORS allows this domain and the server is running.`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleForceSaveUrl = () => {
    const cleanUrl = serverUrlInput.trim().replace(/\/+$/, '');
    api.setBackendUrl(cleanUrl);
    toast.success('Backend URL saved!');
    setShowServerModal(false);
  };

  const fillAdmin = () => {
    setIdentifier('admin');
    setPassword('Password123!');
  };

  const handleSelectIntern = (e) => {
    const username = e.target.value;
    if (username) {
      setIdentifier(username);
      if (username === 'harshad') {
        setPassword('123321');
      } else {
        setPassword('Password123!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full">
        {/* Top Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/30 text-white font-black text-2xl mb-4 transform hover:scale-105 transition-transform">
            IT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Intern Report Tracker
          </h1>
          <p className="text-sm text-indigo-200/70 mt-1">
            Social Media Internship Management & Daily Reporting
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in with your assigned Username or Email
              </p>
            </div>
            {isDemo && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                Demo Mode
              </span>
            )}
          </div>

          {/* Standard Error */}
          {error && !is404Error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 leading-relaxed">
              {error}
            </div>
          )}

          {/* 404 Backend Detection Banner */}
          {is404Error && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-left space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-amber-200/80 rounded-lg text-amber-800 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Backend Server Not Connected (HTTP 404)</h4>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    Netlify is currently hosting the static frontend, but your Node backend is not connected. Choose how you want to proceed:
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleEnableDemoMode}
                  className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Demo Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowServerModal(true)}
                  className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Connect Backend URL</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. harshad or admin"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                Remember session
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Select Section for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick Fill for Social Media Interns
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200/60"
              >
                Admin (admin)
              </button>

              <select
                onChange={handleSelectIntern}
                defaultValue=""
                className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60 focus:outline-none"
              >
                <option value="" disabled>Select Intern...</option>
                {socialMediaInterns.map((i) => (
                  <option key={i.username} value={i.username}>
                    {i.name} ({i.dept})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Server Config & Mode Toggle Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <button
              type="button"
              onClick={() => setShowServerModal(true)}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Backend API Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !isDemo;
                api.setDemoMode(next);
                toast.info(next ? 'Switched to In-Browser Demo Mode.' : 'Switched to Live Backend Mode.');
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isDemo ? 'Use Live Server' : 'Use Demo Mode'}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-indigo-200/50">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted with bcrypt & secure session auth</span>
        </div>
      </div>

      {/* Backend API Configuration Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Backend Server Settings</h3>
                <p className="text-xs text-slate-500">Connect a deployed backend or external API</p>
              </div>
            </div>

            <form onSubmit={handleTestAndSaveServerUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Backend API URL
                </label>
                <input
                  type="text"
                  required
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="https://your-backend.onrender.com/api"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Example: <code>https://intern-tracker-api.onrender.com/api</code> or a local tunnel.
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={testingConnection}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {testingConnection && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Test & Connect</span>
                </button>
                <button
                  type="button"
                  onClick={handleForceSaveUrl}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  Save Anyway
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    api.setBackendUrl('/api');
                    setServerUrlInput('/api');
                    toast.info('Reset to default /api');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Reset to default
                </button>
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Forgot Password</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Please contact the system administrator at <strong>admin@example.com</strong> to reset your password.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
