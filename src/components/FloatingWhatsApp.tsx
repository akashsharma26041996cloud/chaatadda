'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { generateCustomerWhatsAppLink } from '@/lib/notifications';

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const whatsappUrl = generateCustomerWhatsAppLink('919876543210');

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/30 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
        
        {/* Tooltip on hover */}
        <span className="hidden md:block absolute right-16 bg-stone-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
          Need help? Chat with us on WhatsApp!
        </span>

        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 animate-ping -z-10"></span>
      </a>
    </aside>
  );
}
