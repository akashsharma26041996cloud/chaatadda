const { createOrder } = require('./src/lib/db');

async function test() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://qpazmfavynzidakuzoxt.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwYXptZmF2eW56aWRha3V6b3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MTM3NTcsImV4cCI6MjEwMTk4OTc1N30.7-8-_Hur45z0DKtYFq2_uEOSWs8lKnaVopQaIF3cltU';
  
  console.log('Testing order creation via database client...');
  try {
    const payload = {
      customer_name: 'Test Customer',
      customer_phone: '919876543210',
      delivery_address: '123 Test Street, Model Town',
      delivery_instructions: 'Please call before arrival',
      payment_method: 'Cash on Delivery',
      items: [
        {
          product_id: 'c1000000-0000-0000-0000-000000000001',
          quantity: 2
        }
      ]
    };
    
    const result = await createOrder(payload);
    console.log('Order created successfully!', result);
  } catch (err) {
    console.error('Order creation failed:', err);
  }
}

test();
