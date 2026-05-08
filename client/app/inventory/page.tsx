"use client";

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Tag, ImageIcon, Upload, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: Category;
  sku: string | null;
  barcode: string | null;
  costPrice: number;
  sellPrice: number;
  stockQty: number;
  minStock: number;
  imageUrl?: string | null;
}

export default function Inventory() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    categoryId: '', 
    sku: '', 
    barcode: '',
    costPrice: '', 
    sellPrice: '', 
    stockQty: '',
    minStock: '5',
    imageUrl: ''
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/products/categories')).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const resetForm = () => {
    setForm({ name: '', categoryId: '', sku: '', barcode: '', costPrice: '', sellPrice: '', stockQty: '', minStock: '5', imageUrl: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      sku: product.sku ?? '',
      barcode: product.barcode ?? '',
      costPrice: String(product.costPrice),
      sellPrice: String(product.sellPrice),
      stockQty: String(product.stockQty),
      minStock: String(product.minStock),
      imageUrl: product.imageUrl ?? '',
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (err: any) {
      console.error('Upload error:', err.message);
      alert('Failed to upload image. Make sure "product-images" bucket exists in Supabase.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      sku: form.sku || undefined,
      barcode: form.barcode || undefined,
      costPrice: parseFloat(form.costPrice),
      sellPrice: parseFloat(form.sellPrice),
      stockQty: parseInt(form.stockQty, 10),
      minStock: parseInt(form.minStock, 10),
      imageUrl: form.imageUrl || null,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Manage products, stock levels and images</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl border border-border p-8 w-full max-w-2xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[95vh]"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button type="button" onClick={resetForm} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Image Upload Area */}
              <div className="md:col-span-1 space-y-4">
                <label className="block text-sm font-semibold mb-2">Product Photo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden bg-muted/20"
                >
                  {form.imageUrl ? (
                    <>
                      <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white w-8 h-8" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground font-medium">Click to upload photo</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                {form.imageUrl && (
                  <button 
                    type="button" 
                    onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                    className="text-xs text-destructive font-bold hover:underline w-full text-center"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Form Fields */}
              <div className="md:col-span-2 grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Product Name</label>
                  <input 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    required 
                    placeholder="E.g. Designer Embroidered Suit"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Category</label>
                  <select 
                    value={form.categoryId} 
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })} 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring appearance-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-muted-foreground text-xs uppercase tracking-wider">SKU</label>
                  <input 
                    value={form.sku} 
                    onChange={(e) => setForm({ ...form, sku: e.target.value })} 
                    placeholder="Auto-generated"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring font-mono text-sm uppercase" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Cost Price (₹)</label>
                  <input 
                    type="number" 
                    value={form.costPrice} 
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring font-bold" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={form.sellPrice} 
                    onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring font-bold text-primary" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Initial Stock</label>
                  <input 
                    type="number" 
                    value={form.stockQty} 
                    onChange={(e) => setForm({ ...form, stockQty: e.target.value })} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Min Stock Alert</label>
                  <input 
                    type="number" 
                    value={form.minStock} 
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring" 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-border">
              <button 
                type="button" 
                onClick={resetForm} 
                className="flex-1 px-4 py-3.5 rounded-xl border border-input hover:bg-muted font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                className="flex-[2] bg-primary text-primary-foreground py-3.5 rounded-xl font-black hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {editingProduct ? 'Save Changes' : 'Stock New Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-5">Product Details</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5 text-right">Cost</th>
                <th className="px-6 py-5 text-right">Price</th>
                <th className="px-6 py-5 text-right">Stock Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden border border-border flex-shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                            <ImageIcon className="w-5 h-5 opacity-30" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5 tracking-tighter">
                          {p.sku || 'No SKU'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 bg-accent/50 text-accent-foreground px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border border-border/50">
                      <Tag className="w-3 h-3" />
                      {p.category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-muted-foreground font-medium">₹{p.costPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-primary text-sm">₹{p.sellPrice.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black ${
                      p.stockQty <= p.minStock 
                        ? (p.stockQty === 0 ? 'bg-destructive/10 text-destructive' : 'bg-orange-100 text-orange-700') 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {p.stockQty} {p.stockQty <= p.minStock && '⚠️'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(p)} className="p-2 hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if(confirm('Delete this product?')) deleteMutation.mutate(p.id) }} className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center text-muted-foreground font-medium italic bg-muted/5">
                    Your boutique inventory is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
