'use client';

import React, { useState } from 'react';
import { Product } from '@/types/database';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Check, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(product.id);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!product.is_available) return;
    setIsAdding(true);
    addItem(product, 1);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleIncrement = () => {
    if (!product.is_available) return;
    updateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantityInCart - 1);
  };

  const isCombo = product.name.toLowerCase().includes('combo') || product.name.toLowerCase().includes('kit');
  const isSpicy = product.name.toLowerCase().includes('teekha') || product.description?.toLowerCase().includes('spicy');

  return (
    <div className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
      product.is_available 
        ? 'border-stone-200 hover:border-orange-300 hover:shadow-xl hover:-translate-y-0.5' 
        : 'border-stone-200 opacity-75 bg-stone-50'
    }`}>
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !product.is_available ? 'grayscale contrast-75' : ''
          }`}
          loading="lazy"
        />

        {/* Veg Badge & Spicy indicator */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="w-5 h-5 bg-white/95 backdrop-blur-xs rounded border border-emerald-600 flex items-center justify-center shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </span>
          {isSpicy && (
            <span className="flex items-center gap-0.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
              <Flame className="w-3 h-3 fill-current" /> Hot
            </span>
          )}
        </div>

        {/* Category / Combo Tag */}
        {isCombo && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-amber-500 text-stone-900 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Value Pack
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
            <span className="bg-red-600 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-stone-900 text-base sm:text-lg group-hover:text-orange-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
            {product.description || 'Authentic traditional recipe prepared with fresh ingredients.'}
          </p>
        </div>

        {/* Price & Action Area */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-stone-400 font-medium">Price</span>
            <span className="text-lg sm:text-xl font-extrabold text-stone-900">
              ₹{product.price}
            </span>
          </div>

          {/* Action Button: Add or Quantity Selector */}
          <div>
            {!product.is_available ? (
              <button
                disabled
                className="px-3.5 py-2 rounded-xl bg-stone-200 text-stone-400 font-bold text-xs cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : quantityInCart === 0 ? (
              <button
                onClick={handleAdd}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-sm ${
                  isAdding
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-200 hover:border-transparent'
                }`}
              >
                {isAdding ? (
                  <>
                    <Check className="w-4 h-4" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> ADD
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-orange-600 text-white rounded-xl p-1 shadow-sm">
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-700 hover:bg-orange-800 active:scale-90 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-sm px-1.5 min-w-[20px] text-center">
                  {quantityInCart}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-700 hover:bg-orange-800 active:scale-90 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
