export type RuntimeConfig = {
  jupyterhubUrl: string;
  hubOrigin: string;
  clientId?: string;
};

export function getRuntimeConfig(): RuntimeConfig {
  const jupyterhubUrl = process.env.NEXT_PUBLIC_JUPYTERHUB_URL || "";
  let hubOrigin = "";
  try {
    hubOrigin = jupyterhubUrl ? new URL(jupyterhubUrl).origin : "";
  } catch {
    hubOrigin = "";
  }
  return {
    jupyterhubUrl,
    hubOrigin,
    clientId: process.env.NEXT_PUBLIC_JUPYTERHUB_CLIENT_ID,
  };
}