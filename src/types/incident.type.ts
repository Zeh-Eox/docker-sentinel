export type NotificationType = "new" | "escalation" | null;

export interface Incident {
  key: string;
  containerName: string;
  severity: string;
  rawMessage: string;
  message: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  lastNotificationCount: number;
}

export interface RegisterIncidentResult {
  incident: Incident;
  isNew: boolean;
  shouldNotify: boolean;
  notificationType: NotificationType;
}
