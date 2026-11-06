import React, { useState } from 'react';
import {
  User,
  Lock,
  Building2,
  Mail,
  Globe,
  Shield,
  Key,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [company, setCompany] = useState(user?.company || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await authService.updateMe({
        fullName,
        company,
        timezone,
      });
      updateUser(res.data);
      toast.success('Profile details updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Incorrect current password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="pb-20">
      <Header
        title="Account & Security Settings"
        subtitle="Manage personal profile, authentication credentials, and platform environment settings."
      />

      <div className="max-w-4xl mx-auto px-8 pt-8 space-y-8">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Public Marketer Profile</h3>
                <p className="text-xs text-slate-400">Personal information associated with your account</p>
              </div>
            </div>
            <Badge variant="brand">{user?.roles?.[0] || 'USER'}</Badge>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Company / Brand"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                leftIcon={<Building2 className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Email (Immutable)"
                value={user?.email || ''}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="Asia/Kolkata">IST (Asia / Kolkata)</option>
                  <option value="America/New_York">EST (America / New York)</option>
                  <option value="America/Los_Angeles">PST (America / Los Angeles)</option>
                  <option value="Europe/London">GMT (Europe / London)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSavingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Password & Security Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-electric-cyan/15 text-electric-cyan flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Password & Authentication</h3>
              <p className="text-xs text-slate-400">Update your account password with BCrypt hashing</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              leftIcon={<Key className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isUpdatingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* AI Engine & System Runtime Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Engine Integration Architecture</h3>
              <p className="text-xs text-slate-400">Runtime providers and fallback modes</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">OpenAI Image Diffusion Provider</span>
                <span className="text-[11px] text-slate-400">Official DALL-E / Diffusion backend API connector</span>
              </div>
              <Badge variant="success">Auto-Fallback Demo Ready</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Replicate Video Generation Provider</span>
                <span className="text-[11px] text-slate-400">Stable Video Diffusion asynchronous job executor</span>
              </div>
              <Badge variant="success">Auto-Fallback Demo Ready</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Razorpay Payment Gateway</span>
                <span className="text-[11px] text-slate-400">Indian Rupee checkout with HMAC-SHA256 signature verification</span>
              </div>
              <Badge variant="success">Sandbox Enabled</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
