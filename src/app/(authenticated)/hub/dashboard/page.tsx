"use client";

import {
  CheckCircle,
  LayoutDashboard,
  Loader2,
  Plus,
  Server,
  Rocket,
  Play,
  StopCircle,
  RefreshCw,
  ChevronRight, // added
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { QuickPresetCard } from "@/components/hub/presetCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hubConfig } from "@/config/hub";
import { quickstartServerPresets } from "@/config/quickpresets";
import { NotebookCard } from "@/components/hub/notebook-card";
import { useNotebooks } from "@/features/notebooks/api/get-notebooks";
import { useAuth } from "@/hooks/useAuth";
import {
  startServer,
  stopServer,
  deleteServer,
} from "@/services/client/jupyterHub";
import type { ServerStatus } from "@/services/client/jupyterHub/types";
import { minimalJupyterHubServerOptions } from "@/config/hub";
// Add dialog/input components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServerNameInput } from "@/components/hub/ServerNameInput";

export default function HubDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const username = user?.name;

  const [refreshing, setRefreshing] = useState(false);
  const [hasTransitioning, setHasTransitioning] = useState(false);

  // Recent notebooks data with dynamic refetch during transitions
  const { data: namedNotebooks, refetch } = useNotebooks({
    queryConfig: {
      refetchInterval: hasTransitioning ? 1000 : 5000,
      refetchIntervalInBackground: hasTransitioning,
    },
  });

  // Track if any server is transitioning to speed up polling
  useEffect(() => {
    if (namedNotebooks) {
      const transitioning = Object.values(namedNotebooks).some(
        (s) => s.pending === "spawn" || s.pending === "stop",
      );
      setHasTransitioning(transitioning);
    }
  }, [namedNotebooks]);

  // Build 3 most recent; stopped last, newest first
  const recentNotebooks = useMemo(() => {
    if (!namedNotebooks) return [] as { name: string; server: ServerStatus }[];

    const recency = (s: ServerStatus) => {
      const t =
        (s.last_activity ? Date.parse(s.last_activity) : undefined) ??
        (s.started ? Date.parse(s.started) : undefined) ??
        0;
      return Number.isFinite(t) ? t : 0;
    };

    return Object.entries(namedNotebooks)
      .map(([name, server]) => ({ name, server }))
      .sort((a, b) => {
        const ra = a.server.stopped ? 1 : 0;
        const rb = b.server.stopped ? 1 : 0;
        if (ra !== rb) return ra - rb; // stopped last
        return recency(b.server) - recency(a.server); // newest first
      })
      .slice(0, 3);
  }, [namedNotebooks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Handlers (same semantics as hub/notebooks)
  const handleStartNotebook = useCallback(
    async (id: string) => {
      try {
        if (namedNotebooks && namedNotebooks[id]) {
          // Preemptive: speed up polling during transition
          setHasTransitioning(true);
        }
        await startServer(
          id,
          namedNotebooks?.[id].user_options || minimalJupyterHubServerOptions,
          username,
        );
      } catch (error) {
        console.error("Failed to start notebook:", error);
        await refetch();
      }
    },
    [refetch, namedNotebooks, username],
  );

  const handleStopNotebook = useCallback(
    async (id: string) => {
      try {
        if (namedNotebooks && namedNotebooks[id]) {
          // Preemptive: speed up polling during transition
          setHasTransitioning(true);
        }
        await stopServer(id, username);
      } catch (error) {
        console.error("Failed to stop notebook:", error);
        await refetch();
      }
    },
    [refetch, namedNotebooks, username],
  );

  const handleOpenSettings = useCallback(
    (id: string) => {
      router.push(`/hub/notebooks/${id}/settings`);
    },
    [router],
  );

  const handleRemoveNotebook = useCallback(
    async (id: string) => {
      try {
        await deleteServer(id, username);
        await refetch();
      } catch (error) {
        console.error("Failed to remove notebook:", error);
      }
    },
    [refetch, username],
  );

  const notebookStats = useMemo(() => {
    const servers = namedNotebooks || {};
    const serverEntries = Object.entries(servers);
    const totalServers = serverEntries.length;

    // Count starting/stopping as running
    const runningServers = serverEntries.filter(
      ([, s]) => s.ready || s.pending === "spawn" || s.pending === "stop",
    ).length;

    const stoppedServers = totalServers - runningServers;

    return {
      totalServers,
      runningServers,
      stoppedServers,
      servers,
      serverEntries,
    };
  }, [namedNotebooks]);

  // Add a usage helper for clarity
  const usage = useMemo(() => {
    const used = notebookStats.totalServers;
    const max = hubConfig.max_notebooks_per_user;
    const pct = Math.max(0, Math.min(100, Math.round((used / Math.max(1, max)) * 100)));
    const remaining = Math.max(0, max - used);
    const atLimit = used >= max;
    return { used, max, pct, remaining, atLimit };
  }, [notebookStats.totalServers]);

  // Dialog state for "Launch minimal"
  const [showMinimalDialog, setShowMinimalDialog] = useState(false);
  const [minimalName, setMinimalName] = useState("");

  // Helper: generate a unique minimal name like notebook-1, notebook-2, ...
  const generateUniqueName = useCallback(() => {
    const base = "notebook";
    const existing = new Set(Object.keys(namedNotebooks || {}));
    let i = 1;
    while (existing.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
  }, [namedNotebooks]);

  // Open dialog
  const handleOpenMinimalDialog = useCallback(() => {
    if (usage.atLimit) return;
    setMinimalName(generateUniqueName());
    setShowMinimalDialog(true);
  }, [usage.atLimit, generateUniqueName]);

  // Confirm launch
  const handleConfirmLaunchMinimal = useCallback(async () => {
    if (!username || usage.atLimit) return;
    const name = (minimalName || "").trim();
    if (!name) return;

    try {
      setHasTransitioning(true);
      await startServer(name, minimalJupyterHubServerOptions, username);
      setShowMinimalDialog(false);
      router.push(`/hub/spawn/progress/${encodeURIComponent(name)}`);
    } catch (err) {
      console.error("Failed to launch minimal notebook:", err);
      await refetch();
    }
  }, [username, usage.atLimit, minimalName, router, refetch, setHasTransitioning]);

  const handleResumeLast = useCallback(async () => {
    if (!username || !namedNotebooks) return;
    // pick most recent by last_activity/started
    const entries = Object.entries(namedNotebooks);
    if (entries.length === 0) return;

    const ts = (s: ServerStatus) =>
      (s.last_activity ? Date.parse(s.last_activity) : undefined) ??
      (s.started ? Date.parse(s.started) : undefined) ??
      0;

    const [name, server] =
      entries.sort((a, b) => ts(b[1]) - ts(a[1]))[0];

    try {
      if (server.ready && server.url) {
        // open the running notebook
        window.location.href = `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/${server.url}`;
        return;
      }
      // start with previous options if available, else minimal
      setHasTransitioning(true);
      await startServer(name, server.user_options || minimalJupyterHubServerOptions, username);
      router.push(`/hub/spawn/progress/${encodeURIComponent(name)}`);
    } catch (err) {
      console.error("Failed to resume notebook:", err);
      await refetch();
    }
  }, [username, namedNotebooks, router, refetch]);

  const handleStopAll = useCallback(async () => {
    if (!username || !namedNotebooks) return;
    try {
      setHasTransitioning(true);
      const running = Object.entries(namedNotebooks)
        .filter(([, s]) => s.ready || s.pending === "spawn" || s.pending === "stop")
        .map(([id]) => id);

      await Promise.all(
        running.map(async (id) => {
          try {
            await stopServer(id, username);
          } catch (e) {
            console.error(`Failed to stop ${id}:`, e);
          }
        }),
      );
      await refetch();
    } finally {
      // polling already sped up by hasTransitioning
    }
  }, [username, namedNotebooks, refetch]);

  // Add count of extra notebooks (beyond the 3 shown)
  const extraNotebooksCount = Math.max(0, notebookStats.totalServers - 3);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">JupyterHub Dashboard</h1>
          <p className="text-muted-foreground">Manage your notebook servers</p>
        </div>
        <Link href="/hub/spawn">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Server
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notebooks</CardTitle>
            <CardDescription>
              Limit: {usage.max} per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-4xl font-semibold">{usage.used} of {usage.max}</div>
              <div className={`text-sm ${usage.atLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {usage.atLimit ? "Limit reached" : `${usage.remaining} remaining`}
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-muted-foreground">Running / Stopped</div>
              <div>
                {notebookStats.runningServers} / {notebookStats.stoppedServers}
              </div>
            </div>

            {usage.atLimit && (
              <div className="mt-3 text-sm text-destructive">
                You’ve reached your notebook limit. Remove an existing notebook to create a new one.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-center justify-center">
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-6 w-6" />
                <span className="font-medium">All systems normal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                variant={"outline"}
                onClick={handleOpenMinimalDialog}
                disabled={usage.atLimit}
                title={usage.atLimit ? "Limit reached" : "Launch a minimal notebook"}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Launch minimal
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleResumeLast}
                disabled={!namedNotebooks || Object.keys(namedNotebooks).length === 0}
                title="Open if running, otherwise start your most recent notebook"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume last
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleStopAll}
                disabled={
                  !namedNotebooks ||
                  Object.values(namedNotebooks).every(
                    (s) => !s.ready && s.pending !== "spawn" && s.pending !== "stop",
                  )
                }
                title="Stop all running notebooks"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop all
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minimal launch dialog */}
      <Dialog open={showMinimalDialog} onOpenChange={setShowMinimalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch minimal notebook</DialogTitle>
            <DialogDescription>
              Start a lightweight server with default resources. Choose a unique name.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <ServerNameInput
                value={minimalName}
                onChangeNameAction={setMinimalName}
              />
          
            {usage.atLimit && (
              <p className="text-sm text-destructive">You’ve reached your notebook limit.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMinimalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLaunchMinimal}
              disabled={usage.atLimit || !minimalName.trim() || !username}
            >
              Launch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Notebooks</CardTitle>
          <Button
            variant={"ghost"}
            onClick={() => router.push("/hub/notebooks")}
            className="relative"
            aria-label={
              extraNotebooksCount > 0
                ? `View all notebooks (${extraNotebooksCount} more)`
                : "View all notebooks"
            }
            title={
              extraNotebooksCount > 0
                ? `${extraNotebooksCount} more notebooks`
                : "View all notebooks"
            }
          >
            <ChevronRight className="h-5 w-5" />
            {extraNotebooksCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                +{extraNotebooksCount}
              </span>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {recentNotebooks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent notebooks.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {recentNotebooks.map(({ name, server }) => (
                <NotebookCard
                  key={name}
                  name={name}
                  server={server}
                  onStart={() => handleStartNotebook(name)}
                  onStop={() => handleStopNotebook(name)}
                  onRemove={() => handleRemoveNotebook(name)}
                  onSettings={() => handleOpenSettings(name)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Templates</CardTitle>
          <CardDescription>Start with a pre-configured environment</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickstartServerPresets.slice(0, 3).map((preset) => (
            <QuickPresetCard key={preset.id} preset={preset} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
