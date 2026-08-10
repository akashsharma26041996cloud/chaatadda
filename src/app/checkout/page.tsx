'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getSettings } from '@/lib/db';
import { BusinessSettings } from '@/types/database';
import {
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Banknote,
  Sparkles
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isLoaded } = useCart();

  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  // Redirect if cart is empty once loaded
  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push('/cart');
    }
  }, [isLoaded, items, router]);

  if (!isLoaded || items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading checkout...
      </div>
    );
  }

  const deliveryFeeBase = settings ? Number(settings.delivery_fee) : 25;
  const freeThreshold = settings ? Number(settings.free_delivery_threshold) : 299;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = isFreeDelivery ? 0 : deliveryFeeBase;
  const grandTotal = subtotal + deliveryFee;

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Please enter your full name.';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      errs.phone = 'Mobile number is required.';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!address.trim()) {
      errs.address = 'Delivery address is required (House/Flat No, Area, Landmark).';
    } else if (address.trim().length < 8) {
      errs.address = 'Please provide a detailed address for smooth delivery.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderPayload = {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: address.trim(),
        delivery_instructions: instructions.trim() || undefined,
        payment_method: paymentMethod,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      // Clear cart on successful order
      clearCart();

      // Redirect to Order Confirmation page
      router.push(`/order-success/${data.orderId}`);
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      
      {/* Back button & Page Title */}
      <div className="space-y-2">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Delivery Details & Checkout
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          No account needed! Enter your delivery address and pay on arrival.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Error placing order:</strong>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Customer Info Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              <span>Contact Information</span>
            </h2>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Ramesh Gupta"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-stone-50 border ${
                    errors.name ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                  } focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm transition-all`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-600 font-medium">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Phone / WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-stone-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^0-9]/g, ''));
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  className={`w-full pl-16 pr-4 py-3 rounded-xl bg-stone-50 border ${
                    errors.phone ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                  } focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm transition-all`}
                />
              </div>
              {errors.phone ? (
                <p className="text-xs text-red-600 font-medium">{errors.phone}</p>
              ) : (
                <p className="text-[11px] text-stone-400">We will send order updates to this WhatsApp number.</p>
              )}
            </div>
          </div>

          {/* Delivery Address Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Delivery Address</span>
            </h2>

            {/* Address textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Complete Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="House/Flat No, Building name, Street, Landmark, Area (e.g. Flat 302, Green Park Apartments, Near City Hospital, Model Town)"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors({ ...errors, address: '' });
                }}
                className={`w-full px-4 py-3 rounded-xl bg-stone-50 border ${
                  errors.address ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                } focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm transition-all resize-none`}
              />
              {errors.address && <p className="text-xs text-red-600 font-medium">{errors.address}</p>}
            </div>

            {/* Optional Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Delivery / Food Preparation Note <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Extra spicy pani / ring bell / leave at security"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm transition-all"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Payment Option</span>
            </h2>

            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center bg-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div>
                  <div className="text-sm font-black text-stone-900">Cash / UPI on Delivery</div>
                  <div className="text-xs text-stone-600">Pay cash or scan QR upon delivery at your door</div>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 uppercase bg-emerald-100 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5 sticky top-24">
            <h2 className="font-black text-stone-900 text-lg border-b border-stone-100 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Items mini list */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1 divide-y divide-stone-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-black text-stone-800 shrink-0">{quantity}x</span>
                    <span className="text-stone-700 truncate">{product.name}</span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    ₹{product.price * quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-stone-100 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Delivery Charges</span>
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
                  <span className="text-base font-black text-stone-900 block">Total Payable</span>
                  <span className="text-[10px] text-stone-400 font-medium">Pay on Delivery</span>
                </div>
                <span className="text-2xl font-black text-orange-600">₹{grandTotal}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-base shadow-lg shadow-orange-600/30 hover:shadow-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Place Order (₹{grandTotal})</span>
                </>
              )}
            </button>

            {/* Trust badge */}
            <div className="pt-1 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Freshly prepared and packed right before dispatch.
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
