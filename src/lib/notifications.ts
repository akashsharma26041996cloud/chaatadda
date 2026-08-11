import { Order, OrderItem, BusinessSettings } from '@/types/database';

/**
 * Free notification service abstraction for small business owners.
 * Dispatches notification when a new order is received.
 * Can be connected to free email webhooks (e.g. Formspree, Resend, Discord/Telegram webhook)
 * without breaking application architecture.
 */
export async function sendNewOrderNotification(
  order: Order,
  items: OrderItem[],
  settings?: BusinessSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const summaryText = items
      .map((item) => `• ${item.quantity}x ${item.product_name} (₹${item.total_price})`)
      .join('\n');

    const orderNumberStr = order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 6)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Structured WhatsApp message format for owner
    const waText = [
      `🥟 *NEW CHAAT ORDER ${orderNumberStr}*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Customer:* ${order.customer_name}`,
      `📞 *Phone:* ${order.customer_phone}`,
      `📍 *Address:* ${order.delivery_address}`,
      order.delivery_instructions ? `📝 *Note:* ${order.delivery_instructions}` : '',
      `━━━━━━━━━━━━━━━━━━━━`,
      `📦 *ITEMS:*`,
      summaryText,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💵 *TOTAL:* ₹${order.total} (${order.payment_method})`,
      `⏱️ *Time:* ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━`
    ]
      .filter(Boolean)
      .join('\n');

    const notificationPayload = {
      event: 'NEW_ORDER_RECEIVED',
      orderId: order.id,
      orderNumber: orderNumberStr,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      deliveryAddress: order.delivery_address,
      instructions: order.delivery_instructions || 'None',
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      items: summaryText,
      timestamp: new Date().toISOString()
    };

    console.log('🔔 [FREE NOTIFICATION SERVICE] New Order Alert:', notificationPayload);

    // CallMeBot WhatsApp Automated Notification
    const botPhone = settings?.callmebot_phone || process.env.CALLMEBOT_PHONE || process.env.NEXT_PUBLIC_CALLMEBOT_PHONE;
    const botApiKey = settings?.callmebot_api_key || process.env.CALLMEBOT_API_KEY || process.env.NEXT_PUBLIC_CALLMEBOT_API_KEY;

    if (botPhone && botApiKey) {
      const cleanPhone = botPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('91') || cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=+${formattedPhone}&text=${encodeURIComponent(
        waText
      )}&apikey=${encodeURIComponent(botApiKey.trim())}`;

      fetch(callmebotUrl)
        .then(async (res) => {
          const body = await res.text();
          console.log('📲 CallMeBot WhatsApp Notification Status:', res.status, body);
        })
        .catch((err) => {
          console.error('📲 CallMeBot WhatsApp Notification Error:', err);
        });
    }

    // Optional: Send to external free webhook if set in environment
    const webhookUrl = process.env.NEXT_PUBLIC_NEW_ORDER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationPayload)
      }).catch((err) => console.error('Webhook notification error:', err));
    }

    return { success: true, message: 'Notification dispatched successfully' };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false, message: 'Notification error' };
  }
}

/**
 * Generates direct WhatsApp message link for Admin to confirm order with Customer
 */
export function generateAdminWhatsAppConfirmLink(order: Order): string {
  const cleanPhone = order.customer_phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') || cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
  const orderNumberStr = order.order_number ? `${order.order_number}` : order.id.slice(0, 6);

  let message = `Hi ${order.customer_name}, we received your order #${orderNumberStr}. Your order total is ₹${order.total}. We will confirm it shortly and prepare it fresh for delivery. 🥟✨`;

  if (order.status === 'Confirmed') {
    message = `Hi ${order.customer_name}, your order #${orderNumberStr} (Total: ₹${order.total}) has been CONFIRMED. We are preparing it fresh in our kitchen! 🥟🔥`;
  } else if (order.status === 'Preparing') {
    message = `Hi ${order.customer_name}, your order #${orderNumberStr} is being prepared fresh right now! It will be dispatched soon. 🍳👨‍🍳`;
  } else if (order.status === 'Out for Delivery') {
    message = `Hi ${order.customer_name}, your order #${orderNumberStr} is OUT FOR DELIVERY! Our delivery partner is on the way. 🚚💨`;
  } else if (order.status === 'Delivered') {
    message = `Hi ${order.customer_name}, your order #${orderNumberStr} has been successfully DELIVERED! Hope you enjoy our fresh chaat. Please order again! 😋🙏`;
  } else if (order.status === 'Cancelled') {
    message = `Hi ${order.customer_name}, your order #${orderNumberStr} has been cancelled. Please contact us if you have any questions.`;
  }

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp customer direct ordering/query link
 */
export function generateCustomerWhatsAppLink(whatsappNumber: string, message?: string): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const formattedNumber = cleanNumber.startsWith('91') || cleanNumber.length > 10 ? cleanNumber : `91${cleanNumber}`;
  const defaultMsg = message || 'Hi! I would like to order fresh Chaat & Golgappe from your menu.';

  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(defaultMsg)}`;
}
