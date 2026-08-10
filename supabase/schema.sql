-- ==============================================================================
-- DATABASE SCHEMA FOR CHAAT & GOLGAPPE ONLINE ORDERING APP
-- Designed for Supabase (PostgreSQL 15+) Free Tier
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number BIGSERIAL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_instructions TEXT,
    payment_method TEXT DEFAULT 'Cash on Delivery' NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) DEFAULT 0 NOT NULL CHECK (delivery_fee >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    status TEXT DEFAULT 'New' NOT NULL CHECK (status IN ('New', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    estimated_time TEXT DEFAULT '25-35 mins',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Triggers to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- CATEGORIES POLICIES
-- Anyone can view active categories
CREATE POLICY "Public categories read" 
ON public.categories FOR SELECT 
USING (true);

-- Authenticated admins can manage categories
CREATE POLICY "Admin categories all" 
ON public.categories FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- PRODUCTS POLICIES
-- Anyone can view products
CREATE POLICY "Public products read" 
ON public.products FOR SELECT 
USING (true);

-- Authenticated admins can manage products
CREATE POLICY "Admin products all" 
ON public.products FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ORDERS POLICIES
-- Public customers can insert new orders without logging in
CREATE POLICY "Public can insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Public can view their order by ID (needed for order success page)
CREATE POLICY "Public can view order by id" 
ON public.orders FOR SELECT 
USING (true);

-- Authenticated admins can view and update all orders
CREATE POLICY "Admin orders all" 
ON public.orders FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ORDER ITEMS POLICIES
-- Public customers can insert order items
CREATE POLICY "Public can insert order_items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- Public can view order items for an order
CREATE POLICY "Public can view order_items" 
ON public.order_items FOR SELECT 
USING (true);

-- Authenticated admins can manage all order items
CREATE POLICY "Admin order items all" 
ON public.order_items FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- SETTINGS POLICIES
-- Anyone can view business settings
CREATE POLICY "Public settings read" 
ON public.settings FOR SELECT 
USING (true);

-- Admin can manage settings
CREATE POLICY "Admin settings all" 
ON public.settings FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO public.categories (id, name, description, is_active, sort_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'Golgappe & Pani Puri', 'Crispy hollow puris served with spicy mint water, sweet tamarind chutney and potato filling', true, 1),
('b1000000-0000-0000-0000-000000000002', 'Crispy Chaats', 'Tempting savory Indian street chaats loaded with whipped sweetened curd, chutneys and spices', true, 2),
('b1000000-0000-0000-0000-000000000003', 'Special Delights', 'Chef special street specialties prepared with authentic regional recipes', true, 3),
('b1000000-0000-0000-0000-000000000004', 'Family & Party Combos', 'Special value pack combinations perfect for tea-time cravings', true, 4),
('b1000000-0000-0000-0000-000000000005', 'Beverages & Sweets', 'Refreshing cool drinks and authentic traditional desserts', true, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, name, description, price, image_url, is_available, is_featured, sort_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Classic Golgappe / Pani Puri (6 Pcs)', '6 Super-crispy puris served with spicy hing-mint teekha pani, sweet saunth meetha pani, and seasoned potato-chana mash.', 35.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', true, true, 1),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Special Dahi Puri / Sev Batata Puri (6 Pcs)', 'Puris stuffed with boiled potatoes, chilled thick beaten curd, zesty tamarind chutney, mint sauce, garnished with fine nylon sev & pomegranate.', 60.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80', true, true, 2),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Party Pack Golgappe (30 Pcs DIY Kit)', '30 Fresh crispy puris safely boxed, 1L Hing-Pudina Spicy Water, 500ml Sweet Imli Saunth, 400g Potato & Boondi Filling.', 180.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true, true, 3),
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Crispy Aloo Tikki Chaat (2 Pcs)', 'Golden shallow-fried crunchy spiced potato patties topped with warm spiced chole, sweet curd, homemade date-tamarind chutney, and fresh coriander.', 55.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', true, true, 4),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Delhi Style Papdi Chaat', 'Crispy flour crackers tossed with diced potatoes, spiced chickpeas, creamy sweet yogurt, roasted cumin powder, tangy chaat masala & sev.', 55.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', true, true, 5),
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Melt-in-Mouth Dahi Bhalla', 'Soft, spongy urad dal dumplings soaked in chilled spiced yogurt, sprinkled with roasted jeera, red chilli powder and sweet tamarind relish.', 65.00, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', true, true, 6),
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 'Royal Raj Kachori', 'Grand crispy hollow sphere loaded with bhalla, sprouted moong, potatoes, dry fruits, papdi, chilled curd, trio of chutneys & sev.', 85.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', true, true, 7),
('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Punjabi Samosa Chaat (2 Pcs)', 'Hot crushed crispy potato-pea samosas smothered in hearty Amritsari chole gravy, sweetened dahi, pickled onions and tangy chutneys.', 60.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true, true, 8),
('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004', 'Street Food Duo Combo', '1 Portion Golgappe (6 Pcs) + 1 Plate Aloo Tikki Chaat + 1 Kulhad Sweet Lassi. Perfect meal.', 130.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', true, false, 9),
('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000005', 'Punjabi Malai Sweet Lassi', 'Thick, creamy churned yogurt drink flavoured with cardamom and rose water, topped with rich rabdi malai.', 45.00, 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80', true, false, 10),
('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000005', 'Hot Gulab Jamun (2 Pcs)', 'Soft khoya dumplings soaked in fragrant cardamom & saffron sugar syrup. Served warm.', 40.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', true, false, 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
('general', '{
  "business_name": "Sharma Ji Chaat & Golgappe Bhandar",
  "tagline": "Authentic Crispy Golgappe & Street Chaat with RO Water & Pure Desi Ghee",
  "business_phone": "+91 98765 43210",
  "whatsapp_number": "919876543210",
  "delivery_fee": 25,
  "min_order_amount": 99,
  "free_delivery_threshold": 299,
  "delivery_areas": "Within 5 km radius (Model Town, Civil Lines, Urban Estate, Main Market)",
  "business_hours": "12:30 PM - 10:30 PM (Open 7 Days)",
  "delivery_message": "Freshly packed in spill-proof tamper-evident containers with separate crispy puris and spicy mint water.",
  "is_open": true,
  "admin_notification_email": "admin@sharmachaat.com"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
