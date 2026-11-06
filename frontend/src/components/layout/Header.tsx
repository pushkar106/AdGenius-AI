import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Coins, Bell, Sparkles, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const { credits, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-dark-950/70 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {actions}

        {/* Credit pill */}
        <button
          onClick={() => navigate('/credits')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-850 hover:bg-dark-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition group"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Coins className="w-3 h-3" />
          </div>
          <span>{credits}</span>
          <span className="text-[10px] text-slate-400 group-hover:text-brand-300 transition">Credits</span>
        </button>

        {/* Demo mode badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live / Demo Safe
        </div>

        {/* Notification bell */}
        <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};
