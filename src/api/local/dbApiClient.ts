import axios from "axios";

const dbApiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/db`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export { dbApiClient };
