export interface LogEvent {
  containerId: string;
  containerName: string;
  message: string;
  timestamp: Date;
  source: "stdout" | "stderr";
}
