import type { Notifier } from "../notifiers/notifier.interface.js";
import type { IncidentAnalyzer } from "../ai-features/analyzer.js";
import { docker } from "./docker.js";
import { clearIncidentsByContainer } from "./incident-manager.js";
import { followContainerLogs } from "./log-collector.js";
import { watchedContainers } from "./watched-containers.js";
import { config } from "../config.js";

const interestingActions = ["create", "start", "stop", "die", "destroy"];

export const watchDockerEvents = async (
  notifiers: Notifier[],
  analyzer: IncidentAnalyzer,
) => {
  const stream = await docker.getEvents();

  stream.on("data", async (chunk: Buffer) => {
    const event = JSON.parse(chunk.toString());

    if (event.Type !== "container") return;
    if (!interestingActions.includes(event.Action)) return;

    const containerName = event.Actor.Attributes.name || "unknown";
    if (config.excludedContainers.includes(containerName)) return;

    const containerId = event.Actor.ID;

    console.log(`[DOCKER] ${containerName} -> ${event.Action}`);

    if (event.Action === "start") {
      if (watchedContainers.has(containerId)) return;

      watchedContainers.add(containerId);
      console.log(`[DOCKER] Starting log monitoring for ${containerName}`);

      await followContainerLogs(
        containerId,
        containerName,
        notifiers,
        analyzer,
      ).catch((err) =>
        console.error(`[DOCKER] Erreur monitoring ${containerName}:`, err),
      );
    }

    if (event.Action === "destroy") {
      watchedContainers.delete(containerId);
      clearIncidentsByContainer(containerName);
      console.log(`[DOCKER] Stopped monitoring ${containerName}`);
    }
  });
};
