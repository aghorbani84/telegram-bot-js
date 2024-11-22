addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const { method, url } = request;
  const { pathname } = new URL(url);

  try {
    if (method === 'POST' && pathname === '/webhook') {
      const body = await request.json();
      const { message } = body;

      // Process the message and file
      const aiResponse = await processMessageWithAI(message.text);

      // Forward the message and AI response to the admin
      const adminChatId = process.env.ADMIN_CHAT_ID;
      await sendMessageToAdmin(adminChatId, `User: ${message.text}\nAI Response: ${aiResponse}`);

      if (message.document || message.photo || message.video || message.audio || message.voice || message.sticker) {
        const fileId = message.document ? message.document.file_id : message.photo[message.photo.length - 1].file_id;
        const fileInfo = await getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;
        await sendMessageToAdmin(adminChatId, `File URL: ${fileUrl}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error(`Error handling request: ${error}`);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function processMessageWithAI(message) {
  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: message,
        temperature: 0.7,
        max_tokens: 256,
      })
    });

    const data = await response.json();
    return data.choices[0].text.trim();
  } catch (error) {
    console.error(`Error processing message with AI: ${error}`);
    return 'Error processing message';
  }
}

async function sendMessageToAdmin(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
  } catch (error) {
    console.error(`Error sending message to admin: ${error}`);
  }
}

async function getFile(fileId) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`Error getting file: ${error}`);
    return null;
  }
}
