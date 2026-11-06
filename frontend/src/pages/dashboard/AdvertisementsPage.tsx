import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Heart,
  Download,
  Trash2,
  Video,
  Image as ImageIcon,
  Sparkles,
  Search,
  Filter,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { adService } from '../../services/adService';
import { Advertisement, MediaType } from '../../types';
import toast from 'react-hot-toast';

export const AdvertisementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const res = await adService.list({
        favorite: onlyFavorites ? true : undefined,
        size: 50,
      });
      if (res.data?.content) {
        let items = res.data.content;
        if (filterType !== 'ALL') {
          items = items.filter((a) => a.mediaType === filterType);
        }
        setAds(items);
      }
    } catch {
      toast.error('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, [filterType, onlyFavorites]);

  const handleToggleFavorite = async (ad: Advertisement) => {
    try {
      const res = await adService.toggleFavorite(ad.id);
      setAds(ads.map((a) => (a.id === ad.id ? { ...a, favorite: res.data.favorite } : a)));
      toast.success(res.data.favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this ad creative?')) return;
    try {
      await adService.delete(id);
      toast.success('Advertisement deleted');
      setAds(ads.filter((a) => a.id !== id));
      if (selectedAd?.id === id) setSelectedAd(null);
    } catch {
      toast.error('Failed to delete ad');
    }
  };

  return (
    <div className="pb-20">
      <Header
        title="My Advertisements"
        subtitle="Browse, filter, preview, and download all generated commercial creatives and video reels."
        actions={
          <Button
            onClick={() => navigate('/ai/images')}
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Create New Creative
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-dark-900 border border-slate-800">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'ALL' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setFilterType('IMAGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                filterType === 'IMAGE' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Images
            </button>
            <button
              onClick={() => setFilterType('VIDEO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                filterType === 'VIDEO' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Videos
            </button>
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
              onlyFavorites
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-dark-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>

        {/* Ads Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-xs text-slate-400 animate-pulse">Loading creative vault...</div>
        ) : ads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden flex flex-col justify-between group p-3">
                <div className="relative rounded-xl overflow-hidden bg-dark-950 aspect-square border border-slate-800">
                  {ad.mediaType === 'VIDEO' ? (
                    <video
                      src={ad.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                    />
                  ) : (
                    <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}

                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant={ad.mediaType === 'VIDEO' ? 'info' : 'brand'}>
                      {ad.mediaType}
                    </Badge>
                    {ad.visualStyle && <Badge variant="neutral">{ad.visualStyle}</Badge>}
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(ad)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-dark-950/80 backdrop-blur-md text-slate-400 hover:text-rose-400 transition"
                  >
                    <Heart className={`w-4 h-4 ${ad.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <div className="absolute inset-0 bg-dark-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectedAd(ad)}
                      className="p-2.5 rounded-xl bg-dark-900 text-white hover:bg-brand-600 transition"
                      title="Inspect Creative"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <a
                      href={ad.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="p-2.5 rounded-xl bg-dark-900 text-white hover:bg-brand-600 transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="p-2.5 rounded-xl bg-dark-900 text-slate-400 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 px-1">
                  <h4 className="text-xs font-bold text-white truncate">{ad.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{ad.headline || 'Generated Commercial'}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-dark-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No Advertisements Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't generated any advertisements in this filter. Open the Image or Video Studio to create one.
            </p>
            <div>
              <Button onClick={() => navigate('/ai/images')} variant="primary" size="md">
                Launch AI Image Studio
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Inspector Modal */}
      <Modal
        isOpen={!!selectedAd}
        onClose={() => setSelectedAd(null)}
        title={selectedAd?.title || 'Advertisement Detail'}
        size="lg"
      >
        {selectedAd && (
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center border border-slate-800">
              {selectedAd.mediaType === 'VIDEO' ? (
                <video src={selectedAd.mediaUrl} controls autoPlay loop className="w-full max-h-[60vh]" />
              ) : (
                <img src={selectedAd.mediaUrl} alt={selectedAd.title} className="w-full object-contain max-h-[60vh]" />
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Headline</p>
                <p className="text-sm font-semibold text-white">{selectedAd.headline || 'Commercial Creative'}</p>
              </div>

              {selectedAd.description && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Caption / Description</p>
                  <p className="text-slate-300 leading-relaxed">{selectedAd.description}</p>
                </div>
              )}

              <div className="flex gap-4 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Style</span>
                  <span className="text-slate-200">{selectedAd.visualStyle || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Ratio</span>
                  <span className="text-slate-200">{selectedAd.aspectRatio || '1:1'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Type</span>
                  <span className="text-slate-200">{selectedAd.mediaType}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => handleDelete(selectedAd.id)}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition"
              >
                Delete Creative
              </button>
              <a href={selectedAd.mediaUrl} target="_blank" rel="noreferrer" download>
                <Button variant="primary" size="md" leftIcon={<Download className="w-4 h-4" />}>
                  Download Asset
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
