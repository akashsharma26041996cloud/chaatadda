'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getSettings } from '@/lib/db';
import { BusinessSettings } from '@/types/database';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Truck
} from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, isLoaded } = useCart();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading cart...
      </div>
    );
  }

  const deliveryFeeBase = settings ? Number(settings.delivery_fee) : 25;
  const freeThreshold = settings ? Number(settings.free_delivery_threshold) : 299;
  const minOrderAmount = settings ? Number(settings.min_order_amount) : 99;

  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : deliveryFeeBase;
  const grandTotal = subtotal + deliveryFee;
  const isBelowMinOrder = subtotal > 0 && subtotal < minOrderAmount;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">Your Cart is Empty</h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Looks like you haven&apos;t added any delicious Golgappe or Chaat yet. Check out our menu!
          </p>
        </div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 active:scale-95 transition-all"
        >
          <span>Browse Food Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Your Food Cart
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Review your street food delicacies before checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Items List */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Free delivery tracker banner */}
          {!isFreeDelivery && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Add ₹{freeThreshold - subtotal} more items to get <strong>FREE Home Delivery</strong>!
              </span>
            </div>
          )}

          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-4"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-100"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-stone-900 text-sm truncate">
                    {product.name}
                  </h3>
                  <div className="text-xs text-stone-500 font-medium">
                    ₹{product.price} each
                  </div>
                  <div className="text-xs font-bold text-orange-600 mt-0.5">
                    ₹{product.price * quantity}
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Remove */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-stone-200 text-stone-700 active:scale-90 transition-colors shadow-2xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-extrabold text-xs px-2 min-w-[20px] text-center text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-stone-200 text-stone-700 active:scale-90 transition-colors shadow-2xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(product.id)}
                  className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more items link */}
          <div className="pt-2 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more delicious items from menu</span>
            </Link>
          </div>
        </div>

        {/* Right: Bill Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
            <h2 className="font-black text-stone-900 text-lg border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Item Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <span>Delivery Charges</span>
                </span>
                <span className="font-bold">
                  {isFreeDelivery ? (
                    <span className="text-emerald-600 uppercase font-black text-xs">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
                <div>
                  <span className="text-base font-black text-stone-900 block">Total Amount</span>
                  <span className="text-[10px] text-stone-400 font-medium">Inclusive of all charges</span>
                </div>
                <span className="text-2xl font-black text-orange-600">₹{grandTotal}</span>
              </div>
            </div>

            {/* Minimum order warning if applicable */}
            {isBelowMinOrder && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Minimum order amount is <strong>₹{minOrderAmount}</strong>. Please add ₹{minOrderAmount - subtotal} more to proceed.
                </span>
              </div>
            )}

            {/* Checkout CTA */}
            <div>
              {isBelowMinOrder ? (
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-stone-200 text-stone-400 font-extrabold text-sm cursor-not-allowed text-center"
                >
                  Minimum Order ₹{minOrderAmount} Required
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 hover:shadow-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Trust badge */}
            <div className="pt-2 text-center flex items-center justify-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cash / UPI on Delivery Available</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
