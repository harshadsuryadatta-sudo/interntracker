import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Mail, Lock, Phone, Building, Calendar, Image as ImageIcon, Upload } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function InternModal({
  isOpen,
  onClose,
  internToEdit = null,
  onSuccess,
}) {
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Full Stack Engineering');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (internToEdit) {
        setName(internToEdit.name || '');
        setEmail(internToEdit.email || '');
        setPassword('');
        setDepartment(internToEdit.department || 'Full Stack Engineering');
        setPhone(internToEdit.phone || '');
        setJoiningDate(
          internToEdit.joining_date
            ? String(internToEdit.joining_date).split('T')[0]
            : ''
        );
        setProfilePhoto(internToEdit.profile_photo || '');
        setStatus(internToEdit.status || 'active');
        setPassword('');
      } else {
        setName('');
        setEmail('');
        setPassword('Password123!');
        setDepartment('Full Stack Engineering');
        setPhone('');
        setJoiningDate(new Date().toISOString().split('T')[0]);
        setProfilePhoto('');
        setStatus('active');
      }
    }
  }, [isOpen, internToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    if (!internToEdit && (!password || password.length < 6)) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (internToEdit && password && password.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (internToEdit) {
        await api.updateIntern(internToEdit.id, {
          name,
          email,
          department,
          phone,
          joiningDate,
          profilePhoto,
          status,
          password: password ? password : undefined,
        });
        toast.success(`Intern "${name}" updated successfully.`);
      } else {
        await api.createIntern({
          name,
          email,
          password,
          department,
          phone,
          joiningDate,
          profilePhoto,
        });
        toast.success(`Intern "${name}" created successfully.`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              {internToEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {internToEdit ? 'Edit Intern Profile' : 'Add New Intern'}
              </h2>
              <p className="text-xs text-slate-500">
                {internToEdit ? 'Update details, department, or status' : 'Create an intern account with credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {internToEdit ? 'Change Password (optional)' : 'Initial Password'} {!internToEdit && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required={!internToEdit}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={internToEdit ? 'Leave blank to keep unchanged (min 6 chars to change)' : 'Min 6 characters (e.g. 123321)'}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            {internToEdit && (
              <p className="text-[11px] text-slate-400 mt-1">
                Admin can directly update this intern's login password here.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="Full Stack Engineering">Full Stack Engineering</option>
                <option value="Backend & Data Systems">Backend & Data Systems</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Social Media & Growth">Social Media & Growth</option>
                <option value="Product Operations">Product Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled / Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                Profile Photo
              </label>
              {profilePhoto && (
                <button
                  type="button"
                  onClick={() => setProfilePhoto('')}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-medium"
                >
                  Clear Photo
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 border border-dashed border-slate-300">
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                </div>
              )}
              <div className="flex-1 space-y-1.5">
                <input
                  type="url"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/... or upload below"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Choose file from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        toast.error('Please choose a valid image file');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setProfilePhoto(reader.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {internToEdit ? 'Save Changes' : 'Create Intern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
