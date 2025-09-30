import { queryOptions, useQuery } from "@tanstack/react-query";

import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { useAuth } from "@/hooks/useAuth";
import { QueryConfig } from "@/lib/react-query";
import { UserInfo, getUsernameOrDefault } from "@/services/client/jupyterHub";

export const getNotebooksByUsername = async (userName?: string) => {
  const resolvedUsername = getUsernameOrDefault(userName);
  const { data } = await jupyterHubClient.get<UserInfo>(`/users/${resolvedUsername}`, {
    params: {
      include_stopped_servers: true,
    },
  });

  const namedServersArray = Object.entries(data.servers ?? {}).filter(([name]) => name !== "");

  return Object.fromEntries(namedServersArray);
};

export const getNotebooksQueryOptions = (userName?: string) => {
  return queryOptions({
    queryKey: ["user-notebooks"],
    queryFn: () => getNotebooksByUsername(userName),
  });
};

type UseNotebooksOptions = {
  queryConfig?: QueryConfig<typeof getNotebooksQueryOptions>;
};

export const useNotebooks = ({ queryConfig }: UseNotebooksOptions = {}) => {
  const { user } = useAuth();

  return useQuery({
    ...getNotebooksQueryOptions(user?.name),
    ...queryConfig,
  });
};
