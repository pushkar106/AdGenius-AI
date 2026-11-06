import React from 'react';
import { Sparkles, Heart, Shield, Cpu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AdGenius<span className="text-electric-cyan">.AI</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Autonomous AI advertising engine for high-growth e-commerce, D2C brands, and marketing teams. Generate cinematic visuals, promotional video reels, and high-converting marketing scripts in seconds.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Enterprise SLA</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-brand-400" /> Multi-Model Architecture</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Real-time Render</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">AI Generators</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/ai/images" className="hover:text-white transition">Product Image Studio</Link></li>
              <li><Link to="/ai/videos" className="hover:text-white transition">Promotional Video Studio</Link></li>
              <li><Link to="/ai/avatar" className="hover:text-white transition">Presenter Avatar Studio</Link></li>
              <li><Link to="/ai/avatar" className="hover:text-white transition">Marketing Script AI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="hover:text-white transition">Product Catalog</Link></li>
              <li><Link to="/advertisements" className="hover:text-white transition">Creative Gallery</Link></li>
              <li><Link to="/media" className="hover:text-white transition">Media Vault</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Subscription Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Trust & Security</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-400">SOC2 Type II Aligned</span></li>
              <li><span className="text-slate-400">AWS Private S3 Storage</span></li>
              <li><span className="text-slate-400">Razorpay Verified Checkout</span></li>
              <li><span className="text-slate-400">Zero Data Training Clause</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AdGenius AI, Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for high performance and visual excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};
