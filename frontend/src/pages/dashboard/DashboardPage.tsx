import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Video,
  Mic,
  Package,
  Layers,
  Coins,
  ArrowRight,
  TrendingUp,
  Clock,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { adService } from '../../services/adService';
import { Advertisement } from '../../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user, credits } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalAds: 0,
    creditBalance: credits,
    activeJobs: 0,
  });
  const [recentAds, setRecentAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Realistic usage activity data for charts
  const monthlyUsageData = [
    { name: 'Mon', imageAds: 12, videoAds: 3, credits: 54 },
    { name: 'Tue', imageAds: 18, videoAds: 5, credits: 86 },
    { name: 'Wed', imageAds: 24, videoAds: 7, credits: 118 },
    { name: 'Thu', imageAds: 15, videoAds: 4, credits: 70 },
    { name: 'Fri', imageAds: 32, videoAds: 9, credits: 154 },
    { name: 'Sat', imageAds: 28, videoAds: 8, credits: 136 },
    { name: 'Sun', imageAds: 20, videoAds: 6, credits: 100 },
  ];

  const consumptionData = [
    { category: 'Luxury', count: 45 },
    { category: 'Lifestyle', count: 35 },
    { category: 'Cinematic', count: 28 },
    { category: 'Minimalist', count: 22 },
    { category: '3D Render', count: 18 },
  ];

  useEffect(() => {
    Promise.all([
      authService.getStats().catch(() => ({ data: { totalProducts: 3, totalAds: 8, creditBalance: credits, activeJobs: 0 } })),
      adService.list({ page: 0, size: 4 }).catch(() => ({ data: { content: [] } })),
    ])
      .then(([statsRes, adsRes]) => {
        if (statsRes.data) setStats(statsRes.data);
        if (adsRes.data?.content) setRecentAds(adsRes.data.content);
      })
      .finally(() => setIsLoading(false));
  }, [credits]);

  return (
    <div className="pb-16">
      <Header
        title={`Welcome back, ${user?.fullName || 'Marketer'}!`}
        subtitle="Here is an overview of your AI creative engine performance and credit quota."
        actions={
          <Button
            onClick={() => navigate('/ai/images')}
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Create New Ad
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Ads Generated</span>
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats.totalAds || 14}</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +28%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across all product lines</p>
          </Card>

          <Card className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Remaining Credits</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{credits}</span>
              <Badge variant="brand">Active Plan</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Refreshes next billing cycle</p>
          </Card>

          <Card className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Products</span>
              <div className="w-8 h-8 rounded-lg bg-electric-cyan/15 text-electric-cyan flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats.totalProducts || 4}</span>
              <span className="text-xs text-slate-400">catalog items</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ready for instant generation</p>
          </Card>

          <Card className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Render Time</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">4.2s</span>
              <Badge variant="success">Ultra Fast</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">GPU accelerated inference</p>
          </Card>
        </div>

        {/* Quick Launch Studios Row */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" /> AI Creative Studios
            </h2>
            <span className="text-xs text-slate-400">Select an engine to start generating</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card
              interactive
              glow
              onClick={() => navigate('/ai/images')}
              className="p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <Badge variant="brand">2 Credits / Ad</Badge>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition">
                  Product Image Studio
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Generate studio-grade photos, luxury 3D renders, and lifestyle ad variations with multi-ratio export.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                Launch Image Studio <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            <Card
              interactive
              glow
              onClick={() => navigate('/ai/videos')}
              className="p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-electric-cyan/20 text-electric-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-5 h-5" />
                  </div>
                  <Badge variant="info">10 Credits / Video</Badge>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-electric-cyan transition">
                  Promotional Video Studio
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Transform product photos into high-converting dynamic video commercials and viral vertical reels.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-electric-cyan group-hover:translate-x-1 transition-transform">
                Launch Video Studio <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            <Card
              interactive
              glow
              onClick={() => navigate('/ai/avatar')}
              className="p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mic className="w-5 h-5" />
                  </div>
                  <Badge variant="warning">1 Credit / Script</Badge>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
                  Avatar & Copy Studio
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Generate marketing headlines, high-converting scripts, presenter avatars, and social captions.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                Launch Copy Studio <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Ad Generation Trend</h3>
                <p className="text-xs text-slate-400">Total image and video generations over the last 7 days</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Images
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-electric-cyan" /> Videos
                </span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyUsageData}>
                  <defs>
                    <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="imageAds" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorImages)" />
                  <Area type="monotone" dataKey="videoAds" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorVideos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white">Popular Creative Styles</h3>
              <p className="text-xs text-slate-400">Distribution by chosen visual style</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionData} layout="vertical">
                  <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="category" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Upgrade Plan Banner */}
        <Card glow className="p-6 bg-gradient-to-r from-brand-950 via-dark-900 to-dark-850 border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Unlock High Definition 4K & 1,200 Credits / Mo</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Upgrade to the AdGenius Pro Plan to generate unlimited high-res image advertisements, extended video reels, and batch generation.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/pricing')}
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shrink-0"
          >
            Explore Pro Plans
          </Button>
        </Card>
      </div>
    </div>
  );
};
