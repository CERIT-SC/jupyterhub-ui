import axios from "axios";

// Create an Axios instance with the JupyterHub API base URL
const jupyterHubClient = axios.create({
  baseURL: "/api/hub", // This will be proxied through Next.js
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const expiredLogin = () => {
  window.location.href = "/login?sessionExpired=jupyterhub";
};

// Add response interceptor for error handling
jupyterHubClient.interceptors.response.use(
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

export { jupyterHubClient };
