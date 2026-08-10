'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicLiveOrders, PublicOrder } from '@/lib/db';
import { OrderStatus } from '@/types/database';
import {
  Clock,
  Search,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  ChefHat,
  Truck,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function LiveOrdersTrackerPage() {
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await getPublicLiveOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      loadOrders();
    }, 8000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      String(o.order_number).toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_display.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return <Flame className="w-4 h-4 text-orange-500 animate-pulse" />;
      case 'Confirmed':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'Preparing':
        return <ChefHat className="w-4 h-4 text-amber-500 animate-bounce" />;
      case 'Out for Delivery':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'Delivered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-stone-400" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparing':
        return 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/30';
      case 'Out for Delivery':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-2 ring-purple-400/30';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-orange-500/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
            <span>Live Kitchen Status & Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Live Food Orders & Delivery Tracker
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
            Track your freshly prepared order status in real-time. See estimated kitchen preparation and delivery times set directly by our chef.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order # or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:bg-white focus:border-orange-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'New', 'Preparing', 'Out for Delivery', 'Delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
                  statusFilter === st
                    ? 'bg-orange-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 shrink-0"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-stone-500">Loading live orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No active orders right now</h3>
          <p className="text-xs text-stone-500">Be the first to place an order today!</p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20"
          >
            <span>Order Fresh Chaat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-3">
                
                {/* Header: Order Number & Customer Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-stone-900">
                      #{ord.order_number}
                    </span>
                    <span className="text-xs font-bold text-stone-500">
                      • {ord.customer_display}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusBadge(
                      ord.status
                    )}`}
                  >
                    {getStatusIcon(ord.status)}
                    <span>{ord.status}</span>
                  </span>
                </div>

                {/* Items brief preview */}
                <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl">
                  <div className="font-bold text-stone-800 mb-0.5">
                    {ord.items_count} {ord.items_count === 1 ? 'dish' : 'dishes'} ordered
                  </div>
                  <p className="line-clamp-2 text-[11px] text-stone-500">
                    {ord.items_summary}
                  </p>
                </div>
              </div>

              {/* Estimated Time / ETA Banner */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>Estimated Time:</span>
                </div>
                <span className="font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                  {ord.estimated_time}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
