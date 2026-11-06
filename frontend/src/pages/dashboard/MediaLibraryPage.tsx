import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Video,
  UploadCloud,
  Download,
  Trash2,
  FileCheck,
  Search,
  Maximize2,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { mediaService } from '../../services/mediaService';
import { MediaAsset, MediaType } from '../../types';
import toast from 'react-hot-toast';

export const MediaLibraryPage: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const typeParam = filterType !== 'ALL' ? (filterType as MediaType) : undefined;
      const res = await mediaService.list(typeParam, 0, 50);
      if (res.data?.content) setAssets(res.data.content);
    } catch {
      toast.error('Failed to load media vault');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [filterType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await mediaService.upload(file);
      toast.success('Asset uploaded securely to storage vault!');
      setAssets([res.data, ...assets]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this media asset?')) return;
    try {
      await mediaService.delete(id);
      toast.success('Asset deleted');
      setAssets(assets.filter((a) => a.id !== id));
      if (previewAsset?.id === id) setPreviewAsset(null);
    } catch {
      toast.error('Failed to delete asset');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="pb-20">
      <Header
        title="Media Storage Vault"
        subtitle="Manage private AWS S3 and local storage creative assets, raw photography, and video renders."
        actions={
          <label className="cursor-pointer">
            <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
            <Button
              variant="primary"
              size="sm"
              isLoading={isUploading}
              leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              Upload Asset
            </Button>
          </label>
        }
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-dark-900 border border-slate-800">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'ALL' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Assets ({assets.length})
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
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-xs text-slate-400 animate-pulse">Loading media assets...</div>
        ) : assets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden flex flex-col justify-between group p-2">
                <div className="relative rounded-xl overflow-hidden bg-dark-950 aspect-square border border-slate-800">
                  {asset.mediaType === 'VIDEO' ? (
                    <video src={asset.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}

                  <div className="absolute top-1.5 left-1.5">
                    <Badge variant={asset.mediaType === 'VIDEO' ? 'info' : 'brand'} size="sm">
                      {asset.mediaType}
                    </Badge>
                  </div>

                  <div className="absolute inset-0 bg-dark-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="p-1.5 rounded-lg bg-dark-900 text-white hover:bg-brand-600 transition"
                      title="Inspect"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="p-1.5 rounded-lg bg-dark-900 text-white hover:bg-brand-600 transition"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1.5 rounded-lg bg-dark-900 text-slate-400 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 px-1">
                  <p className="text-[11px] font-semibold text-white truncate">{asset.fileName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{formatBytes(asset.fileSize)}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-dark-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Media Vault is Empty</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Uploaded reference files and generated advertisements will appear here with secure presigned download links.
            </p>
            <div>
              <label className="cursor-pointer">
                <input type="file" onChange={handleFileUpload} className="hidden" />
                <Button variant="primary" size="md" leftIcon={<UploadCloud className="w-4 h-4" />}>
                  Upload File Now
                </Button>
              </label>
            </div>
          </Card>
        )}
      </div>

      {/* Asset Preview Modal */}
      <Modal
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        title={previewAsset?.fileName || 'Media Asset'}
        size="md"
      >
        {previewAsset && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black max-h-[50vh] flex items-center justify-center border border-slate-800">
              {previewAsset.mediaType === 'VIDEO' ? (
                <video src={previewAsset.url} controls autoPlay loop className="w-full max-h-[50vh]" />
              ) : (
                <img src={previewAsset.url} alt={previewAsset.fileName} className="w-full object-contain max-h-[50vh]" />
              )}
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-400">Content Type: <span className="text-white">{previewAsset.contentType}</span></p>
              <p className="text-slate-400">File Size: <span className="text-white">{formatBytes(previewAsset.fileSize)}</span></p>
              <p className="text-slate-400">Upload Date: <span className="text-white">{new Date(previewAsset.createdAt).toLocaleString()}</span></p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <a href={previewAsset.url} target="_blank" rel="noreferrer" download>
                <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
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
