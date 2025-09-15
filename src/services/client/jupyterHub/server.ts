"use client";
// Server-related JupyterHub functions and types

import {
  createOrUpdateSavedNotebookByServerName,
  deleteSavedNotebookByServerName,
} from "../savedNotebooks";

import { getUsernameOrDefault } from "./utils";
import {
  JupyterHubServerOptions,
  ServerProgress,
  ServerStatus,
  UserInfo,
} from "./types";

import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { fetchSavedNotebookByServerName } from "@/services/client/savedNotebooks";

/**
 * Get all named notebooks for a user, including stopped ones but excluding the default unnamed server
 * @param username - Optional username to use instead of the current user
 * @returns Promise that resolves with only the named servers from user info
 */
export async function getUserNamedNotebooks(
  username?: string,
): Promise<Record<string, ServerStatus>> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<UserInfo>(
    `/users/${resolvedUsername}`,
    {
      params: {
        include_stopped_servers: true,
      },
    },
  );

  const data = response.data;
  const namedServers: Record<string, ServerStatus> = {};

  // Only include servers with non-empty names
  if (data.servers) {
    Object.entries(data.servers).forEach(([name, server]) => {
      if (name !== "") {
        namedServers[name] = server;
      }
    });
  }

  return namedServers;
}

/**
 * Get status of a specific named server
 * @param serverName - Name of the server
 * @param username - Optional username to use instead of the current user
 */
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

/**
 * Fetch server progress information from Server-Sent Events (SSE) response
 * @param serverName - Name of the server
 * @param username - Optional username to use instead of the current user
 * @returns Promise that resolves with the parsed server progress information
 * @throws Error if the response cannot be parsed
 */
export async function fetchServerProgress(
  serverName: string,
  username?: string,
): Promise<ServerProgress> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<string>(
    `/users/${resolvedUsername}/servers/${serverName}/progress`,
  );

  try {
    // Extract the JSON data from SSE format (data: {json})
    const jsonMatch = response.data.match(/data: ({.*})/);

    if (!jsonMatch) {
      throw new Error("Invalid SSE response format");
    }

    return JSON.parse(jsonMatch[1]) as ServerProgress;
  } catch (error) {
    console.error("Error parsing progress response:", error);
    throw new Error("Failed to parse server progress response");
  }
}

/**
 * Create a new server with the provided options in the expected JupyterHub format
 * @param serverName - Name of the server to create
 * @param options - Options in the JupyterHub format
 * @param username - Optional username to use instead of the current user
 */
export async function createServer(
  serverName: string,
  options: JupyterHubServerOptions,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  await createOrUpdateSavedNotebookByServerName(serverName, {
    serverOptions: options,
  });

  await jupyterHubClient.post(
    `/users/${resolvedUsername}/servers/${serverName}`,
    options,
  );
}

/**
 * Start a named server
 * @param serverName - Name of the server to start
 * @param options - Server options
 * @param username - Optional username to use instead of the current user
 */
export async function startServer(
  serverName: string,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  const savedNotebookOptions = await fetchSavedNotebookByServerName(serverName);

  await jupyterHubClient.post(
    `/users/${resolvedUsername}/servers/${serverName}`,
    savedNotebookOptions?.serverOptions || {},
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

/**
 * Delete a named server (must be stopped first)
 * @param serverName - Name of the server to delete
 * @param username - Optional username to use instead of the current user
 */
export async function deleteServer(
  serverName: string,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  try {
    // For already stopped servers, we can use the remove=true parameter to fully remove it
    await jupyterHubClient.delete(
      `/users/${resolvedUsername}/servers/${serverName}`,
      {
        data: { remove: true },
      },
    );
    await deleteSavedNotebookByServerName(serverName);
  } catch (error) {
    console.error("Error deleting server:", error);
    throw error;
  }
}
