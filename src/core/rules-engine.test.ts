import test from "node:test";
import assert from "node:assert/strict";
import type { LogEvent } from "../types/log-event.type.js";
import { detectSeverity } from "./rules-engine.js";

const event = (message: string): LogEvent => ({
  containerId: "container-1",
  containerName: "api",
  message,
  source: "stderr",
  timestamp: new Date(),
});

test("detects error severity", () => {
  assert.equal(
    detectSeverity(event("Fatal exception while connecting")),
    "error",
  );
});

test("detects warning severity", () => {
  assert.equal(detectSeverity(event("warn: retrying request")), "warning");
});

test("ignores configured noisy patterns", () => {
  assert.equal(
    detectSeverity(event("memory overcommit must be enabled")),
    "info",
  );
});
