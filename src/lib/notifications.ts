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

    // Telegram Bot Automated Notification (100% Free, Instant & Reliable)
    const tgToken = settings?.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = settings?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      const tgText = [
        `🥟 <b>NEW ORDER #${order.order_number || order.id.slice(0, 6)}</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 <b>Customer:</b> ${order.customer_name}`,
        `📞 <b>Phone:</b> <code>+91 ${order.customer_phone}</code>`,
        `📍 <b>Address:</b> ${order.delivery_address}`,
        order.delivery_instructions ? `📝 <b>Note:</b> <i>${order.delivery_instructions}</i>` : '',
        `━━━━━━━━━━━━━━━━━━━━`,
        `📦 <b>ITEMS:</b>`,
        items.map((i) => `• <b>${i.quantity}x</b> ${i.product_name} (₹${i.total_price})`).join('\n'),
        `━━━━━━━━━━━━━━━━━━━━`,
        `💵 <b>TOTAL:</b> ₹${order.total} (<b>${order.payment_method}</b>)`,
        `⏱️ <b>Time:</b> ${timeStr}`
      ]
        .filter(Boolean)
        .join('\n');

      const tgUrl = `https://api.telegram.org/bot${tgToken.trim()}/sendMessage`;

      fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId.trim(),
          text: tgText,
          parse_mode: 'HTML'
        })
      })
        .then(async (res) => {
          const data = await res.json();
          console.log('🤖 Telegram Notification Response:', data);
        })
        .catch((err) => {
          console.error('🤖 Telegram Notification Error:', err);
        });
    }

    // Instant Mobile Push Notifications via ntfy.sh (100% Free, No Account Needed, Works on Android & iOS)
    const ntfyTopic = settings?.ntfy_topic || process.env.NTFY_TOPIC || process.env.NEXT_PUBLIC_NTFY_TOPIC;
    if (ntfyTopic) {
      const cleanTopic = ntfyTopic.trim().replace(/^https?:\/\/ntfy\.sh\//, '');
      const pushTitle = `🥟 New Order #${order.order_number || order.id.slice(0, 6)} - ₹${order.total}`;
      const pushBody = `${order.customer_name} (+91 ${order.customer_phone})\n📍 ${order.delivery_address}\n📦 ${items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}`;

      fetch('https://ntfy.sh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: cleanTopic,
          title: pushTitle,
          message: pushBody,
          priority: 5,
          tags: ['dumpling', 'moneybag', 'bell'],
          click: 'https://chaatadda.vercel.app/admin/orders'
        })
      })
        .then(async (res) => {
          console.log('🔔 [ntfy Push Notification] Status:', res.status);
        })
        .catch((err) => {
          console.error('🔔 [ntfy Push Notification] Error:', err);
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
 * Sends a test push notification via ntfy.sh using standard JSON payload
 */
export async function sendNtfyTestNotification(
  topic: string
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanTopic = topic.trim().replace(/^https?:\/\/ntfy\.sh\//, '');
    const res = await fetch('https://ntfy.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: cleanTopic,
        title: '🚀 Chaat Adda - Push Notification Test',
        message: '✅ Push notification delivered! You will now receive instant rings for every incoming order.',
        priority: 4,
        tags: ['tada', 'bell', 'white_check_mark'],
        click: 'https://chaatadda.vercel.app/admin/orders'
      })
    });

    if (res.ok) {
      return { success: true, message: 'Push notification sent to your phone via ntfy!' };
    } else {
      return { success: false, message: 'Failed to dispatch push notification. Check topic name.' };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, message: `Failed to connect to push service: ${msg}` };
  }
}

/**
 * Sends a test message via Telegram Bot to verify token and chat id
 */
export async function sendTelegramTestNotification(
  token: string,
  chatId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const testText = [
      `🚀 <b>Chaat Adda - Telegram Bot Test</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `✅ <b>Success!</b> Your Telegram notification integration is working!`,
      `🔔 You will now receive instant live alerts with full order details for every new customer order here! 🥟✨`
    ].join('\n');

    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: testText,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Test message sent to Telegram successfully!' };
    } else {
      return {
        success: false,
        message: data.description || 'Telegram API returned an error. Check Token and Chat ID.'
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, message: `Failed to connect to Telegram: ${msg}` };
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
