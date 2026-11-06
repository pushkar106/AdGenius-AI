import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-950/70 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center shadow-glow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AdGenius<span className="text-electric-cyan">.AI</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400">
              Enterprise Ads Engine
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#showcase" className="hover:text-white transition">Showcase</a>
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition px-3 py-2">
                Sign In
              </Link>
              <Button
                onClick={() => navigate('/register')}
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Free Trial
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-b border-slate-800 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-base font-medium text-slate-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)}>Showcase</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          </div>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} variant="primary" className="w-full">
                Open Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-center py-2 text-sm text-slate-300">
                  Sign In
                </Link>
                <Button onClick={() => navigate('/register')} variant="primary" className="w-full">
                  Start Free Trial
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
