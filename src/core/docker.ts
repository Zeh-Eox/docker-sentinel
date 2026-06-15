import Docker from "dockerode";

export const docker: Docker = new Docker({
  socketPath: "/var/run/docker.sock",
});
