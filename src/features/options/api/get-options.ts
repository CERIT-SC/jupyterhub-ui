import { jupyterHubClient, jupyterHubApiRootClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { useAuth } from "@/hooks/useAuth";
import { QueryConfig } from "@/lib/react-query";
import { ApiToken, getUsernameOrDefault } from "@/services/client/jupyterHub";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getServerOptions = async (servername: string, username?: string) => {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubApiRootClient.get(`/spawn/${resolvedUsername}/${servername}`);

  return response.data ?? [];
};

export const getServerOptionsQueryOptions = (servername: string, username?: string) =>
  queryOptions({
    queryKey: ["options", servername],
    queryFn: () => getServerOptions(servername, username),
  });

type UseServerOptions = {
  queryConfig?: QueryConfig<typeof getServerOptionsQueryOptions>;
};

export const useServerOptions = ({
  serverName,
  queryConfig,
}: {
  serverName: string;
  queryConfig?: QueryConfig<typeof getServerOptionsQueryOptions>;
}) => {
  const { user } = useAuth();

  return useQuery({
    ...getServerOptionsQueryOptions(serverName, user?.name),
    ...queryConfig,
  });
};
