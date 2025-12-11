export type NormalizedSpawnEvent = {
  message: string;
  progress?: number;
  ready?: boolean;
  failed?: boolean;
  url?: string | null;
  html_message?: string | null;
  raw?: unknown;
};

export type Effect =
  | { type: "stopServer"; reason?: string }
  | { type: "navigateOptions"; error?: string }
  | { type: "setStatus"; status: "waiting" | "info" | "error"; message?: string }
  | { type: "toast"; title: string; description?: string; variant?: "default" | "destructive" };

export type EventRule = {
  id: string;
  when: (e: NormalizedSpawnEvent) => boolean;
  effects: Effect[];
  stopPropagation?: boolean;
};

export type UiStatus = {
  status: "idle" | "waiting" | "info" | "error";
  message?: string;
};

export type ReactionContext = {
  serverName: string;
  username?: string | null;
  stopServer: (name: string, username?: string | null) => Promise<void>;
  navigateToOptions: (opts: { error?: string }) => void;
  setUiStatus: (s: UiStatus) => void;
  toast?: (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
};
