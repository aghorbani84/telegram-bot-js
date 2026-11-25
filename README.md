<h1 align="center">telegram-bot-js</h1>

<p align="center">
  <em>A tiny Cloudflare Worker that forwards every text message your Telegram bot receives to an admin chat.</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License: Apache 2.0" /></a>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/dependencies-0-0D9488" alt="Zero dependencies" />
</p>

---

## Overview

`index.js` is a single Cloudflare Worker (ES module syntax) that acts as a Telegram bot webhook. When a user sends the bot a text message, the Worker relays it to a chat you choose — handy as a simple "contact the admin" bot. No libraries, no database.

## Features

- Receives Telegram webhook updates via `POST /`
- Forwards text messages to `ADMIN_CHAT_ID` as `📩 New message from @username (id): …`
- Falls back to `Anonymous` when the sender has no username
- Clear HTTP responses: `200` forwarded, `400` no text message, `404` other routes, `500` Telegram/API errors
- Zero dependencies — uses the built-in `fetch`

## Tech Stack

- JavaScript (ES modules)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Telegram Bot API](https://core.telegram.org/bots/api) (`sendMessage`, webhooks)

## Getting Started

### Prerequisites

- A Cloudflare account and [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- A bot token from [@BotFather](https://t.me/BotFather)
- The chat ID that should receive messages

### Deploy

The repo has no `wrangler.toml`, so pass the entry file and name on the command line:

```bash
git clone https://github.com/aghorbani84/telegram-bot-js.git
cd telegram-bot-js

npx wrangler deploy index.js --name telegram-bot-js --compatibility-date 2024-01-01
npx wrangler secret put BOT_TOKEN --name telegram-bot-js
npx wrangler secret put ADMIN_CHAT_ID --name telegram-bot-js
```

### Register the webhook

Point Telegram at your Worker URL:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://telegram-bot-js.<your-subdomain>.workers.dev/"
```

Send your bot a message — it should appear in the admin chat.

### Environment variables

| Name | Description |
|---|---|
| `BOT_TOKEN` | Telegram bot token |
| `ADMIN_CHAT_ID` | Chat ID that receives forwarded messages |

> [!NOTE]
> The Worker does not verify Telegram's `X-Telegram-Bot-Api-Secret-Token` header, so anyone who knows the Worker URL can post to it. Consider adding a `secret_token` when calling `setWebhook` and checking it in the Worker.

## Project Structure

```
.
├── index.js   # Cloudflare Worker (webhook handler)
└── LICENSE    # Apache-2.0
```

## License

Licensed under the [Apache License 2.0](LICENSE).

## Author

**Abolfazl Ghorbani** — [@aghorbani84](https://github.com/aghorbani84)
