export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const { BOT_TOKEN, ADMIN_CHAT_ID } = env;

      if (request.method === 'POST' && url.pathname === `/`) {
        const update = await request.json();

        // Check if message exists
        if (update.message && update.message.text) {
          const userMessage = update.message.text;
          const userId = update.message.from.id;
          const userName = update.message.from.username || 'Anonymous';

          // Message for the admin
          const adminMessage = `📩 New message from @${userName} (${userId}):\n\n${userMessage}`;

          // Send the message to the admin
          const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: adminMessage,
              }),
            }
          );

          // Confirm message was sent
          const result = await response.json();
          if (result.ok) {
            return new Response('Message forwarded to admin.', { status: 200 });
          } else {
            return new Response('Failed to forward message.', { status: 500 });
          }
        } else {
          return new Response('No valid message received.', { status: 400 });
        }
      }

      return new Response('Not Found', { status: 404 });
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
};
