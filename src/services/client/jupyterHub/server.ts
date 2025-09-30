"use client";
// Server-related JupyterHub functions and types

import {
  createOrUpdateSavedNotebookByServerName,
  deleteSavedNotebookByServerName,
} from "../savedNotebooks";

import { JupyterHubServerOptions, ServerStatus } from "./types";
import { getUsernameOrDefault } from "./utils";

import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { fetchSavedNotebookByServerName } from "@/services/client/savedNotebooks";

/**
 * Get status of a specific named server
 * @param serverName - Name of the server
 * @param username - Optional username to use instead of the current user
 */
export async function getServerStatus(
  serverName: string,
  username?: string
): Promise<ServerStatus> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<ServerStatus>(
    `/users/${resolvedUsername}/servers/${serverName}`
  );

  return response.data;
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
