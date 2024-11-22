import { Telegraf } from 'telegraf';
import { promises as fs } from 'fs';
import path from 'path';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Error handling
bot.catch((err) => {
  console.error(`Error: ${err}`);
});

// Command handlers
bot.start(async (ctx) => {
  await ctx.reply('Welcome to the AI-powered chatbot! Send me a message or file, and I will forward it to the admin.');
});

bot.help(async (ctx) => {
  await ctx.reply('This bot forwards your messages and files to the admin. Simply send me what you want to share.');
});

// Message and file handling
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text;
  const messageFiles = ctx.message.document || ctx.message.photo || ctx.message.video || ctx.message.audio;

  // Forward the message and files to the admin
  await ctx.forwardMessage(process.env.ADMIN_CHAT_ID, chatId, ctx.message.message_id);

  if (messageFiles) {
    const fileExtension = path.extname(messageFiles.file_name);
    const fileName = `${Date.now()}_${chatId}${fileExtension}`;
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await ctx.downloadFile(messageFiles.file_id, filePath);
      await ctx.forwardDocument(process.env.ADMIN_CHAT_ID, { source: filePath });
      await fs.unlink(filePath);
    } catch (err) {
      console.error(`Error handling file: ${err}`);
    }
  }

  // Send a confirmation message to the user
  await ctx.reply('Your message has been forwarded to the admin.');
});

// Start the bot
bot.launch();

console.log('Bot started...');

// Enable graceful stop
process.once('SIGTERM', () => bot.stop('SIGTERM'));
process.once('SIGINT', () => bot.stop('SIGINT'));
