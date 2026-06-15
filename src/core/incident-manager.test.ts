import test from "node:test";
import assert from "node:assert/strict";
import type { LogEvent } from "../types/log-event.type.js";
import { registerIncident } from "./incident-manager.js";

const event = (message: string): LogEvent => ({
  containerId: "container-1",
  containerName: `api-${Date.now()}-${Math.random()}`,
  message,
  source: "stderr",
  timestamp: new Date(),
});

test("registers a new incident and suppresses duplicates until escalation", () => {
  const firstEvent = event("Error user 42 failed from 10.0.0.1");
  const duplicateEvent = {
    ...firstEvent,
    message: "Error user 84 failed from 10.0.0.2",
  };

  const first = registerIncident(firstEvent, "error");
  assert.equal(first.isNew, true);
  assert.equal(first.shouldNotify, true);
  assert.equal(first.incident.count, 1);

  for (let i = 0; i < 8; i += 1) {
    const duplicate = registerIncident(duplicateEvent, "error");
    assert.equal(duplicate.isNew, false);
    assert.equal(duplicate.shouldNotify, false);
  }

  const escalation = registerIncident(duplicateEvent, "error");
  assert.equal(escalation.isNew, false);
  assert.equal(escalation.shouldNotify, true);
  assert.equal(escalation.notificationType, "escalation");
  assert.equal(escalation.incident.count, 10);
});
