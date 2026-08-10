'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, toggleProductAvailability, deleteProduct, getCategories } from '@/lib/db';
import { Product, Category } from '@/types/database';
import {
  Plus,
  Edit2,
  Trash2,
  Utensils,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Flame,
  Sparkles
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts(false),
        getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const updated = await toggleProductAvailability(id, !current);
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch (e) {
      console.error('Toggle failed', e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCat = categoryFilter === 'all' || product.category_id === categoryFilter;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Food Menu Products
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Add, update prices, change descriptions, or toggle product availability.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:bg-white focus:border-orange-500 outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 outline-hidden"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table/Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <Utensils className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No products found</h3>
          <p className="text-xs text-stone-500">Add your first product to get started.</p>
          <Link
            href="/admin/products/new"
            className="inline-block px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Add Product Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const categoryName = categories.find((c) => c.id === product.category_id)?.name || 'General';

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-4 transition-all ${
                  product.is_available ? 'border-stone-200' : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'}
                    alt={product.name}
                    className={`w-20 h-20 rounded-xl object-cover shrink-0 border border-stone-100 ${
                      !product.is_available ? 'grayscale' : ''
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        {categoryName}
                      </span>
                      {product.is_featured && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Best Seller
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm truncate">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mt-0.5">
                      {product.description}
                    </p>
                    <div className="text-base font-black text-stone-900 mt-1">
                      ₹{product.price}
                    </div>
                  </div>
                </div>

                {/* Status Toggle & Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  
                  {/* Availability Toggle Button */}
                  <button
                    onClick={() => handleToggle(product.id, product.is_available)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      product.is_available
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {product.is_available ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Unavailable</span>
                      </>
                    )}
                  </button>

                  {/* Edit and Delete */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
