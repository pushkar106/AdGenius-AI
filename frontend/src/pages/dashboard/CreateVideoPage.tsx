import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Video,
  UploadCloud,
  Sparkles,
  Play,
  RotateCcw,
  Download,
  Sliders,
  Music,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { aiService } from '../../services/aiService';
import { useAuthStore } from '../../store/useAuthStore';
import { GenerationJob } from '../../types';
import toast from 'react-hot-toast';

export const CreateVideoPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { credits, updateCredits } = useAuthStore();

  const [productName, setProductName] = useState(location.state?.productName || '');
  const [referenceUrl, setReferenceUrl] = useState(location.state?.referenceImageUrl || '');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [model, setModel] = useState('stability-ai/stable-video-diffusion');
  const [duration, setDuration] = useState('4');
  const [cameraMotion, setCameraMotion] = useState('ORBITAL_ZOOM');
  const [motionIntensity, setMotionIntensity] = useState(6);
  const [musicMood, setMusicMood] = useState('LUXURY_AMBIENT');
  const [prompt, setPrompt] = useState('Cinematic slow motion product reveal, subtle lighting shimmer, 4k');

  // Generation status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [pollIntervalId, setPollIntervalId] = useState<any>(null);

  const cameraMotions = [
    { id: 'ORBITAL_ZOOM', label: 'Orbital Zoom', desc: 'Slow circular sweep with subtle inward push' },
    { id: 'DOLLY_PUSH', label: 'Dolly Push In', desc: 'Dramatic forward approach highlighting details' },
    { id: 'SLOW_PAN', label: 'Cinematic Pan', desc: 'Smooth horizontal glide across the silhouette' },
    { id: 'DRAMATIC_RISE', label: 'Pedestal Rise', desc: 'Vertical upward tilt revealing the full hero' },
  ];

  const audioTracks = [
    { id: 'LUXURY_AMBIENT', label: 'Luxury Ambient', desc: 'Warm synth pads & subtle reverb' },
    { id: 'UPBEAT_ELECTRONIC', label: 'High-Tech Beat', desc: 'Punchy electro rhythm for modern tech' },
    { id: 'D2C_LIFESTYLE', label: 'Modern Lifestyle', desc: 'Acoustic indie groove for wellness/fashion' },
    { id: 'NONE', label: 'Mute (Visual Only)', desc: 'No background audio track attached' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file);
      setReferenceUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerateVideo = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (credits < 10) {
      toast.error('Insufficient credits! Video generation requires 10 credits.');
      navigate('/pricing');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('model', model);
    formData.append('duration', duration);
    formData.append('cameraMotion', cameraMotion);
    formData.append('motionIntensity', String(motionIntensity));
    formData.append('musicMood', musicMood);
    formData.append('customPrompt', prompt);
    if (referenceFile) formData.append('reference', referenceFile);
    if (referenceUrl && !referenceFile) formData.append('referenceUrl', referenceUrl);

    try {
      const response = await aiService.generateVideo(formData);
      const job = response.data;
      setActiveJob(job);
      updateCredits(Math.max(0, credits - 10));
      toast.success('Promotional Video Job Enqueued! (10 Credits)');

      // Start polling status
      const interval = setInterval(async () => {
        try {
          const pollRes = await aiService.getJob(job.id);
          const current = pollRes.data;
          setActiveJob(current);
          if (current.status === 'COMPLETED' || current.status === 'FAILED') {
            clearInterval(interval);
            setIsSubmitting(false);
            if (current.status === 'COMPLETED') {
              toast.success('Promotional Video Rendered Successfully!');
            } else {
              toast.error('Video generation encountered an issue. Credits refunded.');
            }
          }
        } catch {
          // Ignore transient poll error
        }
      }, 2000);
      setPollIntervalId(interval);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initialize video generation');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [pollIntervalId]);

  return (
    <div className="pb-20">
      <Header
        title="AI Promotional Video Studio"
        subtitle="Convert still product photography into cinematic commercial reels for TikTok, Meta, and YouTube."
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Reference Image Input */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-electric-cyan" /> 1. Product Source Image
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select or upload the high-res product photo to animate into a motion reel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="flex-1 w-full border-2 border-dashed border-slate-700/80 hover:border-electric-cyan rounded-2xl p-6 text-center cursor-pointer transition bg-dark-950/40 group">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="w-10 h-10 rounded-xl bg-electric-cyan/10 group-hover:bg-electric-cyan/20 text-electric-cyan flex items-center justify-center mx-auto mb-2 transition">
                  <Video className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Upload starting photo</p>
                <p className="text-[11px] text-slate-500 mt-1">Or passed from Image Studio</p>
              </label>

              {referenceUrl && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-700 relative shrink-0 bg-dark-950">
                  <img src={referenceUrl} alt="Video Start Frame" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-dark-950/80 text-[10px] font-mono text-electric-cyan">
                    Keyframe
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Product & Model Selection */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" /> 2. Model & Timing Settings
            </h3>

            <Input
              label="Product Title"
              placeholder="e.g. Apex Chrono V2"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  AI Video Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-electric-cyan"
                >
                  <option value="stability-ai/stable-video-diffusion">Replicate: SVD Turbo (Cinematic)</option>
                  <option value="animatediff-motion">AnimateDiff Studio Commercial</option>
                  <option value="cogvideo-hd">CogVideo HD Commercial Engine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reel Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-electric-cyan"
                >
                  <option value="4">4 Seconds (High Intensity Loop)</option>
                  <option value="8">8 Seconds (Extended Story Ad)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Camera Motion Selection */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-electric-purple" /> 3. Camera Movement Pattern
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cameraMotions.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => setCameraMotion(cam.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    cameraMotion === cam.id
                      ? 'bg-electric-cyan/15 border-electric-cyan text-white shadow-glow-cyan'
                      : 'bg-dark-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{cam.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{cam.desc}</p>
                </div>
              ))}
            </div>

            {/* Intensity slider */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Motion Intensity</span>
                <span className="text-electric-cyan font-mono">{motionIntensity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={motionIntensity}
                onChange={(e) => setMotionIntensity(Number(e.target.value))}
                className="w-full accent-electric-cyan h-1.5 bg-dark-950 rounded-lg cursor-pointer"
              />
            </div>
          </Card>

          {/* Audio Track Option */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" /> 4. Commercial Background Music
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {audioTracks.map((trk) => (
                <div
                  key={trk.id}
                  onClick={() => setMusicMood(trk.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    musicMood === trk.id
                      ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                      : 'bg-dark-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-200">{trk.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{trk.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Trigger */}
          <Button
            size="lg"
            variant="primary"
            onClick={handleGenerateVideo}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full h-14 text-base font-bold shadow-glow-cyan bg-gradient-to-r from-brand-600 via-electric-violet to-electric-cyan"
            rightIcon={<Video className="w-5 h-5" />}
          >
            {isSubmitting ? 'Rendering Promotional Video...' : 'Generate AI Promotional Video (10 Credits)'}
          </Button>
        </div>

        {/* Right Output Panel: 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          <Card glow className="p-6 sticky top-28 min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-electric-cyan" /> Video Player
                </h3>
                <Badge variant={activeJob?.status === 'COMPLETED' ? 'success' : 'neutral'}>
                  {activeJob?.status || 'Ready'}
                </Badge>
              </div>

              {/* Progress State */}
              {isSubmitting && (
                <div className="py-20 text-center space-y-5">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-electric-cyan/20 border-t-electric-cyan animate-spin" />
                    <Video className="absolute inset-0 m-auto w-8 h-8 text-electric-cyan animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Replicate GPU Cluster Rendering</h4>
                    <p className="text-xs text-electric-cyan mt-1 font-mono">
                      Generating frame interpolation & camera pass...
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Status: {activeJob?.status || 'PROCESSING'} (Async Polling Active)
                    </p>
                  </div>
                </div>
              )}

              {/* Completed Video Display */}
              {!isSubmitting && activeJob?.status === 'COMPLETED' && (
                <div className="space-y-4 pt-4">
                  <div className="rounded-2xl overflow-hidden border border-electric-cyan/40 bg-black aspect-[9/16] max-h-[460px] mx-auto shadow-glow-cyan flex items-center justify-center relative group">
                    <video
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                      src={activeJob.resultUrls?.[0] || 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-watch-in-a-cyberpunk-display-42732-large.mp4'}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-dark-950/80 border border-slate-800 text-xs">
                    <p className="text-white font-bold">{productName || 'Generated Promotional Video'}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Model: {model} • Camera: {cameraMotion}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={activeJob.resultUrls?.[0] || '#'}
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      <Button variant="primary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                        Download HD MP4
                      </Button>
                    </a>
                    <Button
                      onClick={handleGenerateVideo}
                      variant="secondary"
                      className="w-full"
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      Render Alternative Camera Angle
                    </Button>
                  </div>
                </div>
              )}

              {/* Default Empty State */}
              {!isSubmitting && activeJob?.status !== 'COMPLETED' && (
                <div className="py-24 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-dark-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                    <Video className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300">No Video In Progress</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Select your reference keyframe and click Generate to dispatch a video rendering job.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Cost: 10 credits</span>
              <span className="text-electric-cyan font-medium">Asynchronous background worker</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
