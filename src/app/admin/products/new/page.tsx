'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveProduct, getCategories } from '@/lib/db';
import { Category } from '@/types/database';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

const PRESET_FOOD_IMAGES = [
  { name: 'Crispy Golgappe', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dahi Puri / Sev Puri', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
  { name: 'Aloo Tikki Chaat', url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80' },
  { name: 'Papdi Chaat / Dahi Bhalla', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Samosa Chaat / Chole', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sweet Lassi', url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80' }
];

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_FOOD_IMAGES[0].url);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      setError('Please fill in product name and price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await saveProduct({
        name: name.trim(),
        category_id: categoryId || null,
        price: parseFloat(price) || 0,
        description: description.trim(),
        image_url: imageUrl.trim() || PRESET_FOOD_IMAGES[0].url,
        is_available: isAvailable,
        is_featured: isFeatured
      });

      router.push('/admin/products');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Back Link */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Add New Food Item</h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Enter dish details, pricing and choose an appetizing photo.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Dish / Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Special Dahi Papdi Chaat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                placeholder="e.g. 50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Description / Ingredients
            </label>
            <textarea
              rows={3}
              placeholder="Crispy puris loaded with spiced potatoes, sweetened curd, date chutney, fine sev..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden resize-none"
            />
          </div>

          {/* Image Selection & URL */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-stone-700">
              Product Image URL or Quick Preset
            </label>
            
            {/* Image Preview & URL input */}
            <div className="flex gap-4 items-start">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
              />
              <div className="flex-1">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:border-orange-500 outline-hidden"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Use any direct image link or click a preset below:
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_FOOD_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all ${
                    imageUrl === preset.url
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm"
              />
              <span>Mark Available in Kitchen</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm"
              />
              <span>Feature on Homepage (Best Seller)</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Food Item</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
