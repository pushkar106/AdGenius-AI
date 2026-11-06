import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, Layers } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-hero-glow pointer-events-none -z-10" />

      {/* Top logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center shadow-glow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            AdGenius<span className="text-electric-cyan">.AI</span>
          </span>
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Enterprise AI Creative Infrastructure
        </p>
      </div>

      {/* Form container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-dark-900/80 backdrop-blur-2xl border border-slate-800/90 py-8 px-6 sm:px-10 shadow-glass rounded-3xl">
          <Outlet />
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit SSL</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> GPU Accelerated</span>
          <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-brand-400" /> Multi-Model</span>
        </div>
      </div>
    </div>
  );
};
