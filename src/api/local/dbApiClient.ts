import axios from "axios";

const dbApiClient = axios.create({
  baseURL: `/api/db`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export { dbApiClient };
