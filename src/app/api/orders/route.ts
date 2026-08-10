import { NextResponse } from 'next/server';
import { createOrder, CreateOrderPayload } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body: CreateOrderPayload = await request.json();

    // Basic payload check
    if (!body.customer_name || !body.customer_phone || !body.delivery_address) {
      return NextResponse.json(
        { error: 'Name, mobile number, and delivery address are required.' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    // Phone validation (at least 10 digits)
    const cleanPhone = body.customer_phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // Process order with server-side fresh price calculation
    const order = await createOrder(body);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      order
    });
  } catch (err: unknown) {
    console.error('Order creation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
