"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  CheckCircle,
  LayoutDashboard,
  Loader2,
  Plus,
  Server,
} from "lucide-react";

import { getUserInfo, getUserNamedNotebooks } from "@/services/jupyterHub";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { quickstartServerPresets } from "@/config/quickpresets";
import { QuickPresetCard } from "@/components/hub/presetCards";
import { hubConfig } from "@/config/hub";

export default function HubDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const { data: namedNotebooks, refetch } = useQuery({
    queryKey: ["user-notebooks"],
    queryFn: () => getUserNamedNotebooks(user?.name),
  });

  const notebookStats = useMemo(() => {
    const servers = namedNotebooks || {};
    const serverEntries = Object.entries(servers);
    const totalServers = serverEntries.length;
    const runningServers = serverEntries.filter(([, s]) => s.ready).length;
    const startingServers = serverEntries.filter(
      ([, s]) => s.pending === "spawn",
    ).length;
    const stoppingServers = serverEntries.filter(
      ([, s]) => s.pending === "stop",
    ).length;
    const stoppedServers =
      totalServers - runningServers - startingServers - stoppingServers;

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">JupyterHub Dashboard</h1>
          <p className="text-muted-foreground">Manage your notebook servers</p>
        </div>
        <Link href="/hub/spawn">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Server
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  {notebookStats.runningServers +
                    notebookStats.stoppingServers +
                    notebookStats.startingServers}
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
            <div className="flex items-center justify-center h-24">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
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
                  <Plus className="h-4 w-4 mr-2" />
                  New Server
                </Button>
              </Link>
              <Link className="w-full" href="/hub/tokens">
                <Button className="w-full" size="sm" variant="outline">
                  <Server className="h-4 w-4 mr-2" />
                  Manage Tokens
                </Button>
              </Link>
              <Link className="w-full" href="/hub/notebooks">
                <Button className="w-full" size="sm" variant="outline">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  All Notebooks
                </Button>
              </Link>
              <Button
                className="w-full"
                size="sm"
                variant="outline"
                onClick={handleRefresh}
              >
                <Loader2
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Api</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              getUserInfo(user?.name);
            }}
          >
            User info print
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Notebooks</CardTitle>
        </CardHeader>
        <CardContent />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Templates</CardTitle>
          <CardDescription>
            Start with a pre-configured environment
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickstartServerPresets.slice(0, 3).map((preset) => (
            <QuickPresetCard key={preset.id} preset={preset} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
