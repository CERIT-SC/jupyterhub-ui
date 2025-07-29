import { Log, UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";

const environment =
  process.env.NODE_ENV === "production" ? "production" : "development";

// Set the log level to debug if in development
if (environment === "development") {
  Log.setLogger(console);
  Log.setLevel(Log.DEBUG);
}

// Set the oidc configuration based on the environment
const oidcConfig: UserManagerSettings = {
  client_secret:
    environment === "production"
      ? process.env.NEXT_PUBLIC_CLIENT_SECRET_PROD || ""
      : process.env.NEXT_PUBLIC_CLIENT_SECRET_LOCAL || "",
  authority:
    environment === "production"
      ? process.env.NEXT_PUBLIC_AUTHORITY_PROD || ""
      : process.env.NEXT_PUBLIC_AUTHORITY_LOCAL || "",
  client_id:
    environment === "production"
      ? process.env.NEXT_PUBLIC_CLIENT_ID_PROD || ""
      : process.env.NEXT_PUBLIC_CLIENT_ID_LOCAL || "",
  redirect_uri:
    environment === "production"
      ? process.env.NEXT_PUBLIC_REDIRECT_URI_PROD || ""
      : process.env.NEXT_PUBLIC_REDIRECT_URI_LOCAL || "",
  metadata: {
    authorization_endpoint:
      environment === "production"
        ? process.env.NEXT_PUBLIC_AUTHORIZATION_ENDPOINT_PROD || ""
        : process.env.NEXT_PUBLIC_AUTHORIZATION_ENDPOINT_LOCAL || "",
    token_endpoint:
      environment === "production"
        ? process.env.NEXT_PUBLIC_TOKEN_ENDPOINT_PROD || ""
        : process.env.NEXT_PUBLIC_TOKEN_ENDPOINT_LOCAL || "",

    end_session_endpoint:
      environment === "production"
        ? process.env.NEXT_PUBLIC_URL_PROD || ""
        : process.env.NEXT_PUBLIC_POST_LOGOUT_LOCAL || "",
    jwks_uri:
      environment === "production"
        ? process.env.NEXT_PUBLIC_JWKS_URI_PROD || ""
        : process.env.NEXT_PUBLIC_JWKS_URI_LOCAL || "",
  },
  automaticSilentRenew: true,
  monitorSession: true,
  silent_redirect_uri:
    typeof window !== "undefined"
      ? `${window.location.origin}/silent-renew`
      : "",
  response_type: "code",
  scope: "openid profile email offline_access",
  userStore:
    typeof window !== "undefined"
      ? new WebStorageStateStore({ store: window.localStorage })
      : undefined,
};

export default oidcConfig;
