import type { EventRule, NormalizedSpawnEvent } from "./types";

// Helper
const msg = (e: NormalizedSpawnEvent) => (e.message || e.html_message || "").toLowerCase();

export const defaultSpawnRules: EventRule[] = [
  {
    id: "ready-finished",
    when: (e) => !!e.ready && !e.failed,
    effects: [{ type: "setStatus", status: "info", message: "Server is ready." }],
    stopPropagation: true,
  },
  {
    id: "generic-failure",
    when: (e) => !!e.failed,
    effects: [
      { type: "setStatus", status: "error", message: "Failed to start notebook." },
      { type: "stopServer", reason: "spawn-failed" },
      { type: "navigateOptions", error: "Spawn failed. Please review options and try again." },
    ],
    stopPropagation: true,
  },
  {
    id: "image-pull-backoff",
    when: (e) => /image.*(pull|not found|back[- ]?off)/i.test(msg(e)),
    effects: [
      { type: "setStatus", status: "error", message: "Image pull failed." },
      { type: "stopServer", reason: "image-pull" },
      { type: "navigateOptions", error: "Failed to pull image. Choose a different image or check registry access." },
    ],
    stopPropagation: true,
  },
  {
    id: "quota-exceeded",
    when: (e) => /(quota|limit).*(exceed|exceeded|exhaust)/i.test(msg(e)) || /PersistentVolume.*exceeded/i.test(msg(e)),
    effects: [
      { type: "setStatus", status: "error", message: "Quota exceeded." },
      { type: "stopServer" },
      { type: "navigateOptions", error: "Cluster quota exceeded. Reduce requested resources or try later." },
    ],
    stopPropagation: true,
  },
  {
    id: "unschedulable",
    when: (e) =>
      /(unschedulable|insufficient|0\/\d+ nodes|didn't match pod anti-affinity|node(s)? had)/i.test(msg(e)) ||
      /waiting for resources/i.test(msg(e)),
    effects: [
      {
        type: "setStatus",
        status: "waiting",
        message: "Waiting for cluster resources to become available...",
      },
    ],
  },
  {
    id: "invalid-options",
    when: (e) =>
      /(invalid|unknown|unsupported).*(option|image|gpu|size|value)/i.test(msg(e)) ||
      /validation.*failed/i.test(msg(e)),
    effects: [
      { type: "setStatus", status: "error", message: "Invalid options." },
      {
        type: "navigateOptions",
        error: "Invalid server options. Please correct settings and try again.",
      },
    ],
    stopPropagation: true,
  },
  {
    id: "network-transient",
    when: (e) => /(timeout|timed out|temporary failure|dns|connection refused)/i.test(msg(e)),
    effects: [
      {
        type: "setStatus",
        status: "waiting",
        message: "Network issue detected. Retrying automatically...",
      },
    ],
  },
];
