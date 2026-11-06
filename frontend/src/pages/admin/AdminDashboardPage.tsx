import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Layers,
  Image as ImageIcon,
  Video,
  DollarSign,
  AlertOctagon,
  Search,
  Lock,
  Unlock,
  Coins,
  UserCheck,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/useAuthStore';
import { AdminMetrics, User } from '../../types';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const { user: currentActor } = useAuthStore();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Credit adjustment modal
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [adjustReason, setAdjustReason] = useState('Admin bonus grant');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Assign role modal
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('ADMIN');
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, usersRes, logsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers({ q: searchQuery || undefined, size: 50 }),
        adminService.getLogs(0, 10).catch(() => ({ data: { content: [] } })),
      ]);
      if (metricsRes.data) setMetrics(metricsRes.data);
      if (usersRes.data?.content) setUsers(usersRes.data.content);
      if (logsRes.data?.content) setLogs(logsRes.data.content);
    } catch {
      toast.error('Failed to load administrative control center');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    adminService.getUsers({ q: searchQuery, size: 50 }).then((res) => {
      if (res.data?.content) setUsers(res.data.content);
    });
  };

  const handleToggleBlock = async (u: User) => {
    const willBlock = u.status !== 'BLOCKED';
    if (!window.confirm(`Are you sure you want to ${willBlock ? 'BLOCK' : 'UNBLOCK'} user ${u.email}?`)) {
      return;
    }
    try {
      const res = await adminService.blockUser(u.id, willBlock);
      setUsers(users.map((item) => (item.id === u.id ? res.data : item)));
      toast.success(`User ${willBlock ? 'blocked and sessions revoked' : 'unblocked'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredit) return;
    setIsAdjusting(true);
    try {
      const amt = parseInt(adjustAmount, 10);
      await adminService.adjustCredits(selectedUserForCredit.id, amt, adjustReason);
      toast.success(`Adjusted ${amt} credits for ${selectedUserForCredit.email}`);
      setSelectedUserForCredit(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust credits');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;
    setIsAssigningRole(true);
    try {
      const res = await adminService.assignRole(selectedUserForRole.id, newRole);
      setUsers(users.map((item) => (item.id === selectedUserForRole.id ? res.data : item)));
      toast.success(`Assigned role ${newRole} to ${selectedUserForRole.email}`);
      setSelectedUserForRole(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign role');
    } finally {
      setIsAssigningRole(false);
    }
  };

  return (
    <div className="pb-20">
      <Header
        title="Super Admin Operations Panel"
        subtitle="Platform-wide governance, user management, credit allocations, and security audit logs."
        actions={
          <Button size="sm" variant="secondary" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Platform Stats
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Registered</span>
              <Users className="w-4 h-4 text-brand-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">{metrics?.totalUsers ?? 1}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Active: {metrics?.activeUsers ?? 1} | Blocked: {metrics?.blockedUsers ?? 0}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Generated Ad Creatives</span>
              <Layers className="w-4 h-4 text-electric-cyan" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">{metrics?.totalAds ?? 24}</p>
            <p className="text-[11px] text-slate-500 mt-1">Saved commercial assets</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Image / Video Jobs</span>
              <ImageIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">
              {metrics?.completedImages ?? 18} / {metrics?.completedVideos ?? 6}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Failed Jobs: {metrics?.failedJobs ?? 0}</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Platform Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">
              ₹{((metrics?.revenuePaise ?? 0) / 100).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Verified Razorpay volume</p>
          </Card>
        </div>

        {/* User Governance Table */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" /> User Directory & Role Governance
              </h3>
              <p className="text-xs text-slate-400">Manage user statuses, allocate credits, and assign roles</p>
            </div>

            <form onSubmit={handleSearch} className="w-full sm:w-72">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </form>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-850/50 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles?.map((r) => (
                          <Badge key={r} variant={r.includes('ADMIN') ? 'brand' : 'neutral'} size="sm">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.company || '—'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedUserForCredit(u)}
                        title="Adjust Credits"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition"
                      >
                        <Coins className="w-4 h-4" />
                      </button>

                      {currentActor?.roles?.includes('SUPER_ADMIN') && (
                        <button
                          onClick={() => setSelectedUserForRole(u)}
                          title="Assign Role"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleBlock(u)}
                        title={u.status === 'BLOCKED' ? 'Unblock User' : 'Block User'}
                        className={`p-1.5 rounded-lg transition ${
                          u.status === 'BLOCKED'
                            ? 'text-rose-400 hover:text-white hover:bg-rose-500/20'
                            : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        {u.status === 'BLOCKED' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Audit Logs */}
        <Card className="p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-4">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Recent System Audit Logs</h3>
          </div>
          <div className="space-y-2">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-slate-300 font-bold">{log.action || 'AUTH_LOGIN'}</span>
                  <span className="text-slate-400">{log.entityType || 'USER'}</span>
                  <span className="text-slate-500 text-[10px]">{log.createdAt || 'Just now'}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No audit logs available.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Credit Adjustment Modal */}
      <Modal
        isOpen={!!selectedUserForCredit}
        onClose={() => setSelectedUserForCredit(null)}
        title="Admin Credit Adjustment"
        description={`Allocate or deduct balance for ${selectedUserForCredit?.email}`}
        size="sm"
      >
        <form onSubmit={handleCreditSubmit} className="space-y-4">
          <Input
            label="Amount (Positive to grant, Negative to deduct)"
            type="number"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
            required
          />

          <Input
            label="Audit Reason"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setSelectedUserForCredit(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isAdjusting}>
              Save Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={!!selectedUserForRole}
        onClose={() => setSelectedUserForRole(null)}
        title="Assign Security Role"
        description={`Change authorization level for ${selectedUserForRole?.email}`}
        size="sm"
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="USER">USER (Standard Marketer)</option>
              <option value="ADMIN">ADMIN (Staff Operations & Support)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setSelectedUserForRole(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isAssigningRole}>
              Update Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
