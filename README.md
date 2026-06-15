# 🐳 Docker Sentinel

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
[![MIT License](https://img.shields.io/badge/MIT-License-2ea44f?style=for-the-badge&logo=open-source-initiative&logoColor=white)](./LICENSE)

Docker Sentinel is a lightweight daemon that monitors your Docker containers in real time, detects errors and warnings in their logs, and sends AI-powered alerts to Discord, Telegram, and Email.

---

## How it works

```
Container logs → Severity detection → Deduplication → Gemini AI analysis → Notifications
```

1. Sentinel connects to the Docker socket and tails logs from all running containers
2. Each log line is classified as `info`, `warning`, or `error`
3. `info` logs are silently ignored
4. Incidents are deduplicated — you only get notified once per unique error, then again at 10×, 100×, 1000× occurrences
5. Gemini AI analyzes the incident and produces a structured report: summary, probable cause, impact, and recommendation. A rule-based analyzer is available when Gemini is disabled.
6. The report is sent simultaneously to Discord, Telegram, and Email

---

## Notifications

Every alert includes:

| Field             | Description                         |
| ----------------- | ----------------------------------- |
| 🔍 Probable cause | Why this error likely happened      |
| ⚠️ Impact         | What it affects on your system      |
| 💡 Recommendation | Concrete steps to fix it            |
| Container         | Which container triggered the alert |
| Severity          | `WARNING` or `ERROR`                |
| Occurrences       | How many times this has happened    |

---

## Quick start

### Prerequisites

- Docker and Docker Compose installed on your server
- A [Gemini API key](https://aistudio.google.com/app/apikey), unless you use `AI_PROVIDER=rule-based`
- Optional: a Discord webhook URL
- Optional: a Telegram bot token and chat ID
- Optional: an SMTP account for email notifications

### 1. Clone the repository

```bash
git clone https://github.com/Zeh-Eox/docker-sentinel.git
cd dockersentinel
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment variables](#environment-variables) below).

### 3. Run

```bash
docker compose up -d
```

That's it. Sentinel will automatically start monitoring all running containers.

---

## Environment variables

| Variable              | Description                                       | Example                                |
| --------------------- | ------------------------------------------------- | -------------------------------------- |
| `AI_PROVIDER`         | Analyzer provider: `gemini` or `rule-based`       | `gemini`                               |
| `GEMINI_API_URL`      | Optional custom Gemini endpoint                   | leave empty for default                |
| `GEMINI_API_KEY`      | Google Gemini API key                             | `AIza...`                              |
| `DISCORD_WEBHOOK_URL` | Discord webhook URL                               | `https://discord.com/api/webhooks/...` |
| `MAIL_HOST`           | SMTP host                                         | `smtp.gmail.com`                       |
| `MAIL_PORT`           | SMTP port                                         | `587`                                  |
| `MAIL_USER`           | SMTP username                                     | `you@gmail.com`                        |
| `MAIL_PASS`           | SMTP password or App Password                     | `abcdefghijklmnop`                     |
| `MAIL_FROM`           | Sender address (must match `MAIL_USER` for Gmail) | `you@gmail.com`                        |
| `MAIL_TO`             | Recipient address                                 | `admin@example.com`                    |
| `TELEGRAM_BOT_TOKEN`  | Telegram bot token from @BotFather                | `123456:AAF...`                        |
| `TELEGRAM_CHAT_ID`    | Your Telegram chat ID                             | `123456789`                            |

Copy `.env.example` to `.env`, then fill only the channels you want to enable.

### Getting your Telegram chat ID

1. Send any message to your bot
2. Open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in your browser
3. Find `"chat": { "id": ... }` — that number is your chat ID

---

## Configuration

Sentinel can be configured via `sentinel.config.json` at the project root:

```json
{
  "ignoredPatterns": [
    "no config file specified",
    "memory overcommit must be enabled"
  ],
  "excludedContainers": ["docker-sentinel"]
}
```

| Field                | Description                                        |
| -------------------- | -------------------------------------------------- |
| `ignoredPatterns`    | Log patterns to silently ignore (case-insensitive) |
| `excludedContainers` | Container names Sentinel will not monitor          |

> After editing `sentinel.config.json`, rebuild the image: `docker compose down && docker compose build && docker compose up -d`

---

## Security notes

Docker Sentinel mounts `/var/run/docker.sock` to read container metadata and stream logs. This socket is highly privileged, so run Sentinel only on trusted hosts and never expose the container publicly.

Never commit `.env`, webhook URLs, bot tokens, SMTP credentials, or Gemini API keys.

---

## Supported notification channels

| Channel      | Status |
| ------------ | ------ |
| Discord      | ✅     |
| Telegram     | ✅     |
| Email (SMTP) | ✅     |
| Console      | ✅     |

---

## Tech stack

- **Runtime:** Node.js 22 + TypeScript
- **Docker SDK:** dockerode
- **AI:** Google Gemini (`gemini-2.0-flash-lite`)
- **Email:** Nodemailer
- **HTTP:** Axios (Discord), native fetch (Telegram, Gemini)

---

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Test
npm test
```

---

## Roadmap

- Unit tests for parser, rules, incident deduplication, and notifiers
- OpenAI and Ollama analyzer providers
- Prometheus metrics export
- Persistent incident store
- Optional web dashboard

---

## License

This project is licensed under the [MIT License](./LICENSE).
