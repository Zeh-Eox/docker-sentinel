import type { IncidentExplanation } from "../types/incident-explanation.type.js";

export const explainIncident = (
  message: string,
): IncidentExplanation | null => {
  const lower = message.toLowerCase();

  if (lower.includes("memory overcommit")) {
    return {
      probableCause: "Le paramètre Linux vm.overcommit_memory est désactivé.",

      impact:
        "Les sauvegardes Redis et la réplication peuvent échouer sous forte pression mémoire.",

      recommendation:
        "Exécuter 'sysctl vm.overcommit_memory=1' puis rendre le changement permanent dans /etc/sysctl.conf.",

      confidence: 0.9,
      category: "Configuration système",
    };
  }

  if (lower.includes("column") && lower.includes("does not exist")) {
    return {
      probableCause:
        "Une requête SQL référence une colonne absente de la base de données.",

      impact: "Les opérations utilisant cette requête échoueront.",

      recommendation:
        "Vérifier les migrations et comparer le schéma PostgreSQL avec le code applicatif.",

      confidence: 0.8,
      category: "Base de données",
    };
  }

  if (lower.includes("relation") && lower.includes("does not exist")) {
    return {
      probableCause: "La table PostgreSQL demandée n'existe pas.",

      impact: "Les requêtes SQL ciblant cette table échoueront.",

      recommendation:
        "Vérifier les migrations et la connexion à la bonne base de données.",

      confidence: 0.8,
      category: "Base de données",
    };
  }

  if (lower.includes("econnrefused") || lower.includes("connection refused")) {
    return {
      probableCause: "Le service distant est inaccessible ou arrêté.",

      impact: "L'application ne peut pas communiquer avec sa dépendance.",

      recommendation:
        "Vérifier que le conteneur cible est démarré et que le port est correct.",

      confidence: 0.7,
      category: "Réseau",
    };
  }

  if (lower.includes("out of memory") || lower.includes("oomkilled")) {
    return {
      probableCause: "Le conteneur a dépassé la mémoire disponible.",

      impact: "Le processus peut être tué brutalement par le noyau Linux.",

      recommendation:
        "Augmenter la mémoire disponible ou optimiser l'application.",

      confidence: 0.9,
      category: "Ressources",
    };
  }

  return null;
};
