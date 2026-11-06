import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { subscriptionService } from '../../services/subscriptionService';
import { creditService } from '../../services/creditService';
import { useAuthStore } from '../../store/useAuthStore';
import { Subscription, SubscriptionPlan } from '../../types';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const { credits, updateCredits } = useAuthStore();
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const plans = [
    {
      code: 'FREE',
      name: 'Free Plan',
      description: 'Test out AdGenius with complimentary welcome credits.',
      monthlyPrice: '₹0',
      yearlyPrice: '₹0',
      credits: '50 Credits initial',
      features: [
        '50 Free welcome credits',
        'Standard HD Image Generation',
        'Catalog management (up to 5 products)',
        'Private storage vault',
        'Community email support',
      ],
      current: true,
    },
    {
      code: 'STARTER',
      name: 'Starter Plan',
      description: 'Ideal for solopreneurs launching their first ad campaigns.',
      monthlyPrice: '₹1,499',
      yearlyPrice: '₹14,990',
      credits: '300 Monthly Credits',
      features: [
        '300 Monthly Credits (refills every month)',
        'HD Image Commercials (150 images/mo)',
        'Promotional Video Reels (10 videos/mo)',
        'Avatar Presenter Studio',
        'Standard GPU rendering queue',
        'Priority email assistance',
      ],
    },
    {
      code: 'PRO',
      name: 'Pro Brand Plan',
      badge: 'Most Popular',
      description: 'For growing e-commerce teams requiring high-volume creatives.',
      monthlyPrice: '₹4,999',
      yearlyPrice: '₹49,990',
      credits: '1,200 Monthly Credits',
      features: [
        '1,200 Monthly Credits',
        '4K Ultra HD Commercials',
        'Extended Video Reels (120 videos/mo)',
        'Multi-aspect ratio simultaneous batch render',
        'Dedicated fast-track GPU cluster',
        'Priority 24/7 Slack & Email support',
      ],
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Custom',
      description: 'Tailored limits, custom trained models, and dedicated SLA.',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      credits: '10,000+ Credits',
      features: [
        '10,000+ Tailored monthly credits',
        'Custom LoRA / Brand Voice training',
        'Single Sign-On (SSO) & Role-based team access',
        'Private S3 storage integration',
        'Dedicated Enterprise Account Manager',
        '99.9% Uptime Service Level Agreement',
      ],
    },
  ];

  useEffect(() => {
    subscriptionService
      .getCurrent()
      .then((res) => {
        if (res.data) setCurrentSubscription(res.data);
      })
      .catch(() => {});
  }, []);

  const handleCheckout = async (planCode: string) => {
    if (planCode === 'FREE') {
      toast('You are already enjoying the Free Plan!');
      return;
    }
    if (planCode === 'ENTERPRISE') {
      toast.success('Our sales engineering team will reach out to schedule an Enterprise demo.');
      return;
    }

    setIsProcessing(planCode);
    try {
      const response = await subscriptionService.checkout(planCode, billingInterval);
      const checkoutData = response.data;

      // Handle Sandbox / Demo checkout simulation
      if (checkoutData.demoMode || !checkoutData.keyId) {
        toast.success(
          `Demo Payment Simulated: Successfully upgraded to ${planCode}! Adding monthly credits...`
        );
        // Refresh credit balance
        const balanceRes = await creditService.getBalance();
        if (balanceRes.data) updateCredits(balanceRes.data.balance);
      } else {
        // Live Razorpay popup integration if SDK is available
        const options = {
          key: checkoutData.keyId,
          amount: checkoutData.amountPaise,
          currency: checkoutData.currency || 'INR',
          name: 'AdGenius AI',
          description: `Subscription: ${planCode} Plan (${billingInterval})`,
          order_id: checkoutData.orderId,
          handler: function (razorpayResponse: any) {
            toast.success('Payment verified successfully! Plan activated.');
            creditService.getBalance().then((b) => b.data && updateCredits(b.data.balance));
          },
          theme: { color: '#8B5CF6' },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout initiation failed');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="pb-20">
      <Header
        title="Subscription Plans & Quotas"
        subtitle="Upgrade your creative engine. Deductions scale strictly by usage with zero hidden charges."
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-10">
        {/* Interval toggle */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <Badge variant="brand">Flexible Subscription</Badge>
          <h2 className="text-2xl font-black text-white">Choose Your Ideal AI Creative Quota</h2>
          <div className="inline-flex items-center p-1 rounded-xl bg-dark-900 border border-slate-800">
            <button
              onClick={() => setBillingInterval('MONTHLY')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
                billingInterval === 'MONTHLY' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setBillingInterval('YEARLY')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                billingInterval === 'YEARLY' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Billed Annually</span>
              <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">2 Months Free</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const price = billingInterval === 'MONTHLY' ? p.monthlyPrice : p.yearlyPrice;
            const suffix = billingInterval === 'MONTHLY' ? '/mo' : '/yr';
            const isCurrent = currentSubscription?.plan?.code === p.code || (p.code === 'FREE' && !currentSubscription);

            return (
              <Card
                key={p.code}
                glow={p.badge !== undefined}
                className={`p-6 flex flex-col justify-between relative ${
                  p.badge ? 'border-brand-500/50 shadow-glow-md' : ''
                }`}
              >
                <div>
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-electric-cyan text-[10px] font-extrabold uppercase tracking-wider text-white shadow-glow-sm">
                      {p.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    {isCurrent && <Badge variant="success">Current Plan</Badge>}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 min-h-[32px]">{p.description}</p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{price}</span>
                    {price !== 'Custom' && <span className="text-xs text-slate-400">{suffix}</span>}
                  </div>

                  <p className="mt-2 text-xs font-bold text-brand-300">{p.credits}</p>

                  <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Features included:</p>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Button
                    onClick={() => handleCheckout(p.code)}
                    disabled={isCurrent || isProcessing === p.code}
                    isLoading={isProcessing === p.code}
                    variant={p.badge ? 'primary' : 'secondary'}
                    className="w-full"
                    size="md"
                  >
                    {isCurrent ? 'Current Plan' : p.code === 'ENTERPRISE' ? 'Contact Sales' : `Upgrade to ${p.name}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Trust & Guarantee Banner */}
        <Card className="p-8 bg-dark-900/60 border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Credit Safety Guarantee</h4>
              <p className="text-xs text-slate-400">
                Credits are only deducted on successful renders. Provider timeouts are auto-refunded to your ledger.
              </p>
            </div>

            <div className="space-y-2">
              <CreditCard className="w-7 h-7 text-brand-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Razorpay Secure Checkout</h4>
              <p className="text-xs text-slate-400">
                Supports UPI, Credit Cards, NetBanking, and Corporate Cards with bank-grade 256-bit encryption.
              </p>
            </div>

            <div className="space-y-2">
              <Zap className="w-7 h-7 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Instant Credit Allocation</h4>
              <p className="text-xs text-slate-400">
                Your monthly creative quota is credited immediately upon payment webhook confirmation.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
