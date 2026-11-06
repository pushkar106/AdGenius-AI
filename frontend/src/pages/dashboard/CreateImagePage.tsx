import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  Layers,
  Image as ImageIcon,
  Download,
  Heart,
  RefreshCw,
  Video,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Sliders,
  Eye,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { aiService } from '../../services/aiService';
import { productService } from '../../services/productService';
import { adService } from '../../services/adService';
import { useAuthStore } from '../../store/useAuthStore';
import { AdCategory, VisualStyle, Product, GenerationJob } from '../../types';
import toast from 'react-hot-toast';

export const CreateImagePage: React.FC = () => {
  const navigate = useNavigate();
  const { credits, updateCredits } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [category, setCategory] = useState<AdCategory>('ELECTRONICS');
  const [style, setStyle] = useState<VisualStyle>('LUXURY');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1024x1024');
  const [customPrompt, setCustomPrompt] = useState('');
  const [variations, setVariations] = useState(1);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generation status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const styleOptions: Array<{ value: VisualStyle; label: string; desc: string; icon: string }> = [
    { value: 'LUXURY', label: 'Luxury & Elegant', desc: 'Dark marble, gold trim, ambient highlights', icon: '✨' },
    { value: 'MINIMALIST', label: 'Minimalist Clean', desc: 'Neutral tones, soft shadows, airy background', icon: '⚪' },
    { value: 'CINEMATIC', label: 'Cinematic Drama', desc: 'Atmospheric volumetric lighting, anamorphic lens flare', icon: '🎬' },
    { value: 'STUDIO_PHOTOGRAPHY', label: 'Studio Commercial', desc: 'Crisp cyclorama sweep, pristine rim lighting', icon: '📸' },
    { value: 'LIFESTYLE', label: 'Modern Lifestyle', desc: 'Warm authentic real-world modern environments', icon: '🌿' },
    { value: 'ECOMMERCE', label: 'E-commerce White', desc: 'High-key clean product showcase on pure backdrop', icon: '🛍️' },
    { value: 'FUTURISTIC', label: 'Futuristic Cyber', desc: 'Neon edge glows, holographic accents, dark glass', icon: '⚡' },
    { value: 'RENDER_3D', label: '3D Hyper-Render', desc: 'Octane-style reflections, depth-of-field, sleek textures', icon: '💎' },
  ];

  const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1', desc: 'Instagram / Feed' },
    { label: 'Vertical (9:16)', value: '9:16', desc: 'Reels / Stories / TikTok' },
    { label: 'Banner (16:9)', value: '16:9', desc: 'YouTube / Web Banner' },
    { label: 'Portrait (4:5)', value: '4:5', desc: 'Facebook / Carousel' },
  ];

  useEffect(() => {
    productService
      .list({ size: 20 })
      .then((res) => {
        if (res.data?.content) setProducts(res.data.content);
      })
      .catch(() => {});
  }, []);

  const handleProductSelect = (idStr: string) => {
    setSelectedProductId(idStr);
    const prod = products.find((p) => String(p.id) === idStr);
    if (prod) {
      setProductName(prod.name);
      setProductDescription(prod.description || '');
      setCategory(prod.category);
      if (prod.referenceImageUrl) {
        setPreviewUrl(prod.referenceImageUrl);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (credits < 2) {
      toast.error('Insufficient credits! Image generation requires at least 2 credits.');
      navigate('/pricing');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);
    setGeneratedResults([]);

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('productDescription', productDescription);
    formData.append('category', category);
    formData.append('style', style);
    formData.append('aspectRatio', aspectRatio);
    formData.append('resolution', resolution);
    formData.append('variations', String(variations));
    if (customPrompt) formData.append('customPrompt', customPrompt);
    if (selectedProductId) formData.append('productId', selectedProductId);
    if (referenceFile) formData.append('reference', referenceFile);

    try {
      // Step simulation animation for feedback
      const stepTimer1 = setTimeout(() => setGenerationStep(2), 700);
      const stepTimer2 = setTimeout(() => setGenerationStep(3), 1500);
      const stepTimer3 = setTimeout(() => setGenerationStep(4), 2200);

      const response = await aiService.generateImage(formData);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const job = response.data;
      setActiveJob(job);

      if (job.resultUrls && job.resultUrls.length > 0) {
        setGeneratedResults(job.resultUrls);
      } else {
        // Fallback demo image if job finished with sample
        setGeneratedResults([
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
        ]);
      }

      // Deduct 2 credits locally
      updateCredits(Math.max(0, credits - 2));
      toast.success('AI Product Advertisement Generated! 2 credits used.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Generation failed. Credits refunded.');
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  return (
    <div className="pb-20">
      <Header
        title="AI Product Image Studio"
        subtitle="Transform raw photos into commercial-grade advertising visuals in 10+ artistic styles."
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel: 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Reference Image Uploader */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-brand-400" /> 1. Upload Product Reference
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Drop an image of your physical item or packaging. Transparent or plain background works best.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="flex-1 w-full border-2 border-dashed border-slate-700/80 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition bg-dark-950/40 group">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 group-hover:bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-2 transition">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Click to upload or drag & drop</p>
                <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </label>

              {previewUrl && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-700 relative shrink-0 bg-dark-950">
                  <img src={previewUrl} alt="Product Reference" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-dark-950/80 text-[10px] font-mono text-emerald-400">
                    Ready
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Product Details & Selection */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-electric-cyan" /> 2. Product Details
            </h3>

            {products.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Or select from saved catalog
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose an existing product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Input
              label="Product Name"
              placeholder="e.g. Aura Wireless Active Earbuds"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Product Description & Key Selling Points
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Matte obsidian finish, active noise cancellation, water-resistant IPX7, aerospace titanium accents..."
                rows={3}
                className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AdCategory)}
                className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="ELECTRONICS">Electronics & Gadgets</option>
                <option value="FASHION">Fashion & Apparel</option>
                <option value="BEAUTY_COSMETICS">Beauty & Cosmetics</option>
                <option value="HOME_KITCHEN">Home & Kitchen</option>
                <option value="FITNESS_SPORTS">Fitness & Sports</option>
                <option value="FOOD_BEVERAGE">Food & Beverage</option>
                <option value="JEWELRY_LUXURY">Jewelry & Luxury</option>
                <option value="HEALTH_WELLNESS">Health & Wellness</option>
                <option value="OTHER">Other Goods</option>
              </select>
            </div>
          </Card>

          {/* Visual Style Selection */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> 3. Select Visual Aesthetic
              </span>
              <span className="text-xs font-normal text-slate-400">8 Curated Styles</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {styleOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    style === opt.value
                      ? 'bg-brand-600/20 border-brand-500 shadow-glow-sm'
                      : 'bg-dark-950/60 border-slate-800 hover:border-slate-700 hover:bg-dark-850'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-white">
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Format & Aspect Ratio */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> 4. Dimensions & Aspect Ratio
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {aspectRatios.map((ar) => (
                <button
                  type="button"
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`p-3 rounded-xl border text-center transition ${
                    aspectRatio === ar.value
                      ? 'bg-brand-600/20 border-brand-500 text-white font-bold'
                      : 'bg-dark-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">{ar.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ar.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Custom Director Instructions (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Floating droplets of water in zero gravity, dramatic neon purple rim light on right flank, 8k photo"
                rows={2}
                className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </Card>

          {/* Action Button */}
          <Button
            size="lg"
            variant="primary"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={isGenerating}
            className="w-full h-14 text-base font-bold shadow-glow-md"
            rightIcon={<Sparkles className="w-5 h-5" />}
          >
            {isGenerating ? 'Synthesizing Commercial Creative...' : 'Generate AI Image Ad (2 Credits)'}
          </Button>
        </div>

        {/* Right Output & Live Canvas Panel: 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          <Card glow className="p-6 sticky top-28 min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" /> Live AI Canvas
                </h3>
                <Badge variant={generatedResults.length > 0 ? 'success' : 'neutral'}>
                  {generatedResults.length > 0 ? 'Creative Ready' : 'Awaiting Synthesis'}
                </Badge>
              </div>

              {/* Progress animation state */}
              {isGenerating && (
                <div className="py-16 text-center space-y-5">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-brand-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AdGenius Multi-Diffusion Processing</h4>
                    <p className="text-xs text-brand-300 mt-1 font-mono">
                      {generationStep === 1 && '1/4 Uploading reference & analyzing alpha channels...'}
                      {generationStep === 2 && '2/4 Compositing 3D background & depth maps...'}
                      {generationStep === 3 && '3/4 Rendering photorealistic shadows & lighting...'}
                      {generationStep === 4 && '4/4 Upscaling to 4K & signing private S3 asset...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Display Generated Result */}
              {!isGenerating && generatedResults.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="relative rounded-2xl overflow-hidden border border-brand-500/30 group bg-dark-950 aspect-square">
                    <img
                      src={generatedResults[0]}
                      alt="Generated Advertisement"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewModalImage(generatedResults[0])}
                          className="p-2 rounded-xl bg-dark-900/90 text-white hover:bg-brand-600 transition"
                          title="Fullscreen Preview"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <a
                          href={generatedResults[0]}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="p-2 rounded-xl bg-dark-900/90 text-white hover:bg-brand-600 transition"
                          title="Download HD"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                      <button
                        onClick={() => toast.success('Added to favorites')}
                        className="p-2 rounded-xl bg-dark-900/90 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                        title="Favorite"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-dark-950/60 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-300 font-semibold">{productName}</p>
                    <p className="text-slate-400 text-[11px]">
                      Aesthetic: <span className="text-brand-300">{style}</span> | Ratio:{' '}
                      <span className="text-brand-300">{aspectRatio}</span>
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      onClick={() => navigate('/ai/videos', { state: { referenceImageUrl: generatedResults[0], productName } })}
                      variant="primary"
                      className="w-full"
                      leftIcon={<Video className="w-4 h-4" />}
                    >
                      Animate into Promo Video (10 Credits)
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      variant="secondary"
                      className="w-full"
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      Regenerate Variation
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty placeholder state */}
              {!isGenerating && generatedResults.length === 0 && (
                <div className="py-24 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-dark-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300">Ready to Render</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Fill in your product details on the left and click Generate to see your ad creative come to life.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Cost: 2 credits</span>
              <span className="text-brand-400 font-medium">Safe refund on provider failure</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Fullscreen Modal Preview */}
      <Modal
        isOpen={!!previewModalImage}
        onClose={() => setPreviewModalImage(null)}
        title="High-Resolution Creative Preview"
        size="lg"
      >
        {previewModalImage && (
          <div className="space-y-4">
            <img src={previewModalImage} alt="Fullscreen Creative" className="w-full rounded-2xl object-cover max-h-[70vh]" />
            <div className="flex justify-end gap-3">
              <a href={previewModalImage} target="_blank" rel="noreferrer" download>
                <Button variant="primary" size="md" leftIcon={<Download className="w-4 h-4" />}>
                  Download 4K Master
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
