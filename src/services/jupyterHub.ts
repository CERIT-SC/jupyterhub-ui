import { jupyterHubClient } from "@/api/jupyterhub/axios-client";
import { User } from "@/api/jupyterhub/models";

export { jupyterHubClient };

export interface ServerProgress {
  progress: number;
  failed: boolean | undefined; // only true or undefined
  ready: boolean | undefined; // only true or undefined
  message: string;
  html_message: string;
  url: string;
}

export interface ServerStatus {
  name: string;
  full_name?: string;
  ready: boolean;
  stopped: boolean;
  pending: "spawn" | "stop" | null;
  user_options?: JupyterHubServerOptions;
  url?: string;
  progress?: {
    message: string;
    percent: number;
  };
  last_activity?: string;
  started?: string | null;
  state?: {
    pod_name?: string;
  };
  progress_url?: string | null;
  full_url?: string | null;
  full_progress_url?: string | null;
}

export interface UserInfo {
  name: string;
  admin: boolean;
  servers: Record<string, ServerStatus>;
  groups: string[];
}

export interface ServerOptions {
  name?: string;
  image?: string;
  [key: string]: any; // Allow for additional server options
}

/**
 * Server options structure that matches the expected format by the JupyterHub API
 */
export interface JupyterHubServerOptions {
  container_image: string;
  custom?: boolean;
  ssh: boolean;
  phome: string | "delete" | "remain";
  mountprojects: boolean;
  home: string | null;
  mounttostorage?: boolean;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  s3existing?: string;
  cpu: string;
  mem: string;
  gpu: string;
  migamount?: string;
  shmsize: string;
}

/**
 * Get username from provided parameter or fallback to 'me' if unavailable
 *
 * This function should be used in services rather than hooks directly
 * since services might be used outside of React components
 */
function getUsernameOrDefault(username?: string): string {
  // If username is provided directly, use it
  if (username) {
    return username;
  }

  // This is a browser-only function, so we need to make sure it's used in a browser context
  if (typeof window !== "undefined") {
    try {
      // Try to get user data from local storage
      const authData = localStorage.getItem("auth-data");

      if (authData) {
        const parsedAuthData = JSON.parse(authData);

        if (parsedAuthData && parsedAuthData.user && parsedAuthData.user.name) {
          return parsedAuthData.user.name;
        }
      }
    } catch (error) {
      console.error("Error getting username:", error);
    }
  }

  // Default fallback
  return "me";
}

/**
 * Get information about the current user
 * @param username - Optional username to use instead of the current user
 */
export async function getUserInfo(username?: string): Promise<UserInfo> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<UserInfo>(
    `/users/${resolvedUsername}`,
  );

  return response.data;
}

/**
 * Fetch the current user's identity from JupyterHub.
 * Returns null if the user is not logged in (401/403).
 */
export async function getUserIdentity(): Promise<User | null> {
  try {
    const response = await jupyterHubClient.get<User>("/user");

    return response.data;
  } catch (error: any) {
    if (
      error?.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      return null;
    }
    throw error;
  }
}

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
 * Get server status for use in React Query
 * @param serverName - Name of the server
 */
export async function getServerStatusQuery(
  serverName: string,
): Promise<ServerStatus> {
  const resolvedUsername = getUsernameOrDefault();
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
 * Start a named server
 * @param serverName - Name of the server to start
 * @param options - Server options
 * @param username - Optional username to use instead of the current user
 */
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

  await jupyterHubClient.post(
    `/users/${resolvedUsername}/servers/${serverName}`,
    options,
  );
}

/**
 * Create a default server with minimal resources
 *
 * @param serverName - Name of the server to create
 * @param username - Optional username to use instead of the current user
 * @returns Promise that resolves when server creation is initiated
 */
export async function createDefaultServer(
  serverName: string,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  // Create minimal server options with default settings
  const defaultOptions: JupyterHubServerOptions = {
    container_image: "cerit.io/hubs/minimalnb-cs:31-10-2024",
    cpu: "1",
    mem: "2",
    gpu: "none",
    ssh: false,
    phome: "remain",
    mountprojects: false,
    home: null,
    shmsize: "2", // Set shared memory size equal to memory
  };

  await jupyterHubClient.post(
    `/users/${resolvedUsername}/servers/${serverName}`,
    defaultOptions,
  );
}

/**
 * Stop a named server
 * @param serverName - Name of the server to stop
 * @param username - Optional username to use instead of the current user
 */
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
  } catch (error) {
    console.error("Error deleting server:", error);
    throw error;
  }
}

/**
 * Format a date string as a relative time (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;

  return dateObj.toLocaleDateString();
}

/**
 * Transforms the form options to the expected JupyterHub server format
 * @param options Form options from the spawn page
 * @returns Transformed options in the format expected by the JupyterHub API
 */
/**
 * Interface for API tokens returned from JupyterHub
 */
export interface ApiToken {
  id: string;
  user?: string;
  service?: string;
  token?: string;
  created: string;
  last_activity?: string;
  expires_at?: string | null;
  scopes: string[];
  note?: string;
}

/**
 * Get all tokens for a user
 * @param username - Optional username to use instead of the current user
 * @returns Promise that resolves with the user's API tokens
 */
export async function getUserTokens(username?: string): Promise<ApiToken[]> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<{ api_tokens: ApiToken[] }>(
    `/users/${resolvedUsername}/tokens`,
  );

  return response.data.api_tokens || [];
}

/**
 * Create a new token for a user
 * @param options - Token options including name, note, and expiration
 * @param username - Optional username to use instead of the current user
 * @returns Promise that resolves with the new token information
 */
export async function createUserToken(
  options: {
    name?: string;
    note?: string;
    expires_in?: string | number;
    scopes?: string[];
  },
  username?: string,
): Promise<ApiToken> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.post<ApiToken>(
    `/users/${resolvedUsername}/tokens`,
    options,
  );

  return response.data;
}

/**
 * Delete a user token
 * @param tokenId - ID of the token to delete
 * @param username - Optional username to use instead of the current user
 */
export async function deleteUserToken(
  tokenId: string,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  await jupyterHubClient.delete(`/users/${resolvedUsername}/tokens/${tokenId}`);
}

/**
 * Get recent notebooks for a user, sorted by last activity or creation date
 * @param limit - Maximum number of notebooks to return
 * @param username - Optional username to use instead of the current user
 * @returns Promise that resolves with recent notebooks
 */
export async function getRecentNotebooks(
  limit: number = 3,
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
  const allServers: Record<string, ServerStatus> = {};

  // Include all servers (including unnamed default server)
  if (data.servers) {
    // First, prepare all servers with their names
    Object.entries(data.servers).forEach(([name, server]) => {
      allServers[name || "Default"] = {
        ...server,
        name: name || "Default",
      };
    });
  }

  // Sort servers by activity: running first, then by last_activity date, then by any available date
  const sortedServers = Object.entries(allServers).sort((a, b) => {
    const [nameA, serverA] = a;
    const [nameB, serverB] = b;

    // Running servers come first
    if (serverA.ready && !serverB.ready) return -1;
    if (!serverA.ready && serverB.ready) return 1;

    // Then sort by last_activity (most recent first)
    const lastActivityA = serverA.last_activity
      ? new Date(serverA.last_activity).getTime()
      : 0;
    const lastActivityB = serverB.last_activity
      ? new Date(serverB.last_activity).getTime()
      : 0;

    if (lastActivityA && lastActivityB) {
      return lastActivityB - lastActivityA;
    }

    // If no last_activity, use started date
    const startedA = serverA.started ? new Date(serverA.started).getTime() : 0;
    const startedB = serverB.started ? new Date(serverB.started).getTime() : 0;

    if (startedA && startedB) {
      return startedB - startedA;
    }

    // If still tied, use name as fallback
    return nameA.localeCompare(nameB);
  });

  // Convert back to record and limit results
  const limitedServers: Record<string, ServerStatus> = {};

  sortedServers.slice(0, limit).forEach(([name, server]) => {
    limitedServers[name] = server;
  });

  return limitedServers;
}

export function transformOptionsToServerFormat(options: {
  image: string; // Single image property instead of multiple image properties
  sshCheck?: boolean;
  phselection: string;
  phname?: string;
  phCheck?: boolean;
  projectCheck?: boolean;
  storageCheck?: boolean;
  home?: string;
  locationStorageCheck?: boolean;
  s3check?: boolean;
  s3selection?: string;
  s3name?: string;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  cpuselection: string;
  memselection: string;
  gpuselection: string;
  migamount?: string;
}): JupyterHubServerOptions {
  const serverOptions: JupyterHubServerOptions = {
    // Default values
    container_image: options.image, // Use image property directly
    ssh: false,
    phome: "remain",
    mountprojects: false,
    home: null,
    cpu: options.cpuselection,
    mem: options.memselection,
    gpu: options.gpuselection,
    shmsize: options.memselection, // Set shmsize equal to memory
  };

  // Check if this is a custom image (not from our standard cerit.io hub images)
  if (options.image && !options.image.startsWith("cerit.io/hubs/")) {
    serverOptions.custom = true;
  }

  // SSH access
  serverOptions.ssh = !!options.sshCheck;

  // Persistent home
  if (options.phselection === "new") {
    serverOptions.phome = options.phCheck ? "delete" : "remain";
  } else if (options.phselection === "existing" && options.phname) {
    serverOptions.phome = options.phname;
  }

  // Project mounting
  serverOptions.mountprojects = !!options.projectCheck;

  // MetaCentrum storage
  if (options.storageCheck && options.home) {
    serverOptions.home = options.home;
    serverOptions.mounttostorage = !!options.locationStorageCheck;
  }

  // S3 configuration
  if (options.s3check) {
    if (options.s3selection === "new") {
      if (options.s3url) serverOptions.s3url = options.s3url;
      if (options.s3bucket) serverOptions.s3bucket = options.s3bucket;
      if (options.s3accesskey) serverOptions.s3accesskey = options.s3accesskey;
      if (options.s3secretkey) serverOptions.s3secretkey = options.s3secretkey;
    } else if (options.s3selection === "existing" && options.s3name) {
      serverOptions.s3existing = options.s3name;
    }
  }

  // GPU MIG amount
  if (options.gpuselection.startsWith("mig") && options.migamount) {
    serverOptions.migamount = options.migamount;
  }

  return serverOptions;
}
