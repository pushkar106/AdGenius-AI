import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-6 shadow-glow-md">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-7xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
        The creative canvas or studio page you are looking for has been moved or does not exist in this realm.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => navigate(-1)} variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Go Back
        </Button>
        <Button onClick={() => navigate('/')} variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Return Home
        </Button>
      </div>
    </div>
  );
};
