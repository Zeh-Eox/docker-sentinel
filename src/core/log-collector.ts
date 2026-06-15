import type Dockerode from "dockerode";
import { PassThrough } from "stream";
import { docker } from "./docker.js";
import { processLog } from "../utils/process-log.js";
import type { Notifier } from "../notifiers/notifier.interface.js";
import type { IncidentAnalyzer } from "../ai-features/analyzer.js";

export const followContainerLogs = async (
  containerId: string,
  containerName: string,
  notifiers: Notifier[],
  analyzer: IncidentAnalyzer,
) => {
  try {
    const container: Dockerode.Container = docker.getContainer(containerId);

    const logStream: NodeJS.ReadableStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: true,
    });

    const stdout: PassThrough = new PassThrough();
    const stderr: PassThrough = new PassThrough();

    container.modem.demuxStream(logStream, stdout, stderr);

    stdout.on("data", (chunk: Buffer) => {
      processLog(
        chunk.toString().trim(),
        "stdout",
        containerId,
        containerName,
        notifiers,
        analyzer,
      );
    });

    stderr.on("data", (chunk: Buffer) => {
      processLog(
        chunk.toString().trim(),
        "stderr",
        containerId,
        containerName,
        notifiers,
        analyzer,
      );
    });
  } catch (error: unknown) {
    console.error(`Error following logs for container ${containerId}:`, error);
    throw error;
  }
};
