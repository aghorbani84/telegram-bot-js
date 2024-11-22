export default {
  async fetch(request, env) {
    const { BOT_TOKEN, ADMIN_CHAT_ID } = env;

    try {
      // Parse the URL
      const url = new URL(request.url);

      // Only handle POST requests at the root path
      if (request.method === 'POST' && url.pathname === '/') {
        // Parse the incoming JSON payload
        const update = await request.json();

        // Validate if the update contains a message and text
        if (update.message?.text) {
          const userMessage = update.message.text;
          const userId = update.message.from.id;
          const userName = update.message.from.username || 'Anonymous';

          // Construct the message to send to the admin
          const adminMessage = `📩 New message from @${userName} (${userId}):\n\n${userMessage}`;

          // Send the message to the admin via Telegram API
          const telegramResponse = await fetch(
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

          // Parse Telegram API response
          const telegramResult = await telegramResponse.json();

          if (telegramResponse.ok && telegramResult.ok) {
            return new Response('Message forwarded to admin.', { status: 200 });
          } else {
            console.error(
              'Telegram API error:',
              telegramResult.description || 'Unknown error'
            );
            return new Response(
              `Failed to forward message: ${telegramResult.description || 'Unknown error'}`,
              { status: 500 }
            );
          }
        } else {
          console.warn('No valid message received:', update);
          return new Response('No valid message received.', { status: 400 });
        }
      }

      // Handle invalid routes
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
