'use client';

import React, { useEffect, useState } from 'react';
import { getCategories, saveCategory } from '@/lib/db';
import { Category } from '@/types/database';
import { Tags, Plus, Save, Edit2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const saved = await saveCategory({
        id: editingId || undefined,
        name: name.trim(),
        description: description.trim(),
        is_active: true
      });

      if (editingId) {
        setCategories((prev) => prev.map((c) => (c.id === editingId ? saved : c)));
      } else {
        setCategories((prev) => [...prev, saved]);
      }

      setName('');
      setDescription('');
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleToggle = async (cat: Category) => {
    try {
      const updated = await saveCategory({
        ...cat,
        is_active: !cat.is_active
      });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Menu Categories
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Organize your menu into Golgappe, Chaats, Combos, Beverages, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Box */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 sticky top-24">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Tags className="w-4 h-4 text-orange-600" />
              <span>{editingId ? 'Edit Category' : 'Create New Category'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Punjabi Samosa & Combos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Fresh savory snacks served hot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{editingId ? 'Save Changes' : 'Create Category'}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-7 space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-stone-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center text-stone-500">
              No categories created yet.
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-sm">{cat.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-stone-500 truncate mt-0.5">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggle(cat)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    title={cat.is_active ? 'Hide Category' : 'Show Category'}
                  >
                    {cat.is_active ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-stone-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleEditClick(cat)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
