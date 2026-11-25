# Telegram Bot — JavaScript Worker

A small JavaScript webhook handler that receives Telegram text-message updates and forwards the message to a configured administrator chat.

## How it works

The worker's `fetch()` handler:

1. Accepts `POST /` requests containing a Telegram update payload.
2. Checks for a text message.
3. Sends the sender's username, Telegram user ID, and message text to the configured admin chat using the Telegram Bot API.
4. Returns an HTTP status describing the outcome.

Other paths and methods receive a `404` response.

## Configuration

Configure these values as deployment environment variables/secrets:

| Variable | Purpose |
| --- | --- |
| `BOT_TOKEN` | Telegram bot token |
| `ADMIN_CHAT_ID` | Destination chat ID for forwarded messages |

Never commit real bot tokens or credentials. If a token is exposed, revoke it through BotFather and replace the deployed secret.

## Deploy and connect

The source uses the module-worker `fetch(request, env)` interface. Deploy it to a JavaScript edge/runtime platform that supports this interface, then configure the Telegram bot webhook to point to the deployed HTTPS endpoint.

The webhook URL and deployment commands depend on the hosting provider and are intentionally not assumed here.

## Security notes

- Restrict who can invoke the webhook where the hosting platform allows it; the current source does not validate a Telegram webhook secret.
- Treat forwarded message contents and user identifiers as personal data.
- Add input-size limits, structured logging, and stronger error handling before production use.

## Development

The repository currently contains a single `index.js` worker entry point. Test changes with representative Telegram update payloads before deployment.