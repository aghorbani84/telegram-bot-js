import { Telegraf, Markup } from 'telegraf';
import { D1 } from '@cloudflare/workers-types';
import { Configuration, OpenAIApi } from 'openai';

// Initialize Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialize OpenAI client
const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openaiClient = new OpenAIApi(openaiConfig);

// Database connection
const db = D1.bind(this.env.D1_DATABASE);

// Authentication password
const PASSWORD = process.env.ADMIN_PASSWORD;

// Command handlers
bot.start(async (ctx) => {
  await ctx.reply('Welcome to the AI-powered chatbot!');
});

bot.help(async (ctx) => {
  await ctx.reply('This bot forwards your messages and files to the admin. Simply send me what you want to share.');
});

bot.command('authenticate', async (ctx) => {
  const password = ctx.message.text.split(' ')[1];
  if (password === PASSWORD) {
    ctx.session.authenticated = true;
    await ctx.reply('Authentication successful!');
  } else {
    await ctx.reply('Incorrect password. Please try again.');
  }
});

// Message and file handling
bot.use(async (ctx, next) => {
  if (ctx.session.authenticated || ctx.message.text.startsWith('/authenticate')) {
    await next();
  } else {
    await ctx.reply('You must authenticate first. Use /authenticate <password>');
  }
});

bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text;
  const messageFiles = ctx.message.document || ctx.message.photo || ctx.message.video || ctx.message.audio;

  // Forward the message to the admin
  await ctx.forwardMessage(process.env.ADMIN_CHAT_ID, chatId, ctx.message.message_id);

  if (messageFiles) {
    // Handle file in memory or store metadata in D1
    // Example: store file metadata in D1
    const fileMetadata = {
      chatId: ctx.chat.id,
      fileId: messageFiles.file_id,
      fileName: messageFiles.file_name,
      timestamp: Date.now(),
    };
    await db.put('file_metadata', messageFiles.file_id, JSON.stringify(fileMetadata));
  }

  // Store the message in the database
  await db.put('messages', ctx.message.message_id, JSON.stringify({
    chatId: ctx.chat.id,
    messageText: ctx.message.text,
    timestamp: Date.now(),
  }));

  // Get AI response
  const aiResponse = await openaiClient.createCompletion({
    model: 'text-davinci-003',
    prompt: messageText,
    temperature: 0.7,
    max_tokens: 256,
  });
  await ctx.reply(aiResponse.data.choices[0].text.trim());

  await ctx.reply('Your message has been forwarded to the admin.');
});

// Error handling
bot.catch((err) => {
  console.error(`Error: ${err}`);
});

// Scheduled task example
addEventListener('scheduled', event => {
  event.waitUntil(handleScheduledEvent());
});

async function handleScheduledEvent() {
  // Fetch users and send reminders
  const users = await db.list('users');
  for (const user of users) {
    await bot.telegram.sendMessage(user.chatId, 'This is a reminder message!');
  }
}

// Start the bot
bot.launch();

console.log('Bot started...');

// Enable graceful stop
process.once('SIGTERM', () => bot.stop('SIGTERM'));
process.once('SIGINT', () => bot.stop('SIGINT'));
