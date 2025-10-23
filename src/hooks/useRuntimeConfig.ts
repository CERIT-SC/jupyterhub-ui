"use client";

import { useEffect, useState } from "react";

export type RuntimeConfig = { jupyterhubUrl: string; hubOrigin: string };

export function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);

  useEffect(() => {
    let aborted = false;
    fetch("/api/runtime-config", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!aborted) setConfig(data);
      })
      .catch(() => {
        if (!aborted) setConfig(null);
      });
    return () => {
      aborted = true;
    };
  }, []);

  return config;
}