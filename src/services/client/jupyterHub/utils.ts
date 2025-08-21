// Utility functions for JupyterHub client

export function getUsernameOrDefault(username?: string): string {
  if (username) {
    return username;
  }
  if (typeof window !== "undefined") {
    try {
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

  return "me";
}
