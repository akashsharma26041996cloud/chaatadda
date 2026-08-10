'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders, updateOrderStatus, getProducts } from '@/lib/db';
import { Order, OrderStatus, Product } from '@/types/database';
import { generateAdminWhatsAppConfirmLink } from '@/lib/notifications';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  MessageCircle,
  Plus,
  ArrowRight,
  RefreshCw,
  Utensils,
  ExternalLink,
  Phone,
  MapPin,
  Flame,
  ChevronDown
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [allOrders, allProducts] = await Promise.all([
        getOrders(),
        getProducts(false)
      ]);
      setOrders(allOrders);
      setProducts(allProducts);
    } catch (e) {
      console.error('Failed to load admin orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Metrics calculation
  const newOrders = orders.filter((o) => o.status === 'New');
  const pendingDeliveryOrders = orders.filter((o) =>
    ['New', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(o.status)
  );

  // Today's orders & sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.created_at.startsWith(todayStr));
  const todaySales = todayOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    New: { bg: 'bg-orange-500/15', text: 'text-orange-600', border: 'border-orange-300' },
    Confirmed: { bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-blue-300' },
    Preparing: { bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-amber-300' },
    'Out for Delivery': { bg: 'bg-purple-500/15', text: 'text-purple-600', border: 'border-purple-300' },
    Delivered: { bg: 'bg-emerald-500/15', text: 'text-emerald-700', border: 'border-emerald-300' },
    Cancelled: { bg: 'bg-stone-500/15', text: 'text-stone-600', border: 'border-stone-300' }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Store Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Real-time orders, delivery tracking and quick kitchen controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* STATS METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: New Orders (Highlighted) */}
        <div className="bg-white rounded-3xl p-5 border-2 border-orange-500/80 shadow-md relative overflow-hidden">
          {newOrders.length > 0 && (
            <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-orange-600 pulse-badge"></span>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              New Orders
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900">
            {newOrders.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Requires immediate attention</p>
        </div>

        {/* Metric 2: Today's Orders */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Today&apos;s Orders
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900">
            {todayOrders.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">{orders.length} total lifetime</p>
        </div>

        {/* Metric 3: Today's Sales */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Today&apos;s Sales
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600">
            ₹{todaySales}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Cash / UPI on delivery</p>
        </div>

        {/* Metric 4: Pending Deliveries */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              In Kitchen / Transit
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900">
            {pendingDeliveryOrders.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Active deliveries in queue</p>
        </div>

      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        
        {/* Table Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-stone-900 text-lg sm:text-xl">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-stone-500">
              Click order status to update stage or WhatsApp customer with 1-click
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table or Cards */}
        {orders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-semibold">No orders received yet.</p>
            <p className="text-xs text-stone-400">
              When customers place orders from the website, they will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {orders.slice(0, 8).map((order) => {
              const orderNumStr = order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 6)}`;
              const waLink = generateAdminWhatsAppConfirmLink(order);
              const isNew = order.status === 'New';

              return (
                <div
                  key={order.id}
                  className={`p-5 sm:p-6 transition-colors ${
                    isNew ? 'bg-orange-50/40 border-l-4 border-orange-500' : 'hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Customer & Order Metadata */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-base text-stone-900">
                          {orderNumStr}
                        </span>
                        {isNew && (
                          <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                        <span className="text-xs text-stone-400">
                          • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(order.created_at).toLocaleDateString()})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-700">
                        <span className="font-bold text-stone-900">{order.customer_name}</span>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="flex items-center gap-1 text-stone-600 hover:text-orange-600"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+91 {order.customer_phone}</span>
                        </a>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-stone-600">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="truncate">{order.delivery_address}</span>
                      </div>

                      {order.delivery_instructions && (
                        <div className="text-[11px] text-stone-500 italic">
                          Note: &ldquo;{order.delivery_instructions}&rdquo;
                        </div>
                      )}

                      {/* Items Summary */}
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {order.order_items?.map((item) => (
                          <span
                            key={item.id}
                            className="bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-lg font-medium border border-stone-200"
                          >
                            {item.quantity}x {item.product_name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price, Status Selector & WhatsApp Contact */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                      
                      {/* Price Tag */}
                      <div className="text-right pr-2">
                        <div className="text-lg sm:text-xl font-black text-stone-900">
                          ₹{order.total}
                        </div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase">
                          {order.payment_method}
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={statusUpdatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`appearance-none text-xs font-black px-3.5 py-2 rounded-xl border cursor-pointer pr-8 outline-hidden transition-all shadow-2xs ${
                            statusColors[order.status].bg
                          } ${statusColors[order.status].text} ${statusColors[order.status].border}`}
                        >
                          <option value="New">1. New</option>
                          <option value="Confirmed">2. Confirmed</option>
                          <option value="Preparing">3. Preparing</option>
                          <option value="Out for Delivery">4. Out for Delivery</option>
                          <option value="Delivered">5. Delivered</option>
                          <option value="Cancelled">6. Cancelled</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
                      </div>

                      {/* ETA Selector */}
                      <select
                        value={order.estimated_time || '25-35 mins'}
                        onChange={(e) => {
                          const newEta = e.target.value;
                          updateOrderStatus(order.id, order.status, newEta).then((updated) => {
                            if (updated) {
                              setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
                            }
                          });
                        }}
                        className="text-xs font-bold px-2.5 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 outline-hidden cursor-pointer"
                        title="Set estimated preparation/delivery time"
                      >
                        <option value="10-15 mins">⏱️ 10-15 mins</option>
                        <option value="20-25 mins">⏱️ 20-25 mins</option>
                        <option value="25-35 mins">⏱️ 25-35 mins</option>
                        <option value="35-45 mins">⏱️ 35-45 mins</option>
                        <option value="Out for Delivery">🛵 Out for Delivery</option>
                        <option value="Delivered">✅ Delivered</option>
                      </select>

                      {/* 1-Click WhatsApp Button */}
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-95 shrink-0"
                        title="Send WhatsApp Order Confirmation to customer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp</span>
                      </a>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
