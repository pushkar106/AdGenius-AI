import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Video,
  Mic,
  Package,
  Layers,
  Image as ImageIcon,
  Coins,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const { user, credits, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue client logout
    }
    logout();
    toast.success('Logged out securely');
    navigate('/login');
  };

  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { header: 'AI Studios' },
    { label: 'AI Image Studio', icon: Sparkles, to: '/ai/images', badge: 'Popular' },
    { label: 'AI Video Studio', icon: Video, to: '/ai/videos', badge: 'Cinematic' },
    { label: 'AI Avatar Studio', icon: Mic, to: '/ai/avatar' },
    { header: 'Assets & Media' },
    { label: 'Products', icon: Package, to: '/products' },
    { label: 'Advertisements', icon: Layers, to: '/advertisements' },
    { label: 'Media Library', icon: ImageIcon, to: '/media' },
    { header: 'Billing & Account' },
    { label: 'Credit Ledger', icon: Coins, to: '/credits' },
    { label: 'Plans & Pricing', icon: CreditCard, to: '/pricing' },
    { label: 'Account Settings', icon: Settings, to: '/settings' },
  ];

  if (isAdmin) {
    navItems.push(
      { header: 'Administration' },
      { label: 'Admin Dashboard', icon: ShieldCheck, to: '/admin', badge: 'Staff' }
    );
  }

  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center shadow-glow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white">
                AdGenius<span className="text-electric-cyan">.AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-brand-400">
                Studio Platform
              </span>
            </div>
          </NavLink>
        </div>

        {/* Credit Quick Widget */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-br from-brand-900/40 via-dark-850 to-dark-800 border border-brand-500/20">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Balance
            </span>
            <span className="font-bold text-white text-sm">{credits} Credits</span>
          </div>
          <p className="text-[11px] text-slate-400">Deducts 2/image, 10/video</p>
          <button
            onClick={() => navigate('/pricing')}
            className="mt-3 w-full py-1 text-xs font-semibold bg-brand-600/30 hover:bg-brand-600 text-brand-200 hover:text-white rounded-lg transition border border-brand-500/30 flex items-center justify-center gap-1"
          >
            Upgrade Plan <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.header) {
              return (
                <div key={idx} className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.header}
                </div>
              );
            }
            const Icon = item.icon!;
            return (
              <NavLink
                key={item.to}
                to={item.to!}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 shadow-glow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile card & Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-dark-950/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-600 to-electric-cyan flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
