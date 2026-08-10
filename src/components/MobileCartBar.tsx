'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function MobileCartBar() {
  const pathname = usePathname();
  const { totalItemsCount, subtotal, isLoaded } = useCart();

  // Do not show on cart, checkout, success, or admin routes
  if (
    !isLoaded ||
    totalItemsCount === 0 ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname?.startsWith('/order-success') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <aside aria-label="Quick Cart Access" className="md:hidden fixed bottom-3 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Link
        href="/cart"
        className="flex items-center justify-between bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-orange-600/30 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-medium text-orange-100">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} added
            </div>
            <div className="text-base font-black">
              ₹{subtotal}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-sm bg-white text-orange-600 px-3.5 py-2 rounded-xl shadow-xs">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </aside>
  );
}
