// src/pages/Settings/AccountSettings.tsx
import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  Globe,
  Moon,
  Sun,
  Save,
  Loader2,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Mail,
  MessageSquare,
  Megaphone,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';

interface SettingsState {
  notificationPrefs: {
    email: boolean;
    inApp: boolean;
    announcements: boolean;
    scheduleChanges: boolean;
    enrollmentUpdates: boolean;
  };
  appearance: {
    theme: 'light' | 'dark';
    language: string;
  };
}

const defaultSettings: SettingsState = {
  notificationPrefs: {
    email: true,
    inApp: true,
    announcements: true,
    scheduleChanges: true,
    enrollmentUpdates: true,
  },
  appearance: {
    theme: 'light',
    language: 'en',
  },
};

// Toggle component
const Toggle: React.FC<{
  label: string;
  description: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, icon: Icon, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="w-full flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all text-left"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${checked ? 'bg-cyan-50' : 'bg-slate-100'}`}>
      <Icon className={`w-5 h-5 ${checked ? 'text-cyan-600' : 'text-slate-400'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <div
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
        checked ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'
      }`}
    >
      {checked && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
  </button>
);

export const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = usePersistentState<SettingsState>(
    'smart_sched_settings',
    defaultSettings
  );

  const [isSaving, setIsSaving] = useState(false);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('success', 'Settings Saved', 'Your preferences have been updated.');
    }, 500);
  };

  const handleChangePassword = () => {
    setPasswordError('');
    if (!passwordForm.current) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordForm.newPass || passwordForm.newPass.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChanging(true);
    setTimeout(() => {
      setIsChanging(false);
      setShowPasswordModal(false);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      showToast('success', 'Password Changed', 'Your password has been updated.');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your account preferences and security
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Account */}
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-500" />
          Account
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email
            </p>
            <p className="text-sm font-medium text-slate-900 break-all">{user?.email}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Role
            </p>
            <p className="text-sm font-medium text-slate-900 capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="outline"
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-500" />
          Notification Preferences
        </h2>
        <div className="space-y-3">
          <Toggle
            label="Email Notifications"
            description="Receive important updates via email"
            icon={Mail}
            checked={settings.notificationPrefs.email}
            onChange={(v) =>
              setSettings({
                ...settings,
                notificationPrefs: { ...settings.notificationPrefs, email: v },
              })
            }
          />
          <Toggle
            label="In-App Notifications"
            description="See notifications in the bell menu"
            icon={Bell}
            checked={settings.notificationPrefs.inApp}
            onChange={(v) =>
              setSettings({
                ...settings,
                notificationPrefs: { ...settings.notificationPrefs, inApp: v },
              })
            }
          />
          <Toggle
            label="Announcements"
            description="School-wide news and updates"
            icon={Megaphone}
            checked={settings.notificationPrefs.announcements}
            onChange={(v) =>
              setSettings({
                ...settings,
                notificationPrefs: { ...settings.notificationPrefs, announcements: v },
              })
            }
          />
          <Toggle
            label="Schedule Changes"
            description="When classes are moved or updated"
            icon={MessageSquare}
            checked={settings.notificationPrefs.scheduleChanges}
            onChange={(v) =>
              setSettings({
                ...settings,
                notificationPrefs: { ...settings.notificationPrefs, scheduleChanges: v },
              })
            }
          />
          <Toggle
            label="Enrollment Updates"
            description="Status changes on your enrollment"
            icon={CheckCircle2}
            checked={settings.notificationPrefs.enrollmentUpdates}
            onChange={(v) =>
              setSettings({
                ...settings,
                notificationPrefs: { ...settings.notificationPrefs, enrollmentUpdates: v },
              })
            }
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-cyan-500" />
          Appearance & Language
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSettings({ ...settings, appearance: { ...settings.appearance, theme: 'light' } })
                }
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  settings.appearance.theme === 'light'
                    ? 'border-cyan bg-cyan-50 text-cyan-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() =>
                  setSettings({ ...settings, appearance: { ...settings.appearance, theme: 'dark' } })
                }
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  settings.appearance.theme === 'dark'
                    ? 'border-cyan bg-cyan-50 text-cyan-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Dark mode support coming soon — currently cosmetic
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Language
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
              <select
                value={settings.appearance.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, language: e.target.value },
                  })
                }
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-cyan transition-all"
              >
                <option value="en">English</option>
                <option value="fil">Filipino</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-base font-bold text-red-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h2>
        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">Sign out of all devices</p>
            <p className="text-xs text-red-700 mt-1">
              This will end your session everywhere. You will need to log in again.
            </p>
            <button
              onClick={() => showToast('info', 'Demo mode', 'Sign out works via the user menu.')}
              className="mt-3 px-4 py-2 text-xs font-bold text-red-700 bg-white border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Sign out everywhere
            </button>
          </div>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ current: '', newPass: '', confirm: '' });
          setPasswordError('');
        }}
        maxWidth="max-w-md"
      >
        <div className="relative px-6 py-5 bg-gradient-to-r from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Change Password</h3>
              <p className="text-xs text-white/70 mt-0.5">Update your account password</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-11 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 pr-11 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan"
            />
          </div>

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {passwordError}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordForm({ current: '', newPass: '', confirm: '' });
              setPasswordError('');
            }}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            disabled={isChanging}
            className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isChanging ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AccountSettings;