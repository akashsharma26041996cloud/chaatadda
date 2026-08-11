'use client';

import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/db';
import { Order, OrderStatus } from '@/types/database';
import { generateAdminWhatsAppConfirmLink } from '@/lib/notifications';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  CheckCircle,
  Truck,
  CookingPot,
  XCircle,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previousOrderCount, setPreviousOrderCount] = useState<number | null>(null);

  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio autoplay restriction fallback
    }
  };

  const showBrowserNotification = (order: Order) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🥟 New Order Received! (₹${order.total})`, {
        body: `${order.customer_name} placed an order for ₹${order.total}.`,
        icon: '/favicon.ico'
      });
    }
  };

  const loadOrders = async () => {
    try {
      // 1. Load local / Supabase orders
      let current = await getOrders();

      // 2. Fetch from API endpoint to sync any orders submitted to server
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const apiData = await res.json();
          if (apiData.orders && Array.isArray(apiData.orders)) {
            const combinedMap = new Map<string, Order>();
            // Add existing
            current.forEach((o) => combinedMap.set(o.id, o));
            // Add/overwrite with fresh API orders
            apiData.orders.forEach((o: Order) => combinedMap.set(o.id, o));
            current = Array.from(combinedMap.values()).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem('chaat_orders', JSON.stringify(current));
            }
          }
        }
      } catch (err) {
        console.warn('API orders sync fallback:', err);
      }

      // Check if new order arrived to trigger alert
      if (previousOrderCount !== null && current.length > previousOrderCount) {
        playOrderChime();
        if (current[0]) {
          showBrowserNotification(current[0]);
        }
      }
      setPreviousOrderCount(current.length);
      setOrders(current);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Request notification permission if available
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, [previousOrderCount]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      try {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status })
        });
      } catch {
        // ignore
      }
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
      }
    } catch (e) {
      console.error('Update failed', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      (order.order_number && String(order.order_number).includes(searchQuery)) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses: OrderStatus[] = [
    'New',
    'Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Customer Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Filter, search and update delivery stages for all orders.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden text-xs sm:text-sm"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {statuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-orange-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-2">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No orders found</h3>
          <p className="text-xs text-stone-500">Try changing your search query or filter tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderNumStr = order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 6)}`;
            const waLink = generateAdminWhatsAppConfirmLink(order);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4 hover:border-stone-300 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg text-stone-900">{orderNumStr}</span>
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                        order.status === 'New'
                          ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400'
                          : order.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'Preparing'
                          ? 'bg-amber-100 text-amber-700'
                          : order.status === 'Out for Delivery'
                          ? 'bg-purple-100 text-purple-700'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(order.created_at).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <div className="text-stone-400 text-[10px] uppercase font-bold">Customer</div>
                    <div className="font-bold text-stone-900 text-base">{order.customer_name}</div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-orange-600 bg-stone-100 px-2.5 py-1 rounded-lg"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>+91 {order.customer_phone}</span>
                      </a>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
                      >
                        <MessageCircle className="w-3 h-3 fill-current" />
                        <span>Send WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-stone-400 text-[10px] uppercase font-bold">Delivery Address</div>
                    <div className="flex items-start gap-1.5 text-stone-800 font-medium">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span>{order.delivery_address}</span>
                    </div>
                    {order.delivery_instructions && (
                      <div className="text-stone-500 italic text-xs pt-1">
                        Note: &ldquo;{order.delivery_instructions}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Box */}
                <div className="bg-stone-50 p-3.5 rounded-2xl space-y-2">
                  <div className="text-[10px] uppercase font-black text-stone-400">Order Items</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-2 rounded-xl border border-stone-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-stone-800">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-bold text-stone-900">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>
                      Subtotal: ₹{order.subtotal} | Delivery: {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
                    </span>
                    <span className="text-sm font-black text-stone-900">
                      Total: ₹{order.total} ({order.payment_method})
                    </span>
                  </div>
                </div>

                {/* Stage Update Quick Buttons & ETA Setter */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase text-stone-400 pr-1">
                      Stage:
                    </span>
                    
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'Confirmed')}
                      disabled={updatingId === order.id || order.status === 'Confirmed'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        order.status === 'Confirmed'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      1. Confirm
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(order.id, 'Preparing')}
                      disabled={updatingId === order.id || order.status === 'Preparing'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        order.status === 'Preparing'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      2. Preparing
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(order.id, 'Out for Delivery')}
                      disabled={updatingId === order.id || order.status === 'Out for Delivery'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        order.status === 'Out for Delivery'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      3. Out for Delivery
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                      disabled={updatingId === order.id || order.status === 'Delivered'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      4. Delivered ✓
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                      disabled={updatingId === order.id || order.status === 'Cancelled'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        order.status === 'Cancelled'
                          ? 'bg-stone-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-red-100 hover:text-red-700'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>

                  {/* ETA Selector */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[11px] font-bold text-stone-500">ETA:</span>
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
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 outline-hidden cursor-pointer"
                    >
                      <option value="10-15 mins">10-15 mins</option>
                      <option value="20-25 mins">20-25 mins</option>
                      <option value="25-35 mins">25-35 mins</option>
                      <option value="35-45 mins">35-45 mins</option>
                      <option value="Out for Delivery (10 mins)">Out for Delivery (10 mins)</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
