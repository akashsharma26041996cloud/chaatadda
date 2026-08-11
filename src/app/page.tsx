'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, Category, BusinessSettings } from '@/types/database';
import { getProducts, getCategories, getSettings } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Truck,
  Droplets,
  Award,
  ChevronRight,
  MessageCircle,
  Phone,
  Flame,
  CheckCircle2,
  UtensilsCrossed
} from 'lucide-react';
import { generateCustomerWhatsAppLink } from '@/lib/notifications';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, sett] = await Promise.all([
          getCategories(),
          getProducts(false),
          getSettings()
        ]);
        setCategories(cats.filter(c => c.is_active));
        setFeaturedProducts(prods.filter(p => p.is_featured || p.is_available).slice(0, 6));
        setSettings(sett);
      } catch (e) {
        console.error('Failed to load homepage data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const whatsappUrl = generateCustomerWhatsAppLink(
    settings?.whatsapp_number || '919876543210',
    'Hi! I would like to place an order for fresh Chaat & Golgappe.'
  );

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-amber-50/40 to-white pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-amber-100/60">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-amber-200/40 blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200/80 shadow-xs">
                <Flame className="w-4 h-4 text-orange-600 fill-current" />
                <span>100% RO Water Golgappe & Authentic Desi Chaat</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
                Craving Crispy{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent">
                  Golgappe & Chaat
                </span>
                {' '}Delivered Fresh?
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Enjoy hot, crunchy Aloo Tikki, chilled Dahi Bhalla, spicy Hing-Mint Pani Puri and royal Raj Kachori prepared fresh on order with strict hygiene standards.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 hover:shadow-xl active:scale-95 transition-all"
                >
                  <span>Explore Menu & Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-orange-100/70 hover:bg-orange-100 text-orange-900 font-extrabold text-sm border border-orange-200 shadow-2xs active:scale-95 transition-all"
                >
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Track Live Orders</span>
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 active:scale-95 transition-all shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Highlights Micro Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 max-w-md mx-auto lg:mx-0 text-stone-700">
                <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200/80 text-center shadow-xs">
                  <div className="text-sm font-black text-orange-600">⚡ 25-35m</div>
                  <div className="text-[10px] sm:text-xs text-stone-500 font-medium">Fast Local Delivery</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200/80 text-center shadow-xs">
                  <div className="text-sm font-black text-orange-600">₹0 Fee</div>
                  <div className="text-[10px] sm:text-xs text-stone-500 font-medium">Over ₹299 Order</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200/80 text-center shadow-xs">
                  <div className="text-sm font-black text-emerald-600">💵 COD</div>
                  <div className="text-[10px] sm:text-xs text-stone-500 font-medium">Pay on Delivery</div>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Visual Frame */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-amber-100">
                  <img
                    src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85"
                    alt="Authentic Golgappe & Chaat"
                    className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent"></div>
                  
                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">Customer Favorite</div>
                        <div className="font-extrabold text-stone-900 text-base">Special Dahi Puri & Golgappe</div>
                      </div>
                      <span className="text-lg font-black text-stone-900 bg-amber-100 px-3 py-1 rounded-xl">
                        ₹35 <span className="text-xs font-normal text-stone-600">onwards</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Rating Pill */}
                <div className="absolute -top-3 -left-3 bg-white px-3.5 py-2 rounded-2xl shadow-lg border border-amber-200 flex items-center gap-2">
                  <span className="text-base">⭐</span>
                  <div>
                    <div className="text-xs font-black text-stone-900">4.9 / 5.0</div>
                    <div className="text-[9px] text-stone-500 font-medium">500+ Happy Local Customers</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOD CATEGORIES QUICK BAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              Explore Our Menu Categories
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">Pick your favorite street food delicacies</p>
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.id}`}
              className="group p-4 rounded-2xl bg-white border border-stone-200 hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 group-hover:bg-orange-500 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED & BEST SELLER ITEMS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-extrabold text-orange-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Best Sellers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Most Loved Delicacies
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl"
          >
            <span>Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-stone-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-50 text-orange-600 font-bold text-sm border border-orange-200"
          >
            <span>View Full Food Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* HOW ORDERING WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Super Simple Ordering</span>
            <h2 className="text-2xl sm:text-3xl font-black">How Online Ordering Works</h2>
            <p className="text-xs sm:text-sm text-stone-300">No account required. Order in 30 seconds!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-stone-800/80 border border-stone-700/80 p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-base text-white">Select Your Chaat</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Browse our crispy Golgappe, Tikki, Papdi Chaats & combos. Add to cart with 1 click.
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-base text-white">Enter Address & Phone</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Provide your delivery address and instructions. Choose Pay on Delivery (Cash / UPI).
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-base text-white">Enjoy Crispy Delivery</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                We pack spicy waters and chutneys separately so puris stay crunchy when they arrive!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US & QUALITY PROMISE */}
      <section id="why-us" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Quality First</span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            Why Foodies Love Sharma Ji
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            We take pride in preparing street food that is 100% hygienic, safe and uncompromisingly tasty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-left space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">100% RO Purified Water</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Mint-hing teekha pani and saunth prepared exclusively with multi-stage RO filtered water.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-left space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Tamper-Proof Packaging</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Puris and liquids are packed in sealed, food-grade spill-proof boxes to guarantee freshness.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-left space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Pure Desi Ghee & Fresh Curd</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Our Tikkis are shallow fried in pure desi ghee and chaats are topped with daily fresh curd.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-left space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Always Made On-Order</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              We never pre-assemble chaats; everything is assembled right before dispatch so nothing gets soggy.
            </p>
          </div>
        </div>
      </section>

      {/* DELIVERY INFO & LOCAL CONTACT BANNER */}
      <section id="delivery-info" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 px-3 py-1 rounded-full">
              <Truck className="w-4 h-4 text-orange-600" />
              <span>Local Home Delivery Available</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              Fresh Local Delivery
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              {settings?.delivery_areas || 'Delivering to nearby sectors and surrounding areas.'}{' '}
              Standard delivery fee is only ₹{settings?.delivery_fee ?? 25}{' '}
              {settings?.free_delivery_threshold ? `(FREE for orders above ₹${settings.free_delivery_threshold})` : ''}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/menu"
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm text-center shadow-md active:scale-95 transition-all"
            >
              Order Online
            </Link>
            <a
              href={`tel:${(settings?.business_phone || '+919876543210').replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm border border-stone-300 text-center shadow-xs"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Us Directly</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
