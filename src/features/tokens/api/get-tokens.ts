import { queryOptions, useQuery } from "@tanstack/react-query";

import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { useAuth } from "@/hooks/useAuth";
import { QueryConfig } from "@/lib/react-query";
import { ApiToken, getUsernameOrDefault } from "@/services/client/jupyterHub";

export const getUserTokens = async (username?: string) => {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<{ api_tokens: ApiToken[] }>(`/users/${resolvedUsername}/tokens`);

  return response.data.api_tokens ?? [];
};

export const getTokensOptions = (username?: string) => {
  return queryOptions({
    queryKey: ["tokens"],
    queryFn: () => getUserTokens(username),
  });
};

type UseTokensOptions = {
  queryConfig?: QueryConfig<typeof getTokensOptions>;
};

export const useTokens = ({ queryConfig }: UseTokensOptions = {}) => {
  const { user } = useAuth();

  return useQuery({
    ...getTokensOptions(user?.name),
    ...queryConfig,
  });
};
