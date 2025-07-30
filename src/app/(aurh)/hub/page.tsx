"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Server,
  Play,
  Square,
  Trash2,
  LayoutDashboard,
  Gauge,
  Rocket,
  CheckCircle,
  MoreHorizontal,
  ArrowRight,
  Clock,
  ExternalLink,
  Settings,
  Info,
} from "lucide-react";

import {
  getUserInfo,
  stopServer,
  formatTimeAgo,
  getRecentNotebooks,
  getUserNamedNotebooks,
} from "@/services/jupyterHub";
import { jupyterHubClient } from "@/api/jupyterhub/axios-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { ServerList } from "@/components/notebook/server-list";
import { RecentNotebooks } from "@/components/notebook/recent-notebooks";
import { NotebookDetailsDialog } from "@/components/notebook/notebook-details-dialog";
import { useAuth } from "@/hooks/useAuth";

interface NotebookServer {
  name: string;
  url: string;
  ready: boolean;
  pending: "spawn" | "stop" | null;
  last_activity: string;
}

interface ServerStatus {
  servers: Record<string, NotebookServer>;
  pending: Record<string, "spawn" | "stop">;
}

export default function HubDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  // Check if any notebooks are in transition states
  const hasTransitioningNotebooks = (notebookData: any) => {
    if (!notebookData) return false;

    return Object.values(notebookData).some(
      (server: any) => server.pending === "spawn" || server.pending === "stop",
    );
  };

  const {
    data: namedNotebooks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-notebooks"],
    queryFn: () => getUserNamedNotebooks(user?.name),
    // Dynamic refetch interval - 1 second when notebooks are transitioning, 5 seconds otherwise
    refetchInterval: hasTransitioning ? 1000 : 5000,
    // Continue refetching while page is not in focus
    refetchIntervalInBackground: true,
  });

  const handleStopServer = async (serverName: string) => {
    try {
      // Preemptively update local state to show stopping status
      if (namedNotebooks && namedNotebooks[serverName]) {
        // Manually update the pending state
        namedNotebooks[serverName].pending = "stop";
        namedNotebooks[serverName].ready = false;

        // Set transition state manually to increase polling frequency
        setHasTransitioning(true);
      }

      // Make the actual API call
      await jupyterHubClient.delete(`/users/me/servers/${serverName}`);

      // No need for explicit refetch, as the dynamic interval will handle it
    } catch (error) {
      console.error("Failed to stop server:", error);
      // Force a refetch to get the accurate state in case of error
      refetch();
    }
  };

  // Check for transitioning notebooks whenever data changes
  useEffect(() => {
    if (namedNotebooks) {
      const transitioning = Object.values(namedNotebooks).some(
        (server) => server.pending === "spawn" || server.pending === "stop",
      );

      setHasTransitioning(transitioning);
    }
  }, [namedNotebooks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Use the loaded data to calculate stats
  const servers = namedNotebooks || {};
  const serverEntries = Object.entries(servers);

  // Calculate stats
  const totalServers = serverEntries.length;
  const runningServers = serverEntries.filter(([_, s]) => s.ready).length;
  const startingServers = serverEntries.filter(
    ([_, s]) => s.pending === "spawn",
  ).length;
  const stoppingServers = serverEntries.filter(
    ([_, s]) => s.pending === "stop",
  ).length;
  const stoppedServers =
    totalServers - runningServers - startingServers - stoppingServers;

  return (
    <div className="container mx-auto p-6 space-y-6">
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
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <span className="text-sm">Running:</span>
                <span className="ml-auto font-bold">{runningServers}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                <span className="text-sm">Starting:</span>
                <span className="ml-auto font-bold">{startingServers}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
                <span className="text-sm">Stopping:</span>
                <span className="ml-auto font-bold">{stoppingServers}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-300 mr-2" />
                <span className="text-sm">Stopped:</span>
                <span className="ml-auto font-bold">{stoppedServers}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <span className="text-sm">Total Notebooks:</span>
                <span className="ml-auto font-bold">{totalServers}</span>
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
          <CardTitle>Popular Templates</CardTitle>
          <CardDescription>
            Start with a pre-configured environment
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Data Science</h3>
                <Rocket className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Python, Pandas, NumPy, scikit-learn
              </p>
              <Button className="w-full" size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" /> Launch
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Deep Learning</h3>
                <Gauge className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                TensorFlow, PyTorch, Keras, GPU
              </p>
              <Button className="w-full" size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" /> Launch
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Minimal</h3>
                <MoreHorizontal className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Basic Python environment with minimal resources
              </p>
              <Button className="w-full" size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" /> Launch
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
