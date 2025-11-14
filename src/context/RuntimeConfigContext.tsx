
import React, { createContext, useContext } from "react";
import type { RuntimeConfig } from "@/lib/runtime-config";

const Ctx = createContext<RuntimeConfig | null>(null);

export function useRuntimeConfig() {
  return useContext(Ctx);
}

export function ClientRuntimeConfigProvider({
  value,
  children,
}: {
  value: RuntimeConfig;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}