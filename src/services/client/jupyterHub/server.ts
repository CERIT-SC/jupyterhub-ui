// Server-related JupyterHub functions and types

import { getUsernameOrDefault } from "./utils";
import { ServerOptions, ServerStatus } from "./types";

import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";

export async function getUserNamedNotebooks(
  username?: string,
): Promise<Record<string, ServerStatus>> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<any>(
    `/users/${resolvedUsername}`,
    {
      params: {
        include_stopped_servers: true,
      },
    },
  );
  const data = response.data;
  const namedServers: Record<string, ServerStatus> = {};

  if (data.servers) {
    Object.entries(data.servers).forEach(([name, server]) => {
      if (name !== "") {
        namedServers[name] = server as ServerStatus;
      }
    });
  }

  return namedServers;
}

export async function getServerStatus(
  serverName: string,
  username?: string,
): Promise<ServerStatus> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<ServerStatus>(
    `/users/${resolvedUsername}/servers/${serverName}`,
  );

  return response.data;
}

export async function startServer(
  serverName: string,
  options?: ServerOptions,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  await jupyterHubClient.post(
    `/users/${resolvedUsername}/servers/${serverName}`,
    options || {},
  );
}

export async function stopServer(
  serverName: string,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  await jupyterHubClient.delete(
    `/users/${resolvedUsername}/servers/${serverName}`,
  );
}
