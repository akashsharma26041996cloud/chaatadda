'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getOrderById, getSettings } from '@/lib/db';
import { Order, BusinessSettings } from '@/types/database';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  UtensilsCrossed
} from 'lucide-react';
import { generateCustomerWhatsAppLink } from '@/lib/notifications';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fire festive confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    async function loadOrder() {
      if (!orderId) return;
      try {
        const [ord, sett] = await Promise.all([
          getOrderById(orderId),
          getSettings()
        ]);
        setOrder(ord);
        setSettings(sett);
      } catch (e) {
        console.error('Failed to load order confirmation:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-stone-500">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">Order Not Found</h1>
        <p className="text-xs text-stone-500">
          We couldn&apos;t find an order with this ID. It may have been placed previously or the link is expired.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const orderNumStr = order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 8)}`;
  const whatsappMsg = `Hi Sharma Ji Chaat, I just placed order ${orderNumStr} for ₹${order.total}. Customer Name: ${order.customer_name}. Please confirm the delivery time.`;
  const whatsappUrl = generateCustomerWhatsAppLink(
    settings?.whatsapp_number || '919876543210',
    whatsappMsg
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      
      {/* Success Hero Badge */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
          Order Received
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Thank you, <strong className="text-stone-900">{order.customer_name}</strong>! We have received your order and our chefs are preparing fresh crisp delights for you.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-6">
        
        {/* Order Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">Order Number</div>
            <div className="text-xl font-black text-orange-600">{orderNumStr}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">Estimated Delivery</div>
            <div className="text-sm font-black text-stone-800 flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>25 - 35 Minutes</span>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-stone-400 uppercase tracking-wider">Items Ordered</h2>
          <div className="divide-y divide-stone-100">
            {order.order_items?.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-stone-800">{item.product_name}</span>
                </div>
                <span className="font-bold text-stone-900">₹{item.total_price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="pt-4 border-t border-stone-100 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-bold text-stone-800">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Delivery Fee</span>
            <span className="font-bold text-stone-800">
              {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
            <span className="font-black text-stone-900 text-sm sm:text-base">
              Total to Pay on Delivery:
            </span>
            <span className="text-xl sm:text-2xl font-black text-orange-600">
              ₹{order.total}
            </span>
          </div>
        </div>

        {/* Delivery Details Block */}
        <div className="pt-4 border-t border-stone-100 bg-stone-50 p-4 rounded-2xl space-y-2 text-xs">
          <div className="flex items-start gap-2 text-stone-700">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Delivery Address: </strong>
              <span>{order.delivery_address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-stone-900">Contact Number: </strong>
              <span>+91 {order.customer_phone}</span>
            </div>
          </div>
          {order.delivery_instructions && (
            <div className="pt-1 text-stone-500 italic">
              <strong>Instructions:</strong> &ldquo;{order.delivery_instructions}&rdquo;
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-center"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm active:scale-95 transition-all text-center"
          >
            <ShoppingBag className="w-4 h-4 text-stone-600" />
            <span>Back to Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
