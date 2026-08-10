import { supabase, isSupabaseConfigured } from './supabase';
import { Category, Product, Order, OrderItem, OrderStatus, BusinessSettings } from '@/types/database';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, DEFAULT_SETTINGS } from './seed-data';
import { sendNewOrderNotification } from './notifications';

const LOCAL_STORAGE_KEY_PRODUCTS = 'chaat_app_products_v1';
const LOCAL_STORAGE_KEY_CATEGORIES = 'chaat_app_categories_v1';
const LOCAL_STORAGE_KEY_ORDERS = 'chaat_app_orders_v1';
const LOCAL_STORAGE_KEY_SETTINGS = 'chaat_app_settings_v1';

// In-memory fallback store for server-side operations when Supabase is not connected
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryOrders: Order[] = [
  {
    id: 'ord-sample-1',
    order_number: 1001,
    customer_name: 'Rahul Sharma',
    customer_phone: '9876501234',
    delivery_address: 'Flat 402, Sunshine Heights, Model Town',
    delivery_instructions: 'Please provide extra mint spicy pani and no onion in tikki',
    payment_method: 'Cash on Delivery',
    subtotal: 150,
    delivery_fee: 25,
    total: 175,
    status: 'New',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    order_items: [
      {
        id: 'item-1',
        order_id: 'ord-sample-1',
        product_id: 'prod-1',
        product_name: 'Classic Golgappe / Pani Puri (6 Pcs)',
        quantity: 2,
        unit_price: 35,
        total_price: 70
      },
      {
        id: 'item-2',
        order_id: 'ord-sample-1',
        product_id: 'prod-7',
        product_name: 'Royal Raj Kachori',
        quantity: 1,
        unit_price: 85,
        total_price: 85
      }
    ]
  },
  {
    id: 'ord-sample-2',
    order_number: 1002,
    customer_name: 'Priya Verma',
    customer_phone: '9812345678',
    delivery_address: 'House 12B, Green Avenue, Civil Lines',
    delivery_instructions: 'Ring doorbell twice',
    payment_method: 'Cash on Delivery',
    subtotal: 240,
    delivery_fee: 0,
    total: 240,
    status: 'Preparing',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    order_items: [
      {
        id: 'item-3',
        order_id: 'ord-sample-2',
        product_id: 'prod-3',
        product_name: 'Party Pack Golgappe (30 Pcs DIY Kit)',
        quantity: 1,
        unit_price: 180,
        total_price: 180
      },
      {
        id: 'item-4',
        order_id: 'ord-sample-2',
        product_id: 'prod-2',
        product_name: 'Special Dahi Puri / Sev Batata Puri (6 Pcs)',
        quantity: 1,
        unit_price: 60,
        total_price: 60
      }
    ]
  }
];
let memorySettings: BusinessSettings = { ...DEFAULT_SETTINGS };

// Helper to access LocalStorage safely in browser
function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as Category[];
    } catch (err) {
      console.warn('Supabase getCategories error, using local fallback:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const local = getLocalItem<Category[]>(LOCAL_STORAGE_KEY_CATEGORIES, memoryCategories);
    return local;
  }
  return memoryCategories;
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const newCat: Category = {
    id: category.id || `cat-${Date.now()}`,
    name: category.name || 'New Category',
    description: category.description || '',
    is_active: category.is_active !== undefined ? category.is_active : true,
    sort_order: category.sort_order || 0,
    created_at: category.created_at || new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .upsert(newCat)
        .select()
        .single();
      if (!error && data) return data as Category;
    } catch (err) {
      console.warn('Supabase saveCategory error, falling back:', err);
    }
  }

  const existing = await getCategories();
  const index = existing.findIndex((c) => c.id === newCat.id);
  let updated: Category[];
  if (index >= 0) {
    updated = existing.map((c) => (c.id === newCat.id ? newCat : c));
  } else {
    updated = [...existing, newCat];
  }
  memoryCategories = updated;
  setLocalItem(LOCAL_STORAGE_KEY_CATEGORIES, updated);
  return newCat;
}

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------
export async function getProducts(onlyAvailable = false): Promise<Product[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('sort_order', { ascending: true });

      if (onlyAvailable) {
        query = query.eq('is_available', true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Product[];
    } catch (err) {
      console.warn('Supabase getProducts error, using local fallback:', err);
    }
  }

  let products = typeof window !== 'undefined'
    ? getLocalItem<Product[]>(LOCAL_STORAGE_KEY_PRODUCTS, memoryProducts)
    : memoryProducts;

  if (onlyAvailable) {
    products = products.filter((p) => p.is_available);
  }
  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const id = productData.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();
  const product: Product = {
    id,
    category_id: productData.category_id || null,
    name: productData.name || 'Unnamed Item',
    description: productData.description || '',
    price: Number(productData.price) || 0,
    image_url: productData.image_url || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    is_available: productData.is_available !== undefined ? productData.is_available : true,
    is_featured: productData.is_featured !== undefined ? productData.is_featured : false,
    sort_order: productData.sort_order || 0,
    created_at: productData.created_at || now,
    updated_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(product)
        .select()
        .single();
      if (!error && data) return data as Product;
    } catch (err) {
      console.warn('Supabase saveProduct error, falling back:', err);
    }
  }

  const products = await getProducts(false);
  const index = products.findIndex((p) => p.id === id);
  let updated: Product[];
  if (index >= 0) {
    updated = products.map((p) => (p.id === id ? product : p));
  } else {
    updated = [product, ...products];
  }
  memoryProducts = updated;
  setLocalItem(LOCAL_STORAGE_KEY_PRODUCTS, updated);
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteProduct error, falling back:', err);
    }
  }

  const products = await getProducts(false);
  const updated = products.filter((p) => p.id !== id);
  memoryProducts = updated;
  setLocalItem(LOCAL_STORAGE_KEY_PRODUCTS, updated);
  return true;
}

export async function toggleProductAvailability(id: string, is_available: boolean): Promise<Product | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ is_available, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Product;
    } catch (err) {
      console.warn('Supabase toggleProductAvailability error, falling back:', err);
    }
  }

  const products = await getProducts(false);
  let found: Product | null = null;
  const updated = products.map((p) => {
    if (p.id === id) {
      found = { ...p, is_available, updated_at: new Date().toISOString() };
      return found;
    }
    return p;
  });
  memoryProducts = updated;
  setLocalItem(LOCAL_STORAGE_KEY_PRODUCTS, updated);
  return found;
}

// -------------------------------------------------------------
// ORDERS & SERVER-SIDE VALIDATION
// -------------------------------------------------------------
export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_instructions?: string;
  payment_method?: string;
  items: { product_id: string; quantity: number }[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if (!payload.items || payload.items.length === 0) {
    throw new Error('Cart must contain at least one item');
  }

  if (!payload.customer_name || !payload.customer_phone || !payload.delivery_address) {
    throw new Error('Customer name, phone, and delivery address are required');
  }

  // Retrieve current fresh product prices from DB/source to NEVER trust client prices
  const allProducts = await getProducts(false);
  const settings = await getSettings();

  let subtotal = 0;
  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderItems: OrderItem[] = [];

  for (const itemPayload of payload.items) {
    const product = allProducts.find((p) => p.id === itemPayload.product_id);
    if (!product) {
      throw new Error(`Product with ID ${itemPayload.product_id} no longer exists`);
    }
    if (!product.is_available) {
      throw new Error(`Product "${product.name}" is currently unavailable`);
    }

    const qty = Math.max(1, Math.floor(itemPayload.quantity));
    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    orderItems.push({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      order_id: orderId,
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: unitPrice,
      total_price: lineTotal
    });
  }

  // Delivery fee calculation based on business settings
  let deliveryFee = Number(settings.delivery_fee) || 0;
  if (settings.free_delivery_threshold && subtotal >= Number(settings.free_delivery_threshold)) {
    deliveryFee = 0;
  }

  const total = subtotal + deliveryFee;
  const orderNumber = Math.floor(1000 + Math.random() * 9000);

  const orderRecord: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_name: payload.customer_name.trim(),
    customer_phone: payload.customer_phone.trim(),
    delivery_address: payload.delivery_address.trim(),
    delivery_instructions: payload.delivery_instructions?.trim() || null,
    payment_method: payload.payment_method || 'Cash on Delivery',
    subtotal,
    delivery_fee: deliveryFee,
    total,
    status: 'New',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_items: orderItems
  };

  // If Supabase is available, insert into Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          id: orderRecord.id,
          customer_name: orderRecord.customer_name,
          customer_phone: orderRecord.customer_phone,
          delivery_address: orderRecord.delivery_address,
          delivery_instructions: orderRecord.delivery_instructions,
          payment_method: orderRecord.payment_method,
          subtotal: orderRecord.subtotal,
          delivery_fee: orderRecord.delivery_fee,
          total: orderRecord.total,
          status: 'New'
        })
        .select()
        .single();

      if (!orderErr && insertedOrder) {
        // Insert order items
        const itemsToInsert = orderItems.map((item) => ({
          order_id: insertedOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        await supabase.from('order_items').insert(itemsToInsert);

        orderRecord.id = insertedOrder.id;
        orderRecord.order_number = insertedOrder.order_number || orderNumber;
      }
    } catch (err) {
      console.warn('Supabase createOrder error, saving locally:', err);
    }
  }

  // Store in local memory / localStorage
  const existingOrders = await getOrders();
  const updatedOrders = [orderRecord, ...existingOrders];
  memoryOrders = updatedOrders;
  setLocalItem(LOCAL_STORAGE_KEY_ORDERS, updatedOrders);

  // Trigger free notification
  sendNewOrderNotification(orderRecord, orderItems, settings).catch(console.error);

  return orderRecord;
}

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) return data as Order[];
    } catch (err) {
      console.warn('Supabase getOrders error, using local fallback:', err);
    }
  }

  return typeof window !== 'undefined'
    ? getLocalItem<Order[]>(LOCAL_STORAGE_KEY_ORDERS, memoryOrders)
    : memoryOrders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (!error && data) return data as Order;
    } catch (err) {
      console.warn('Supabase getOrderById error, using local fallback:', err);
    }
  }

  const orders = await getOrders();
  return orders.find((o) => o.id === id || String(o.order_number) === id) || null;
}

export async function updateOrderStatus(id: string, status: OrderStatus, estimated_time?: string): Promise<Order | null> {
  const now = new Date().toISOString();
  const updateData: { status: OrderStatus; updated_at: string; estimated_time?: string } = {
    status,
    updated_at: now
  };
  if (estimated_time !== undefined) {
    updateData.estimated_time = estimated_time;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select('*, order_items(*)')
        .single();

      if (!error && data) return data as Order;
    } catch (err) {
      console.warn('Supabase updateOrderStatus error, using local fallback:', err);
    }
  }

  const orders = await getOrders();
  let updatedOrder: Order | null = null;
  const updatedOrders = orders.map((ord) => {
    if (ord.id === id || String(ord.order_number) === id) {
      updatedOrder = {
        ...ord,
        status,
        ...(estimated_time !== undefined ? { estimated_time } : {}),
        updated_at: now
      };
      return updatedOrder;
    }
    return ord;
  });

  memoryOrders = updatedOrders;
  setLocalItem(LOCAL_STORAGE_KEY_ORDERS, updatedOrders);
  return updatedOrder;
}

export interface PublicOrder {
  id: string;
  order_number: number | string;
  customer_display: string;
  status: OrderStatus;
  estimated_time: string;
  items_summary: string;
  items_count: number;
  created_at: string;
}

export async function getPublicLiveOrders(): Promise<PublicOrder[]> {
  const allOrders = await getOrders();
  // Filter only today's or recent active orders (excluding ancient cancelled ones)
  return allOrders.map((ord) => {
    const nameParts = (ord.customer_name || 'Customer').trim().split(' ');
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0].toUpperCase()}.`
      : nameParts[0];

    const itemsCount = ord.order_items?.reduce((acc, it) => acc + it.quantity, 0) || 1;
    const itemsSummary = ord.order_items?.map((it) => `${it.quantity}x ${it.product_name}`).join(', ') || 'Chaat & Snacks';

    return {
      id: ord.id,
      order_number: ord.order_number || ord.id.slice(0, 6),
      customer_display: maskedName,
      status: ord.status,
      estimated_time: ord.estimated_time || '20-30 mins',
      items_summary: itemsSummary,
      items_count: itemsCount,
      created_at: ord.created_at
    };
  });
}

// -------------------------------------------------------------
// BUSINESS SETTINGS
// -------------------------------------------------------------
export async function getSettings(): Promise<BusinessSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'general')
        .single();

      if (!error && data && data.value) return data.value as BusinessSettings;
    } catch (err) {
      console.warn('Supabase getSettings error, using local fallback:', err);
    }
  }

  return typeof window !== 'undefined'
    ? getLocalItem<BusinessSettings>(LOCAL_STORAGE_KEY_SETTINGS, memorySettings)
    : memorySettings;
}

export async function updateSettings(newSettings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const current = await getSettings();
  const updated = { ...current, ...newSettings };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('settings')
        .upsert({ key: 'general', value: updated, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn('Supabase updateSettings error:', err);
    }
  }

  memorySettings = updated;
  setLocalItem(LOCAL_STORAGE_KEY_SETTINGS, updated);
  return updated;
}
