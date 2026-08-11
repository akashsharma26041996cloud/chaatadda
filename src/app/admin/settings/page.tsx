'use client';

import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/lib/db';
import { BusinessSettings } from '@/types/database';
import {
  SlidersHorizontal,
  Store,
  Phone,
  Truck,
  Clock,
  Save,
  CheckCircle2,
  Loader2,
  Mail
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    getSettings().then((res) => {
      setSettings(res);
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (e) {
      console.error('Failed to update settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="p-12 text-center text-stone-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Business & Delivery Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Customize your store info, delivery charges, free delivery limits and timings.
          </p>
        </div>

        {showSavedToast && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Store Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-600" />
            <span>Store Profile & Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Business Name</label>
              <input
                type="text"
                required
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Store Status</label>
              <select
                value={settings.is_open ? 'open' : 'closed'}
                onChange={(e) => setSettings({ ...settings, is_open: e.target.value === 'open' })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
              >
                <option value="open">🟢 Accepting Orders (Kitchen Open)</option>
                <option value="closed">🔴 Kitchen Closed (Not Accepting Orders)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">Tagline / Motto</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>
        </div>

        {/* Automatic WhatsApp Order Alerts (CallMeBot) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Automatic WhatsApp Order Alerts (CallMeBot - 100% Free)</span>
            </h2>
            <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Instant Alert
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-stone-700 space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span>⚡ How to get your free CallMeBot WhatsApp API Key in 10 seconds:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 text-[11px] leading-relaxed">
              <li>Add <strong>+34 644 14 44 94</strong> (or <strong>+34 644 59 71 83</strong>) to your phone contacts as <em>CallMeBot</em>.</li>
              <li>Send this exact WhatsApp message: <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900 font-mono">I allow callmebot to send me messages</code></li>
              <li>The bot will reply immediately with your <strong>API Key</strong> (e.g. <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900 font-mono">123456</code>).</li>
              <li>Paste your phone number and the API Key below!</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Your WhatsApp Number (e.g. 919876543210)
              </label>
              <input
                type="text"
                value={settings.callmebot_phone || ''}
                onChange={(e) => setSettings({ ...settings, callmebot_phone: e.target.value })}
                placeholder="919876543210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-emerald-500 outline-hidden font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                CallMeBot API Key
              </label>
              <input
                type="text"
                value={settings.callmebot_api_key || ''}
                onChange={(e) => setSettings({ ...settings, callmebot_api_key: e.target.value })}
                placeholder="e.g. 847291"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-emerald-500 outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Delivery Rates & Limits */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Delivery Charges & Minimum Order Rules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.delivery_fee}
                onChange={(e) => setSettings({ ...settings, delivery_fee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.free_delivery_threshold}
                onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.min_order_amount}
                onChange={(e) => setSettings({ ...settings, min_order_amount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">Delivery Coverage Areas</label>
            <input
              type="text"
              value={settings.delivery_areas}
              onChange={(e) => setSettings({ ...settings, delivery_areas: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">Operating Hours</label>
            <input
              type="text"
              value={settings.business_hours}
              onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Packaging & Freshness Notice
            </label>
            <textarea
              rows={2}
              value={settings.delivery_message}
              onChange={(e) => setSettings({ ...settings, delivery_message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-orange-500 outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
