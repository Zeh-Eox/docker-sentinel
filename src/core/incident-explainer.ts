import type { IncidentExplanation } from "../types/incident-explanation.type.js";

export const explainIncident = (
  message: string,
): IncidentExplanation | null => {
  const lower = message.toLowerCase();

  if (lower.includes("memory overcommit")) {
    return {
      probableCause: "The Linux vm.overcommit_memory parameter is disabled.",

      impact:
        "Redis background saves and replication may fail under memory pressure.",

      recommendation:
        "Run 'sysctl vm.overcommit_memory=1' and make the change persistent in /etc/sysctl.conf.",

      confidence: 0.9,
      category: "System Configuration",
    };
  }

  if (lower.includes("column") && lower.includes("does not exist")) {
    return {
      probableCause:
        "A SQL query is referencing a column that does not exist in the database schema.",

      impact: "Operations relying on this query will fail.",

      recommendation:
        "Review your database migrations and compare the PostgreSQL schema with the application code.",

      confidence: 0.8,
      category: "Database",
    };
  }

  if (lower.includes("relation") && lower.includes("does not exist")) {
    return {
      probableCause: "The requested PostgreSQL table does not exist.",

      impact: "Queries targeting this table will fail.",

      recommendation:
        "Verify your database migrations and ensure the application is connected to the correct database.",

      confidence: 0.8,
      category: "Database",
    };
  }

  if (lower.includes("econnrefused") || lower.includes("connection refused")) {
    return {
      probableCause: "The target service is unavailable or not running.",

      impact:
        "The application cannot communicate with one of its dependencies.",

      recommendation:
        "Verify that the target container is running and that the configured port is correct.",

      confidence: 0.7,
      category: "Networking",
    };
  }

  if (lower.includes("out of memory") || lower.includes("oomkilled")) {
    return {
      probableCause: "The container exceeded its available memory limit.",

      impact: "The process may be terminated by the Linux kernel.",

      recommendation:
        "Increase the available memory or optimize the application's memory usage.",

      confidence: 0.9,
      category: "Resources",
    };
  }

  return null;
};
