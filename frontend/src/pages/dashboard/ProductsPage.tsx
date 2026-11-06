import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Sparkles,
  Video,
  ExternalLink,
  UploadCloud,
  Layers,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { productService } from '../../services/productService';
import { Product, AdCategory } from '../../types';
import toast from 'react-hot-toast';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: AdCategory;
    referenceImageUrl: string;
    brandVoice: string;
    targetAudience: string;
  }>({
    name: '',
    description: '',
    category: 'ELECTRONICS',
    referenceImageUrl: '',
    brandVoice: 'Luxury & Modern',
    targetAudience: 'Tech enthusiasts',
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const catParam = selectedCategory !== 'ALL' ? (selectedCategory as AdCategory) : undefined;
      const res = await productService.list({
        q: searchQuery || undefined,
        category: catParam,
        size: 50,
      });
      if (res.data?.content) setProducts(res.data.content);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'ELECTRONICS',
      referenceImageUrl: '',
      brandVoice: 'Modern & High Energy',
      targetAudience: 'Global consumers',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      referenceImageUrl: product.referenceImageUrl || '',
      brandVoice: product.brandVoice || '',
      targetAudience: product.targetAudience || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        toast.success('Product updated successfully!');
      } else {
        await productService.create(formData);
        toast.success('Product added to catalog!');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      toast.success('Product removed');
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="pb-20">
      <Header
        title="Product Catalog"
        subtitle="Manage your brand's physical and digital products to quickly generate ad campaigns."
        actions={
          <Button
            onClick={openCreateModal}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Product
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 w-full max-w-md relative">
            <Input
              placeholder="Search products by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Categories</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="FASHION">Fashion & Apparel</option>
              <option value="BEAUTY_COSMETICS">Beauty & Skincare</option>
              <option value="HOME_KITCHEN">Home & Kitchen</option>
              <option value="FITNESS_SPORTS">Sports & Fitness</option>
              <option value="JEWELRY_LUXURY">Jewelry & Luxury</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-xs text-slate-400 animate-pulse">Loading catalog...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-5 flex flex-col justify-between group">
                <div>
                  <div className="relative rounded-xl overflow-hidden bg-dark-950 aspect-[4/3] border border-slate-800 mb-4">
                    <img
                      src={
                        product.referenceImageUrl ||
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="brand">{product.category}</Badge>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          navigate('/ai/images', {
                            state: { productName: product.name, referenceImageUrl: product.referenceImageUrl },
                          })
                        }
                        leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
                      >
                        Image Ad
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          navigate('/ai/videos', {
                            state: { productName: product.name, referenceImageUrl: product.referenceImageUrl },
                          })
                        }
                        leftIcon={<Video className="w-3.5 h-3.5" />}
                      >
                        Video
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-dark-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No Products In Catalog</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your first product to generate consistent advertisements with saved descriptions and brand voice.
            </p>
            <div>
              <Button onClick={openCreateModal} variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Add Your First Product
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. Apex Hyper-Watch"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AdCategory })}
              className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ELECTRONICS">Electronics</option>
              <option value="FASHION">Fashion & Apparel</option>
              <option value="BEAUTY_COSMETICS">Beauty & Skincare</option>
              <option value="HOME_KITCHEN">Home & Kitchen</option>
              <option value="FITNESS_SPORTS">Sports & Fitness</option>
              <option value="JEWELRY_LUXURY">Jewelry & Luxury</option>
              <option value="OTHER">Other Goods</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Product Description
            </label>
            <textarea
              rows={3}
              placeholder="Specifications, materials, colorways, core value propositions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <Input
            label="Reference Photo URL (or leave blank)"
            placeholder="https://example.com/product.jpg"
            value={formData.referenceImageUrl}
            onChange={(e) => setFormData({ ...formData, referenceImageUrl: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Brand Voice"
              placeholder="Minimalist, Direct"
              value={formData.brandVoice}
              onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
            />
            <Input
              label="Target Audience"
              placeholder="Gen Z Marketers"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
