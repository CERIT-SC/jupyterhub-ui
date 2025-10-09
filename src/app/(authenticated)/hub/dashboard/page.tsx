"use client";

import { CheckCircle, LayoutDashboard, Loader2, Plus, Server } from "lucide-react";
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
    const runningServers = serverEntries.filter(([, s]) => s.ready).length;
    const startingServers = serverEntries.filter(([, s]) => s.pending === "spawn").length;
    const stoppingServers = serverEntries.filter(([, s]) => s.pending === "stop").length;
    const stoppedServers = totalServers - runningServers - startingServers - stoppingServers;

    return {
      totalServers,
      runningServers,
      startingServers,
      stoppingServers,
      stoppedServers,
      servers,
      serverEntries,
    };
  }, [namedNotebooks]);

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notebook Stats</CardTitle>
          </CardHeader>
          <CardContent className={"flex justify-center"}>
            <div className={"flex gap-4"}>
              <div className={"text-6xl"}>
                {notebookStats.totalServers}/{hubConfig.max_notebooks_per_user}
              </div>
              <div>
                <div>
                  running:{" "}
                  {notebookStats.runningServers + notebookStats.stoppingServers + notebookStats.startingServers}
                </div>
                <div>
                  stopped:{""}
                  {notebookStats.stoppedServers}
                </div>
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-2">
              <Link className="w-full" href="/hub/spawn">
                <Button className="w-full" size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New Server
                </Button>
              </Link>
              <Link className="w-full" href="/hub/tokens">
                <Button className="w-full" size="sm" variant="outline">
                  <Server className="mr-2 h-4 w-4" />
                  Manage Tokens
                </Button>
              </Link>
              <Link className="w-full" href="/hub/notebooks">
                <Button className="w-full" size="sm" variant="outline">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  All Notebooks
                </Button>
              </Link>
              <Button className="w-full" size="sm" variant="outline" onClick={handleRefresh}>
                <Loader2 className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notebooks</CardTitle>
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
