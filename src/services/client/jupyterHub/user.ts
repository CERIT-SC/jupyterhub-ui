// User-related JupyterHub functions and types

import { getUsernameOrDefault } from "./utils";
import { UserInfo } from "./types";

import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { User } from "@/services/client/jupyterHub/generated_models";

export async function getUserInfo(username?: string): Promise<UserInfo> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<UserInfo>(
    `/users/${resolvedUsername}`,
  );

  return response.data;
}

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

export async function getUserTokens(username?: string): Promise<ApiToken[]> {
  const resolvedUsername = getUsernameOrDefault(username);
  const response = await jupyterHubClient.get<{ api_tokens: ApiToken[] }>(
    `/users/${resolvedUsername}/tokens`,
  );

  return response.data.api_tokens || [];
}

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

export async function deleteUserToken(
  tokenId: string,
  username?: string,
): Promise<void> {
  const resolvedUsername = getUsernameOrDefault(username);

  await jupyterHubClient.delete(`/users/${resolvedUsername}/tokens/${tokenId}`);
}

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
