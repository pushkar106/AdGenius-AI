import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token missing from link');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success('Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification link expired or invalid');
      });
  }, [token]);

  return (
    <div className="text-center space-y-6 py-4">
      {status === 'verifying' && (
        <div className="space-y-3">
          <LoadingSpinner size="lg" text="Verifying your email address..." />
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your AdGenius AI account is now fully active. You can start creating AI ads and accessing all platform tools.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
          <p className="text-xs text-rose-400 max-w-sm mx-auto">{errorMessage}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
