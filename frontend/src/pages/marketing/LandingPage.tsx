import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Play,
  CheckCircle,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Star,
  Sliders,
  TrendingUp,
  Video,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const sampleAds = [
    {
      title: 'Aura Luxury Chronograph',
      category: 'Luxury & Jewelry',
      style: 'Studio Cinematic',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      roas: '5.2x ROAS',
    },
    {
      title: 'Botanical Serum Elixir',
      category: 'Beauty & Skincare',
      style: 'Minimalist Splash',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      roas: '4.8x ROAS',
    },
    {
      title: 'Nova Apex Runner',
      category: 'Athletics & Footwear',
      style: 'Futuristic Cyberpunk',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      roas: '6.1x ROAS',
    },
  ];

  const faqs = [
    {
      q: 'How does AdGenius AI create advertisements from a single photo?',
      a: 'AdGenius AI utilizes advanced diffusion models and computer vision pipelines to analyze your product reference image, separate the subject from its original background, and composite it into photorealistic 3D environments, studio lighting, or dynamic lifestyle video scenes.',
    },
    {
      q: 'Do I need my own OpenAI or Replicate API keys to test?',
      a: 'No! AdGenius AI has built-in production-grade demo fallbacks that simulate realistic generation progress, metadata, and asset storage if live API keys are not supplied in the environment.',
    },
    {
      q: 'How does the credit system and billing policy work?',
      a: 'Every new account receives 50 free credits upon signup. Generating an image ad costs 2 credits, and a full video ad costs 10 credits. If a generation job fails due to an upstream provider timeout, your credits are automatically refunded to your ledger.',
    },
    {
      q: 'Can I export high-resolution ads for Meta, Instagram Reels, and TikTok?',
      a: 'Yes. You can generate ads in 1:1 square (Instagram feed), 9:16 vertical (Reels, TikTok, Stories), and 16:9 widescreen (YouTube, Web banners) with crisp resolution.',
    },
    {
      q: 'Can I cancel or downgrade my subscription at any time?',
      a: 'Yes, subscriptions can be modified or cancelled instantly through your billing settings without lock-ins.',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Glowing radial backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-hero-glow pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-300 mb-6 shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" />
          <span>Next-Gen AdGenius 2.0 Engine Released</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Generate High-Converting{' '}
          <span className="bg-gradient-to-r from-brand-400 via-electric-violet to-electric-cyan bg-clip-text text-transparent">
            AI Product Advertisements
          </span>{' '}
          in Seconds
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Transform ordinary product photos into studio-grade commercial ads, promotional video reels, and high-converting marketing copy with enterprise artificial intelligence.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/register')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto text-base px-8 py-3.5"
          >
            Start Free Trial (50 Free Credits)
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/login')}
            leftIcon={<Play className="w-4 h-4 text-electric-cyan" />}
            className="w-full sm:w-auto text-base"
          >
            Live Demo Access
          </Button>
        </div>

        {/* Hero Interactive Showcase preview */}
        <div className="mt-16 max-w-5xl mx-auto">
          <Card glass glow className="p-3 sm:p-4 rounded-3xl border-slate-700/80">
            <div className="relative rounded-2xl overflow-hidden bg-dark-950 aspect-[16/9] border border-slate-800 flex flex-col justify-between p-6">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-3 text-xs font-mono text-slate-400">adgenius-ai-studio // live-canvas</span>
                </div>
                <Badge variant="success">AI Diffusion Render: Active</Badge>
              </div>

              {/* Showcase Banner overlay */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto z-10">
                {sampleAds.map((ad, i) => (
                  <div key={i} className="group relative rounded-xl overflow-hidden bg-dark-900 border border-slate-800 shadow-lg">
                    <img src={ad.image} alt={ad.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{ad.title}</p>
                        <p className="text-[10px] text-slate-400">{ad.style}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                        {ad.roas}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 z-10">
                <span>Multi-Model Engine: OpenAI DALL·E 3 + Replicate SVD</span>
                <span className="text-brand-300 font-medium">99.8% Brand Safety Compliance</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-dark-900/50 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400">Enterprise Capabilities</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              Everything Your Brand Needs to Scale Ad Creatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card interactive className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Photorealistic AI Image Ads</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Generate 10+ distinct commercial visual styles: Luxury, Minimalist, 3D Render, Cinematic, and Studio Photography tailored to your exact brand voice.
              </p>
            </Card>

            <Card interactive className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-electric-cyan/20 text-electric-cyan flex items-center justify-center mb-6">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Dynamic AI Video Commercials</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Turn static product shots into high-engagement promotional reels with camera zoom, dynamic lighting, and fluid motion ready for TikTok and Instagram.
              </p>
            </Card>

            <Card interactive className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Copy & Script Generator</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Generate high-converting advertising headlines, video voiceover scripts, social media captions, and hashtags optimized for conversion rate and CTR.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400">Streamlined Workflow</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">From Raw Image to Live Ad in 4 Steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Upload Product', desc: 'Drag and drop your phone photo or e-commerce transparent PNG' },
            { step: '02', title: 'Select Aesthetics', desc: 'Pick your visual style, aspect ratio (1:1, 9:16, 16:9), and prompt tone' },
            { step: '03', title: 'AI Synthesis', desc: 'AdGenius AI generates high-definition image and video variations' },
            { step: '04', title: 'Launch & Convert', desc: 'Download high-res media directly to your ad manager and boost ROAS' },
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-dark-900 border border-slate-800">
              <span className="text-3xl font-extrabold text-brand-500/30 font-mono">{item.step}</span>
              <h4 className="mt-3 text-lg font-bold text-white">{item.title}</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-20 bg-dark-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400">Flexible Pricing</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Transparent Credit-Based Plans</p>
            <p className="mt-3 text-sm text-slate-400">Pay only for what you generate. Credits never expire during active subscription.</p>

            <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-dark-850 border border-slate-800">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${billingPeriod === 'monthly' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${billingPeriod === 'yearly' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Yearly (2 Months Free)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '₹0',
                period: 'forever',
                credits: '50 credits',
                features: ['50 Initial Credits', 'Image Studio access', 'Standard resolution', 'Community support'],
                cta: 'Get Started',
                variant: 'secondary' as const,
              },
              {
                name: 'Starter',
                price: billingPeriod === 'monthly' ? '₹1,499' : '₹14,990',
                period: billingPeriod === 'monthly' ? '/mo' : '/yr',
                credits: '300 monthly credits',
                features: ['300 Monthly Credits', 'HD Image generation', 'Short video ads (10/mo)', 'Priority queue'],
                cta: 'Choose Starter',
                variant: 'secondary' as const,
              },
              {
                name: 'Pro',
                price: billingPeriod === 'monthly' ? '₹4,999' : '₹49,990',
                period: billingPeriod === 'monthly' ? '/mo' : '/yr',
                credits: '1,200 monthly credits',
                badge: 'Most Popular',
                features: ['1,200 Monthly Credits', '4K-ready rendering', 'Promotional video reels', 'AI Copy Studio', 'Priority support'],
                cta: 'Upgrade to Pro',
                variant: 'primary' as const,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'tailored',
                credits: '10,000+ credits',
                features: ['Dedicated GPU Cluster', 'Custom Brand Models', 'SSO & Role Control', 'Dedicated Manager'],
                cta: 'Contact Sales',
                variant: 'secondary' as const,
              },
            ].map((plan, i) => (
              <Card key={i} glow={plan.badge !== undefined} className={`p-6 flex flex-col justify-between ${plan.badge ? 'border-brand-500/50' : ''}`}>
                <div>
                  {plan.badge && <Badge variant="brand" className="mb-3">{plan.badge}</Badge>}
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-brand-300">{plan.credits}</p>
                  <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => navigate('/register')}
                  variant={plan.variant}
                  className="mt-8 w-full"
                  size="md"
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Illustrative Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="neutral">Illustrative Brand Feedback</Badge>
          <h2 className="mt-2 text-3xl font-extrabold text-white">Trusted by DTC Brands & Marketers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "AdGenius AI cut our creative production costs by 80%. We went from testing 2 creatives a week to 40 variations across Meta ads.",
              author: "Rohan Varma",
              role: "Head of Growth, Lumina Health",
            },
            {
              quote: "The visual fidelity is unbelievable. Our conversion rate increased by 38% after replacing stock product shots with AdGenius studio renders.",
              author: "Elena Rostova",
              role: "Creative Director, Apex Footwear",
            },
            {
              quote: "The promotional video generation feature is a game-changer for TikTok Reels. High engagement without needing a videographer.",
              author: "David Chen",
              role: "Founder, Zenith Watches",
            },
          ].map((t, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-xs font-bold text-white">{t.author}</p>
                <p className="text-[11px] text-slate-400">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-dark-900/40 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400">Frequently Asked Questions</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">Answers to Common Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl bg-dark-900 border border-slate-800 overflow-hidden cursor-pointer"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="p-5 flex items-center justify-between text-left">
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {activeFaq === i ? <ChevronUp className="w-4 h-4 text-brand-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </div>
                {activeFaq === i && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion CTA Footer Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card glow className="p-10 sm:p-14 text-center rounded-3xl bg-gradient-to-r from-brand-950 via-dark-900 to-dark-950 border-brand-500/40">
          <h2 className="text-3xl sm:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
            Ready to Supercharge Your Product Advertisements?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Get started in 30 seconds with 50 free credits. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/register')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="px-8 py-3.5 text-base"
            >
              Claim Your 50 Free Credits Now
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};
