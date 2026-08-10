export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_available: boolean;
  is_featured?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number?: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_instructions?: string | null;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  estimated_time?: string | null;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  business_phone: string;
  whatsapp_number: string;
  delivery_fee: number;
  min_order_amount: number;
  free_delivery_threshold: number;
  delivery_areas: string;
  business_hours: string;
  delivery_message: string;
  is_open: boolean;
  admin_notification_email?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
