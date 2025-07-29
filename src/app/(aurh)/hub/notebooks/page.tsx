"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus, Search, Server, User } from "lucide-react";

import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { ServerStatus as StatusIndicator } from "@/components/notebook/server-status";
import { NotebooksGrid } from "@/components/notebook/notebooks-grid";
import { Loading, LoadingOverlay } from "@/components/ui/loading";
import {
  getUserInfo,
  getUserNamedNotebooks,
  ServerStatus,
  UserInfo,
  startServer,
  stopServer,
  formatTimeAgo,
} from "@/services/jupyterHub";

export default function NotebooksPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

  // Get username from auth context
  const username = authContext?.user?.name;

  // Fetch user servers data including stopped servers
  const {
    data: servers,
    isLoading,
    error,
    refetch,
  } = useQuery<Record<string, ServerStatus>>({
    queryKey: ["user-notebooks", username],
    queryFn: () => getUserNamedNotebooks(username),
  });

  console.log(servers);
  // We no longer need to map servers to notebooks as our components now accept ServerStatus directly

  // We use formatTimeAgo from the jupyterHub service

  // Filter notebooks based on selected tab and search query
  const filteredNotebooks = servers
    ? Object.entries(servers).reduce(
        (filtered, [name, server]) => {
          // Filter by tab
          let include = true;

          if (selectedTab === "running") {
            include = server.ready || server.pending === "spawn";
          } else if (selectedTab === "stopped") {
            include = server.pending === "stop";
          }

          // Filter by search query
          if (
            include &&
            name.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            filtered[name] = server;
          }

          return filtered;
        },
        {} as Record<string, ServerStatus>,
      )
    : {};

  // Handler for starting a notebook
  const handleStartNotebook = async (id: string) => {
    try {
      setActionInProgress(true);
      await startServer(id, undefined, username);
      router.push(`/hub/spawn/progress/${id}`);
    } catch (error) {
      console.error("Failed to start notebook:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Handler for stopping a notebook
  const handleStopNotebook = async (id: string) => {
    try {
      setActionInProgress(true);
      await stopServer(id, username);
      // Refresh after a short delay to get updated status
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      console.error("Failed to stop notebook:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Handler for opening notebook settings
  const handleOpenSettings = (id: string) => {
    router.push(`/hub/notebooks/${id}/settings`);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-600">
                Error Loading Notebooks
              </h2>
              <p className="text-gray-600">
                {error instanceof Error
                  ? error.message
                  : "Failed to load notebooks. Please try again."}
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {actionInProgress && <LoadingOverlay text="Processing request..." />}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <PageHeader
            description="Manage your Jupyter notebooks"
            title="My Notebooks"
          />
          <StatusIndicator
            message={servers ? "Connected to JupyterHub" : "Disconnected"}
            status={servers ? "active" : "error"}
          />
        </div>

        <div className="flex justify-between gap-6 items-center">
          <Tabs
            defaultValue="all"
            value={selectedTab}
            onValueChange={setSelectedTab}
          >
            <TabsList>
              <TabsTrigger value="all">All Notebooks</TabsTrigger>
              <TabsTrigger value="running">Running</TabsTrigger>
              <TabsTrigger value="stopped">Stopped</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-8 "
              placeholder="Search notebooks..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
            <Link href="/hub/spawn/options">
                <Button asChild>

                <Plus className="mr-2 h-4 w-4" />
                New Notebook

                </Button>
            </Link>
        </div>

        {Object.keys(filteredNotebooks).length > 0 ? (
          <NotebooksGrid
            notebooks={filteredNotebooks}
            onSettings={handleOpenSettings}
            onStart={handleStartNotebook}
            onStop={handleStopNotebook}
          />
        ) : (
          <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">
              {servers && Object.keys(servers).length > 0
                ? "No notebooks found matching the selected filter."
                : "You don't have any notebooks yet. Click 'New Notebook' to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
