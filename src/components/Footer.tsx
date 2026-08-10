'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, Phone, MapPin, Clock, Heart, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-24 md:pb-12 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          
          {/* Business Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">Sharma Ji Chaat</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Serving the crispiest Golgappe, mouthwatering Chaats and authentic regional Indian street food delicacies. 100% RO filtered water, no compromise on hygiene.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hygienic & Tamper-Evident Packaging</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">Full Food Menu</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-orange-400 font-bold text-orange-400 transition-colors">Live Orders Tracker ⏱️</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-orange-400 transition-colors">View Cart</Link>
              </li>
              <li>
                <Link href="/#why-us" className="hover:text-orange-400 transition-colors">Our Quality Promise</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-stone-500 hover:text-stone-300 transition-colors">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Timings & Service Area */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Store Timings & Area</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>12:30 PM - 10:30 PM<br/><span className="text-stone-500">Open 7 Days a Week</span></span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Delivering in Model Town, Civil Lines, Urban Estate & nearby (5km radius)</span>
              </div>
            </div>
          </div>

          {/* Contact & Orders */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Direct Contact</h4>
            <div className="space-y-3 text-xs">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors text-white"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+91 98765 43210</span>
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi!%20I%20want%20to%20order%20Chaat%20%26%20Golgappe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 hover:bg-emerald-900 transition-colors text-emerald-300"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Order & Inquiry</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Sharma Ji Chaat & Golgappe Bhandar. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for authentic street food lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
