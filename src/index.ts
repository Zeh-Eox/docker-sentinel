import "dotenv/config";

import { getContainers } from "./core/discovery.js";
import { followContainerLogs } from "./core/log-collector.js";
import { watchDockerEvents } from "./core/docker-events.js";
import { watchedContainers } from "./core/watched-containers.js";
import type { Notifier } from "./notifiers/notifier.interface.js";
import { ConsoleNotifier } from "./notifiers/console-notifier.js";
import { DiscordNotifier } from "./notifiers/discord-notifier.js";
import { MailNotifier } from "./notifiers/mail-notifier.js";
import { TelegramNotifier } from "./notifiers/telegram-notifier.js";
import type { IncidentAnalyzer } from "./ai-features/analyzer.js";
import { GeminiAnalyzer } from "./ai-features/providers/gemini-provider.js";
import { RuleBasedAnalyzer } from "./ai-features/rule-based-analyzer.js";

const hasEnv = (...keys: string[]): boolean =>
  keys.every((k) => !!process.env[k]);

const buildAnalyzer = (): IncidentAnalyzer => {
  const provider = process.env.AI_PROVIDER || "gemini";

  if (provider === "rule-based") {
    console.log("Rule-based analyzer enabled");
    return new RuleBasedAnalyzer();
  }

  if (process.env.GEMINI_API_KEY) {
    console.log("Gemini analyzer enabled");
    return new GeminiAnalyzer(process.env.GEMINI_API_KEY);
  }

  console.warn(
    "GEMINI_API_KEY is missing. Falling back to the rule-based analyzer.",
  );
  return new RuleBasedAnalyzer();
};

const buildNotifiers = (): Notifier[] => {
  const notifiers: Notifier[] = [new ConsoleNotifier()];

  if (hasEnv("DISCORD_WEBHOOK_URL")) {
    notifiers.push(new DiscordNotifier(process.env.DISCORD_WEBHOOK_URL!));
    console.log("✅ Discord notifier enabled");
  }

  if (hasEnv("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID")) {
    notifiers.push(
      new TelegramNotifier(
        process.env.TELEGRAM_BOT_TOKEN!,
        process.env.TELEGRAM_CHAT_ID!,
      ),
    );
    console.log("✅ Telegram notifier enabled");
  }

  if (
    hasEnv(
      "MAIL_HOST",
      "MAIL_PORT",
      "MAIL_USER",
      "MAIL_PASS",
      "MAIL_FROM",
      "MAIL_TO",
    )
  ) {
    notifiers.push(
      new MailNotifier({
        host: process.env.MAIL_HOST!,
        port: Number(process.env.MAIL_PORT),
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
        from: process.env.MAIL_FROM!,
        to: process.env.MAIL_TO!,
      }),
    );
    console.log("✅ Mail notifier enabled");
  }

  if (notifiers.length === 1) {
    console.warn(
      "⚠️  No notifiers configured. Only console output will be used. Please set up at least one notifier in your environment variables.",
    );
  }

  return notifiers;
};

const main = async () => {
  const analyzer = buildAnalyzer();
  const notifiers = buildNotifiers();

  try {
    const containers = await getContainers();

    if (containers.length === 0) {
      console.log("No running containers found.");
      return;
    }

    for (const container of containers) {
      if (watchedContainers.has(container.id)) continue;
      watchedContainers.add(container.id);
      await followContainerLogs(
        container.id,
        container.name,
        notifiers,
        analyzer,
      );
    }

    await watchDockerEvents(notifiers, analyzer);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main();
