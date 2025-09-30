import { queryOptions, useQuery } from "@tanstack/react-query";

import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { useAuth } from "@/hooks/useAuth";
import { QueryConfig } from "@/lib/react-query";
import { ServerProgress, getUsernameOrDefault } from "@/services/client/jupyterHub";

export const getServerProgress = async (serverName: string, username?: string): Promise<ServerProgress> => {
  const resolvedUsername = getUsernameOrDefault(username);
  const { data } = await jupyterHubClient.get<string>(`/users/${resolvedUsername}/servers/${serverName}/progress`);

  try {
    // Extract the JSON data from SSE format (data: {json})
    const [_, jsonMatch] = data.match(/data: ({.*})/) ?? [];

    if (!jsonMatch) {
      throw new Error("Invalid SSE response format");
    }

    return JSON.parse(jsonMatch) as ServerProgress;
  } catch (error) {
    console.error("Error parsing progress response:", error);
    throw new Error("Failed to parse server progress response");
  }
};

export const getServerProgressOptions = (serverName: string, username?: string) => {
  return queryOptions({
    queryKey: ["server", serverName],
    queryFn: () => getServerProgress(serverName, username),
  });
};

type UseServerProgressOptions = {
  serverName: string;
  userName?: string;
  queryConfig?: QueryConfig<typeof getServerProgressOptions>;
};

export const useServerProgress = ({ serverName, userName, queryConfig }: UseServerProgressOptions) => {
  const { user } = useAuth();

  return useQuery({
    ...getServerProgressOptions(serverName, userName ?? user?.name),
    ...queryConfig,
  });
};
