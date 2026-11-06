import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset instructions sent');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your registered email address and we will send you a reset link
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300">
            If an account exists for <span className="font-semibold text-white">{email}</span>, you will receive an email shortly with reset instructions.
          </p>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="secondary" className="w-full" size="md">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Send Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
