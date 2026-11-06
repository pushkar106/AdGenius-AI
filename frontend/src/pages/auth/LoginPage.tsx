import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const { register, handleSubmit, setValue } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormErrors({});
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
      const errMap: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as 'email' | 'password';
        errMap[field] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });
      const { accessToken, user } = response.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName}!`);

      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setValue('email', 'admin@adgenius.local');
    setValue('password', 'ChangeMeAdmin!234');
  };

  const fillDemoUser = () => {
    setValue('email', 'marketer@brand.ai');
    setValue('password', 'MarketerPass!123');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to AdGenius</h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your credentials to manage campaigns and AI creative studios
        </p>
      </div>

      {/* Quick-fill demo credentials bar */}
      <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800 text-xs">
        <p className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" /> One-Click Demo Credentials:
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="flex-1 py-1 px-2 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 font-medium transition text-[11px]"
          >
            Admin Account
          </button>
          <button
            type="button"
            onClick={fillDemoUser}
            className="flex-1 py-1 px-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-200 border border-slate-700 font-medium transition text-[11px]"
          >
            Brand Marketer
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={formErrors.email}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={formErrors.password}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
            <input type="checkbox" className="rounded bg-dark-800 border-slate-700 text-brand-600 focus:ring-brand-500" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-brand-400 hover:text-brand-300 font-medium transition">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition">
            Create an account (Free 50 Credits)
          </Link>
        </p>
      </div>
    </div>
  );
};
