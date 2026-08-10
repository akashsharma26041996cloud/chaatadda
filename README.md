# 🥟 Sharma Ji Chaat & Golgappe Bhandar - Online Ordering Website

A modern, high-speed, mobile-first food ordering website built specifically for local Indian street-food businesses (Chaat, Golgappe / Pani Puri, Tikkis, Combos). Designed to run at **₹0 cost** using 100% free tiers on **Vercel** and **Supabase**.

---

## 🌟 Key Features

### 🛒 Customer Experience (No Login Required)
- **Instant Access**: Zero registration or account creation needed. Customers can order immediately.
- **Appetizing Street-Food UI**: Saffron & tamarind warm color palette, mouth-watering imagery, spicy tags, and dietary badges.
- **Interactive Menu**: Category filtering (*Golgappe, Crispy Chaats, Specials, Combos, Beverages*), live instant search, and real-time stock availability (*Currently Unavailable* indicators).
- **Persistent Cart**: Automatically stored in browser LocalStorage. Refreshing never loses items.
- **Simple Checkout**: Name, WhatsApp number, street delivery address, preparation notes, and Cash on Delivery / Pay on Delivery.
- **Server-Side Price Validation**: Customer cart prices are calculated on the server from the product database, preventing client tampering.
- **Order Confirmation**: Live order status, estimated delivery time, receipt breakdown, festive confetti, and 1-click WhatsApp customer query link.
- **Floating WhatsApp Support**: Direct customer chat widget and "Order on WhatsApp" secondary flow.

### 🛡️ Admin & Store Owner Portal (`/admin`)
- **Secure Admin Authentication**: Login using Supabase Auth (or quick demo credentials for offline development).
- **Kitchen Dashboard**:
  - **New Orders Alert**: Real-time counter with pulse badge.
  - **Today's Stats**: Total orders received, today's sales (₹), and pending deliveries in transit.
- **Order Management (`/admin/orders`)**:
  - Status pipeline: `1. New` ➔ `2. Confirmed` ➔ `3. Preparing` ➔ `4. Out for Delivery` ➔ `5. Delivered` ➔ `Cancelled`.
  - **1-Click WhatsApp Customer Confirmation**: Generates a pre-filled WhatsApp message:
    > *"Hi [Customer Name], we received your order #[Order Number]. Your order total is ₹[Total]. We will confirm it shortly."*
- **Product Management (`/admin/products`)**:
  - Add, edit, delete dishes, update prices, change descriptions, toggle availability with 1 click.
  - Image URL input with built-in street food preset photo picker.
- **Category Management (`/admin/categories`)**: Create and organize custom menu categories.
- **Store & Delivery Settings (`/admin/settings`)**:
  - Store name, calling number, WhatsApp number.
  - Delivery charge (₹), free delivery threshold (₹), minimum order limit (₹).
  - Operating hours, delivery area coverage, kitchen open/closed status.
- **Free Order Notification Dispatcher**: Abstraction in `src/lib/notifications.ts` to push email/webhook notifications when a new order arrives.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd /home/aspire/projects/chaat-ordering-app
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **💡 Zero-Config Demo Mode**: The application is built with a self-contained fallback store! You can browse the menu, add to cart, place orders, and test the admin portal immediately even before setting up Supabase.

---

## 🔐 Supabase Database Setup (Free Tier)

### Step 1: Create a Free Project
1. Go to [https://supabase.com](https://supabase.com) and sign up for a free account.
2. Click **New project**, give it a name (e.g. `chaat-orders`), set a database password, and choose a region closest to India (e.g. `ap-south-1` Mumbai or `ap-southeast-1` Singapore).

### Step 2: Execute Database Schema & Seed Script
1. In the Supabase dashboard, click **SQL Editor** on the left menu.
2. Open the file `supabase/schema.sql` from this repository.
3. Paste the contents into the SQL Editor and click **Run**.
4. This will automatically create:
   - `categories` table with RLS
   - `products` table with RLS & initial food items
   - `orders` table with RLS
   - `order_items` table with cascade delete & RLS
   - `settings` table for business rules
   - Automatic `updated_at` timestamp triggers

### Step 3: Create Admin Account
1. In Supabase, go to **Authentication** ➔ **Users**.
2. Click **Add user** ➔ **Create user**.
3. Enter your admin email (e.g. `admin@sharmachaat.com`) and a strong password.
4. Set **Auto Confirm User?** to **Yes**.

### Step 4: Copy API Credentials
1. Go to **Project Settings** ➔ **API**.
2. Copy:
   - **Project URL**
   - **anon / public key**
3. Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚢 Free Deployment to Vercel

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete chaat and golgappe ordering website"
   git branch -M main
   # Add your remote: git remote add origin https://github.com/your-username/chaat-ordering-app.git
   # git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) with GitHub.
3. Click **Add New Project** and select your repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `your_supabase_url`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key`
5. Click **Deploy**. Your website is live worldwide on a fast CDN at ₹0 cost!

---

## 📱 Admin Flow Guide

1. Navigate to `/admin/login` (or click "Admin Portal" in the footer).
2. Enter your admin credentials (or use demo quick login).
3. **Incoming Orders**: Check the dashboard top badge for *New Orders*.
4. **WhatsApp Customer**: Click the green **WhatsApp** button on any order card to open pre-filled order confirmation.
5. **Update Delivery Progress**: Click the stage buttons (`Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`).
6. **Stock Management**: In `/admin/products`, click the **Available / Unavailable** switch whenever an item runs out.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 15 (App Router, Server Components & API routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Clean, mobile-first responsive food design)
- **Icons**: Lucide React
- **Celebration**: Canvas Confetti
- **Database & Auth**: Supabase PostgreSQL + Row Level Security (RLS)
- **Hosting**: Vercel Free Tier
# chaatadda
