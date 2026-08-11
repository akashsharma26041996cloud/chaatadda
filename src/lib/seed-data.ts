import { Category, Product, BusinessSettings } from '@/types/database';

export const DEFAULT_SETTINGS: BusinessSettings = {
  business_name: 'Chaat Adda',
  tagline: 'Authentic Crispy Golgappe & Delicacies Made with RO Water & Pure Desi Ghee',
  business_phone: '+91 98765 43210',
  whatsapp_number: '919876543210',
  delivery_fee: 25,
  min_order_amount: 99,
  free_delivery_threshold: 299,
  delivery_areas: 'Within 2-5 km radius (Model Town, Civil Lines, Urban Estate, Main Market)',
  business_hours: '12:30 PM - 10:30 PM (Open 7 Days)',
  delivery_message: 'Freshly packed in spill-proof tamper-evident containers with separate crispy puris and spicy mint water.',
  is_open: true,
  admin_notification_email: 'admin@chaatadda.com'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-golgappe',
    name: 'Golgappe & Pani Puri',
    description: 'Crispy hollow puris served with spicy mint water, sweet tamarind chutney and potato-chickpea filling',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-chaat',
    name: 'Crispy Chaats',
    description: 'Tempting savory Indian street chaats loaded with whipped sweetened curd, chutneys and aromatic spices',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-specials',
    name: 'Special Delights',
    description: 'Chef special street specialties prepared with authentic regional recipes',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-combos',
    name: 'Family & Party Combos',
    description: 'Special value pack combinations perfect for small gatherings and tea-time cravings',
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-drinks',
    name: 'Beverages & Sweets',
    description: 'Refreshing cool drinks and authentic traditional desserts to conclude your meal',
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category_id: 'cat-golgappe',
    name: 'Classic Golgappe / Pani Puri (6 Pcs)',
    description: '6 Super-crispy puris served with spicy hing-mint teekha pani, sweet saunth meetha pani, and seasoned potato-chana mash.',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    category_id: 'cat-golgappe',
    name: 'Special Dahi Puri / Sev Batata Puri (6 Pcs)',
    description: 'Puris stuffed with boiled potatoes, chilled thick beaten curd, zesty tamarind chutney, mint sauce, garnished with fine nylon sev & pomegranate.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    category_id: 'cat-golgappe',
    name: 'Party Pack Golgappe (30 Pcs DIY Kit)',
    description: '30 Fresh crispy puris safely boxed, 1L Hing-Pudina Spicy Water, 500ml Sweet Imli Saunth, 400g Potato & Boondi Filling. Complete home setup!',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    category_id: 'cat-chaat',
    name: 'Crispy Aloo Tikki Chaat (2 Pcs)',
    description: 'Golden shallow-fried crunchy spiced potato patties topped with warm spiced chole, sweet curd, homemade date-tamarind chutney, and fresh coriander.',
    price: 55,
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    category_id: 'cat-chaat',
    name: 'Delhi Style Papdi Chaat',
    description: 'Crispy flour crackers tossed with diced potatoes, spiced chickpeas, creamy sweet yogurt, roasted cumin powder, tangy chaat masala & sev.',
    price: 55,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    category_id: 'cat-chaat',
    name: 'Melt-in-Mouth Dahi Bhalla',
    description: 'Soft, spongy urad dal dumplings soaked in chilled spiced yogurt, sprinkled with roasted jeera, red chilli powder and sweet tamarind relish.',
    price: 65,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 6,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    category_id: 'cat-specials',
    name: 'Royal Raj Kachori',
    description: 'Grand crispy hollow sphere loaded with bhalla, sprouted moong, potatoes, dry fruits, papdi, chilled curd, trio of chutneys, beetroot juliennes & sev.',
    price: 85,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 7,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-8',
    category_id: 'cat-specials',
    name: 'Punjabi Samosa Chaat (2 Pcs)',
    description: 'Hot crushed crispy potato-pea samosas smothered in hearty Amritsari chole gravy, sweetened dahi, pickled onions and tangy chutneys.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    sort_order: 8,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-9',
    category_id: 'cat-combos',
    name: 'Street Food Duo Combo',
    description: '1 Portion Golgappe (6 Pcs) + 1 Plate Aloo Tikki Chaat + 1 Kulhad Sweet Lassi. Perfect single meal indulgence.',
    price: 130,
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
    sort_order: 9,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-10',
    category_id: 'cat-drinks',
    name: 'Punjabi Malai Sweet Lassi',
    description: 'Thick, creamy churned yogurt drink flavoured with cardamom and rose water, topped with rich rabdi malai.',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
    sort_order: 10,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-11',
    category_id: 'cat-drinks',
    name: 'Hot Gulab Jamun (2 Pcs)',
    description: 'Soft khoya dumplings soaked in fragrant cardamom & saffron sugar syrup. Served warm.',
    price: 40,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
    sort_order: 11,
    created_at: new Date().toISOString()
  }
];
