import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import inquirer from "inquirer";

const ENV_PATH = resolve(process.cwd(), ".env");
const CONFIG_PATH = resolve(process.cwd(), "sentinel.config.json");

const defaultConfig = {
  ignoredPatterns: [
    "no config file specified",
    "memory overcommit must be enabled",
  ],
  excludedContainers: ["docker-sentinel"],
};

export const runInit = async () => {
  console.log("\n🐳 Docker Sentinel — Configuration\n");

  if (existsSync(ENV_PATH)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: ".env already exists. Overwrite?",
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log("Aborted.");
      return;
    }
  }

  const answers = await inquirer.prompt([
    // Gemini
    {
      type: "input",
      name: "GEMINI_API_KEY",
      message: "Gemini API key:",
      validate: (v) => v.trim() !== "" || "Required",
    },

    // Discord
    {
      type: "input",
      name: "DISCORD_WEBHOOK_URL",
      message: "Discord webhook URL (leave empty to skip):",
    },

    // Telegram
    {
      type: "input",
      name: "TELEGRAM_BOT_TOKEN",
      message: "Telegram bot token (leave empty to skip):",
    },
    {
      type: "input",
      name: "TELEGRAM_CHAT_ID",
      message: "Telegram chat ID (leave empty to skip):",
      when: (a) => a.TELEGRAM_BOT_TOKEN !== "",
    },

    // Mail
    {
      type: "input",
      name: "MAIL_HOST",
      message: "SMTP host (leave empty to skip):",
    },
    {
      type: "input",
      name: "MAIL_PORT",
      message: "SMTP port:",
      default: "587",
      when: (a) => a.MAIL_HOST !== "",
    },
    {
      type: "input",
      name: "MAIL_USER",
      message: "SMTP username:",
      when: (a) => a.MAIL_HOST !== "",
    },
    {
      type: "password",
      name: "MAIL_PASS",
      message: "SMTP password / App Password:",
      mask: "*",
      when: (a) => a.MAIL_HOST !== "",
    },
    {
      type: "input",
      name: "MAIL_FROM",
      message: "Sender email address:",
      when: (a) => a.MAIL_HOST !== "",
    },
    {
      type: "input",
      name: "MAIL_TO",
      message: "Recipient email address:",
      when: (a) => a.MAIL_HOST !== "",
    },
  ]);

  // Generate the .env file
  const envLines = Object.entries(answers)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  writeFileSync(ENV_PATH, envLines + "\n", "utf-8");
  console.log("\n✅ .env created");

  // Generate the sentinel.config.json file if it doesn't exist
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(
      CONFIG_PATH,
      JSON.stringify(defaultConfig, null, 2) + "\n",
      "utf-8",
    );
    console.log("✅ sentinel.config.json created");
  }

  console.log("\n🚀 Run 'docker-sentinel start' to begin monitoring.\n");
};
