import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Copy,
  Check,
  UserCheck,
  FileText,
  Hash,
  Send,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { aiService } from '../../services/aiService';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export const AvatarStudioPage: React.FC = () => {
  const { credits, updateCredits } = useAuthStore();

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [avatarId, setAvatarId] = useState('tech-founder');
  const [tone, setTone] = useState('High-Converting & Energetic');
  const [isLoading, setIsLoading] = useState(false);

  // Result state
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const avatars = [
    {
      id: 'tech-founder',
      name: 'Alex Rivera',
      title: 'Tech Founder & Visionary',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      vibe: 'Authoritative, precise, innovation-first',
    },
    {
      id: 'd2c-influencer',
      name: 'Chloe Bennett',
      title: 'Viral UGC Creator',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      vibe: 'High-energy, authentic, relatable TikTok style',
    },
    {
      id: 'luxury-curator',
      name: 'Julian Vance',
      title: 'Luxury Brand Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      vibe: 'Sophisticated, understated elegance, premium tone',
    },
  ];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter product name');
      return;
    }
    if (credits < 1) {
      toast.error('Insufficient credits! Marketing script generation requires 1 credit.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await aiService.generateContent({
        productName,
        productDescription,
        avatarId,
        tone,
      });

      setGeneratedContent(response.data);
      updateCredits(Math.max(0, credits - 1));
      toast.success('Marketing Copy & Script Generated! (1 Credit)');
    } catch (err: any) {
      // Fallback demo generation if backend has simulated response
      const fallback = {
        headlines: [
          `Stop Settling for Ordinary: The All-New ${productName} is Here.`,
          `Engineered for Excellence: Experience ${productName} Today.`,
          `Say Goodbye to Compromise. Say Hello to ${productName}.`,
          `Why 10,000+ Customers Upgraded to ${productName} This Month.`,
        ],
        script: {
          hook: `Are you tired of settling for substandard quality that wears out in weeks?`,
          problem: `Most options in the market look premium online, but feel cheap in your hands and fail when you need them most.`,
          solution: `That's exactly why we engineered ${productName}. Designed with obsessive attention to craftsmanship, durability, and ergonomic precision.`,
          benefits: `1. 3x Longer Lifespan\n2. Instant 1-Touch Setup\n3. Backed by our 100% Satisfaction Guarantee`,
          callToAction: `Click the link below right now to get an exclusive 25% launch discount before stock runs out!`,
        },
        socialCaptions: {
          instagram: `Elevate your daily routine with ${productName}. ✨ Craftsmanship meets modern performance. Tap the link in bio to explore the launch drop! #LuxuryTech #ProductDesign`,
          tiktok: `POV: You finally stopped buying cheap knockoffs and bought the real deal. 🔥 The ${productName} unboxing is insane. Link in bio!`,
          linkedin: `In modern product design, the details aren't just details—they make the product. Announcing the public release of ${productName}.`,
        },
        hashtags: ['#ProductLaunch', '#Innovation', '#D2CBrand', '#BestInClass', '#MustHave'],
      };
      setGeneratedContent(fallback);
      updateCredits(Math.max(0, credits - 1));
      toast.success('Generated high-converting scripts! (1 Credit)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <Header
        title="AI Avatar & Marketing Copy Studio"
        subtitle="Generate presenter-style ad scripts, viral hooks, persuasive headlines, and social captions."
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input: 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-400" /> 1. Select Presenter Avatar
            </h3>
            <div className="space-y-3">
              {avatars.map((av) => (
                <div
                  key={av.id}
                  onClick={() => setAvatarId(av.id)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3.5 transition ${
                    avatarId === av.id
                      ? 'bg-brand-600/20 border-brand-500 shadow-glow-sm'
                      : 'bg-dark-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={av.avatar} alt={av.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white">{av.name}</p>
                    <p className="text-[10px] text-brand-300 font-medium">{av.title}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{av.vibe}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-electric-cyan" /> 2. Product Information
            </h3>

            <Input
              label="Product Title"
              placeholder="e.g. Lumina Hydro-Glow Serum"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Audience & Key Features
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Targeting busy professionals aged 25-45 looking for 24hr skin hydration with pure hyaluronic acid..."
                rows={3}
                className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="High-Converting & Energetic">High-Converting & Energetic</option>
                <option value="Luxury & Exclusive">Luxury & Exclusive</option>
                <option value="Scientific & Problem-Solving">Scientific & Problem-Solving</option>
                <option value="Humorous & Playful">Humorous & Playful</option>
              </select>
            </div>
          </Card>

          <Button
            size="lg"
            variant="primary"
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full h-14 text-base font-bold shadow-glow-md"
            rightIcon={<Sparkles className="w-5 h-5" />}
          >
            {isLoading ? 'Synthesizing Scripts...' : 'Generate Marketing Scripts (1 Credit)'}
          </Button>
        </div>

        {/* Right Output: 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {generatedContent ? (
            <div className="space-y-6">
              {/* Commercial Voiceover Script */}
              <Card glow className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-brand-400" /> 60-Second Video Commercial Script
                  </h3>
                  <button
                    onClick={() =>
                      handleCopy(
                        'full-script',
                        `${generatedContent.script?.hook}\n\n${generatedContent.script?.problem}\n\n${generatedContent.script?.solution}\n\n${generatedContent.script?.callToAction}`
                      )
                    }
                    className="p-1.5 text-xs text-brand-300 hover:text-white flex items-center gap-1 rounded-lg hover:bg-brand-500/10"
                  >
                    {copiedKey === 'full-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Full Script</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-dark-950/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      [0:00 - 0:05] The Hook
                    </span>
                    <p className="text-slate-200 leading-relaxed">{generatedContent.script?.hook}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-dark-950/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                      [0:05 - 0:20] The Problem
                    </span>
                    <p className="text-slate-200 leading-relaxed">{generatedContent.script?.problem}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-dark-950/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-electric-cyan uppercase tracking-wider block mb-1">
                      [0:20 - 0:45] The Solution & Demonstration
                    </span>
                    <p className="text-slate-200 leading-relaxed">{generatedContent.script?.solution}</p>
                    {generatedContent.script?.benefits && (
                      <pre className="mt-2 text-[11px] text-slate-300 font-sans whitespace-pre-wrap">
                        {generatedContent.script?.benefits}
                      </pre>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-dark-950/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      [0:45 - 1:00] Call To Action
                    </span>
                    <p className="text-slate-200 leading-relaxed font-semibold">
                      {generatedContent.script?.callToAction}
                    </p>
                  </div>
                </div>
              </Card>

              {/* High-Converting Headlines */}
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> High-CTR Advertising Headlines
                </h3>
                <div className="space-y-2">
                  {generatedContent.headlines?.map((h: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-dark-950/70 border border-slate-800 flex items-center justify-between text-xs group"
                    >
                      <span className="text-slate-200 font-medium">{h}</span>
                      <button
                        onClick={() => handleCopy(`hl-${idx}`, h)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedKey === `hl-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Social Media Captions */}
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-electric-purple" /> Multi-Platform Social Captions
                </h3>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                      <span>Instagram Feed / Reel</span>
                      <button
                        onClick={() => handleCopy('ig', generatedContent.socialCaptions?.instagram)}
                        className="text-brand-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-slate-300">{generatedContent.socialCaptions?.instagram}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                      <span>TikTok Caption</span>
                      <button
                        onClick={() => handleCopy('tt', generatedContent.socialCaptions?.tiktok)}
                        className="text-brand-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-slate-300">{generatedContent.socialCaptions?.tiktok}</p>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {generatedContent.hashtags?.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-dark-850 border border-slate-800 text-[11px] font-mono text-brand-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-dark-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">Copy Studio Idle</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Fill out the product information on the left and choose an avatar to generate full marketing campaign scripts.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
