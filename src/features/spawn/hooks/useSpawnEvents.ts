import { useEffect, useRef, useState } from "react";
import type { EventRule, NormalizedSpawnEvent, UiStatus } from "../events/types";
import { handleSpawnEvent } from "../events/engine";

type UseSpawnEventsArgs = {
  serverName: string;
  username?: string | null;
  rules: EventRule[];
  ctx: {
    stopServer: (name: string, username?: string | null) => Promise<void>;
    navigateToOptions: (opts: { error?: string }) => void;
    toast?: (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
  };
  eventSource?: EventSource | null; // <-- new: reuse existing EventSource
  progressUrl?: string; // optional fallback if no eventSource provided
};

export function useSpawnEvents({ serverName, username, rules, ctx, eventSource, progressUrl }: UseSpawnEventsArgs) {
  const [events, setEvents] = useState<NormalizedSpawnEvent[]>([]);
  const [uiStatus, setUiStatus] = useState<UiStatus>({ status: "idle" });
  const createdSrcRef = useRef<EventSource | null>(null); // track internally created source

  // Handler shared for both cases
  const handleMessage = async (raw: any) => {
    try {
      const normalized: NormalizedSpawnEvent = {
        message: raw.message || raw.html_message || "",
        progress: raw.progress,
        ready: raw.ready,
        failed: raw.failed,
        url: raw.url ?? null,
        html_message: raw.html_message ?? null,
        raw,
      };
      setEvents((prev) => [...prev, normalized]);

      await handleSpawnEvent(normalized, rules, {
        serverName,
        username,
        setUiStatus,
        stopServer: ctx.stopServer,
        navigateToOptions: ctx.navigateToOptions,
        toast: ctx.toast,
      });
    } catch {
      // ignore malformed event
    }
  };

  // Reuse existing EventSource (preferred path)
  useEffect(() => {
    if (eventSource) {
      const listener = (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data);
          handleMessage(data);
        } catch {
          /* ignore */
        }
      };
      eventSource.addEventListener("message", listener);
      return () => {
        eventSource.removeEventListener("message", listener);
      };
    }
  }, [eventSource, rules, serverName, username, ctx.stopServer, ctx.navigateToOptions, ctx.toast]);

  // Fallback: create our own EventSource only if no external one
  useEffect(() => {
    if (eventSource || !progressUrl) return;
    const src = new EventSource(progressUrl, { withCredentials: true });
    createdSrcRef.current = src;

    src.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        handleMessage(data);
        if (data.ready || data.failed) {
          src.close();
        }
      } catch {
        /* ignore */
      }
    };

    // Optional error handling
    src.onerror = () => {
      // could set waiting/error status if desired
    };

    return () => {
      src.close();
      createdSrcRef.current = null;
    };
  }, [eventSource, progressUrl, rules, serverName, username, ctx.stopServer, ctx.navigateToOptions, ctx.toast]);


  useEffect(() => {
    if (!eventSource && cretedSrcRef.current  && (uiStatus.status == "readuy" || uiStatus.status == "error")) {
        createdSrcRef.current?.close();
        createdSrcRef.current = null;
    }

    setUiStatus((prev) => {
        if (prev.status == uiStatus && prev.message == uiStatus.message) {
            
            for (const ev of events) {
                if (uiStatus.status == ev.ready )
                    return prev;
                if (uiStatus.status == ev.failed )
                    return prev;
            }
        } )

    }, [uiStatus, eventSource]);

  return { events, uiStatus, setUiStatus };
}
