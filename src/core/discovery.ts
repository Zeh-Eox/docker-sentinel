import type Dockerode from "dockerode";
import { docker } from "./docker.js";
import { config } from "../config.js";

export const getContainers = async () => {
  try {
    const rawContainers: Dockerode.ContainerInfo[] =
      await docker.listContainers();

    const containers = rawContainers
      .filter((c) => {
        const name = c.Names[0]?.replace("/", "") || "";
        return !config.excludedContainers.includes(name);
      })
      .map((container) => ({
        id: container.Id,
        name: container.Names[0]?.replace("/", "")!,
        image: container.Image,
      }));

    return containers;
  } catch (error: unknown) {
    console.error("Error fetching containers:", error);
    throw error;
  }
};
