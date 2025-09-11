import axios from "axios";

// Create an Axios instance with the JupyterHub API base URL
const jupyterHubApiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/hub`, // This will be proxied through Next.js
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const expiredLogin = () => {
  if (typeof window === "undefined") return;
  // Redirect to login page with a session expired message
  window.location.href = "/login?sessionExpired=jupyterhub";
};

// Add response interceptor for error handling
jupyterHubApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response) {
      const { status } = error.response;

      // Handle specific status codes
      if (status === 401) {
        console.error("Unauthorized request to JupyterHub API");
        expiredLogin();
      } else if (status === 403) {
        console.error("Forbidden request to JupyterHub API");
        expiredLogin();
      } else if (status >= 500) {
        console.error("JupyterHub API server error");
      }
    } else if (error.request) {
      console.error("No response received from JupyterHub API");
    } else {
      console.error("Error setting up JupyterHub API request", error.message);
    }

    return Promise.reject(error);
  },
);

export { jupyterHubApiClient as jupyterHubClient };
