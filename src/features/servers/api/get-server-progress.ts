import { useEffect, useRef, useState } from "react";
import { getUsernameOrDefault, ServerProgress } from "@/services/client/jupyterHub";

type Options = {
  serverName: string;
  username?: string;
  autoStart?: boolean; // default true
};

type Result = {
  data?: ServerProgress;
  isFetched: boolean;        // saw at least one event
  isError: boolean;
  error?: Error;
  isStreaming: boolean;      // connection open
  start: () => void;
  stop: () => void;
};

export function useServerProgress({ serverName, username, autoStart = true }: Options): Result {
  const esRef = useRef<EventSource | null>(null);
  const [data, setData] = useState<ServerProgress | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const start = () => {
    if (!serverName || esRef.current) return;

    const resolvedUser = getUsernameOrDefault(username);
    const url = `/api/hub/users/${encodeURIComponent(resolvedUser)}/servers/${encodeURIComponent(
      serverName,
    )}/progress`;

    const es = new EventSource(url); // cookies flow to /api/hub
    esRef.current = es;

    es.onopen = () => {
      setIsStreaming(true);
      setError(undefined);
    };

    es.onmessage = (e) => {
      try {
        // JupyterHub sends JSON in data:
        const payload: ServerProgress = JSON.parse(e.data);
        setData(payload);
        setIsFetched(true);

        // Stop when progress hits 100 (done)
        if (typeof payload.progress === "number" && payload.progress >= 100) {
          // Let the page decide how to reflect ready/failed; we just stop streaming.
          stop();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to parse SSE message"));
      }
    };

    es.onerror = () => {
      // Connection failed or closed by server
      setIsStreaming(false);
      // If we never received anything, mark as error; otherwise, treat as normal close.
      if (!isFetched && !error) {
        setError(new Error("Event stream connection error"));
      }
      stop();
    };
  };

  const stop = () => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    if (autoStart) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverName, username]);

  return {
    data,
    isFetched,
    isError: !!error,
    error,
    isStreaming,
    start,
    stop,
  };
}
