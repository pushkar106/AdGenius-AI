import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  company: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const { register, handleSubmit } = useForm<RegisterFormValues>();

  const onSubmit = async (values: RegisterFormValues) => {
    setFormErrors({});
    const validation = registerSchema.safeParse(values);
    if (!validation.success) {
      const errMap: { [key: string]: string } = {};
      validation.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        errMap[field] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        company: values.company || undefined,
      });
      setRegisteredEmail(values.email);
      toast.success('Account created! Welcome to AdGenius AI.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Verification Link Sent!</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          We sent a verification email to <span className="font-semibold text-slate-200">{registeredEmail}</span>. You can also sign in right away using your new credentials.
        </p>
        <div className="pt-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Continue to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create your AdGenius Account</h2>
        <p className="mt-1 text-xs text-slate-400">
          Get 50 free credits immediately to test AI images and video ads
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label="Full Name"
          placeholder="Alex Morgan"
          leftIcon={<UserIcon className="w-4 h-4" />}
          error={formErrors.fullName}
          {...register('fullName')}
        />

        <Input
          label="Company / Brand (Optional)"
          placeholder="Lumina Goods"
          leftIcon={<Building2 className="w-4 h-4" />}
          error={formErrors.company}
          {...register('company')}
        />

        <Input
          label="Work Email"
          type="email"
          placeholder="alex@luminagoods.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={formErrors.email}
          {...register('email')}
        />

        <Input
          label="Password (min. 8 characters)"
          type="password"
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={formErrors.password}
          {...register('password')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account (50 Free Credits)
          </Button>
        </div>
      </form>

      <div className="text-center pt-2 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
