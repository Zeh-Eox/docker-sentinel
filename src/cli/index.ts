#!/usr/bin/env node

import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runStart } from "./commands/start.js";

const program = new Command();

program
  .name("docker-sentinel")
  .description(
    "Real-time Docker container log monitoring with AI-powered alerts",
  )
  .version("1.0.0");

program
  .command("init")
  .description("Initialize configuration (.env and sentinel.config.json)")
  .action(runInit);

program
  .command("start")
  .description("Start monitoring containers")
  .action(runStart);

program.parse();
