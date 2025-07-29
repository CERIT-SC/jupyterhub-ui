"use client";
import React, { useState } from "react";
import {
  Bell,
  Home,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Server,
  Settings,
  User,
} from "lucide-react";

import { Button } from "./ui/button";
import { AppHeader } from "./layout/app-header";
import { DashboardLayout } from "./layout/dashboard-layout";
import { WaveBackground } from "./ui/wave-background";
import { PageHeader } from "./layout/page-header";
import { NotebooksGrid, NotebookData } from "./notebook/notebooks-grid";
import { ServerStatus } from "./notebook/server-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loading, LoadingOverlay } from "./ui/loading";

import { EXAMPLE_NOTEBOOKS } from "@/mocks";
import { Input } from "@/components/input";

export function ExampleDashboard() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleStartNotebook = (id: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Update notebook status logic would go here
      console.log(`Starting notebook ${id}`);
    }, 1500);
  };

  const handleStopNotebook = (id: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Update notebook status logic would go here
      console.log(`Stopping notebook ${id}`);
    }, 1500);
  };

  const handleOpenSettings = (id: string) => {
    console.log(`Open settings for notebook ${id}`);
  };
  const [searchQuery, setSearchQuery] = useState("");
  // Filter notebooks based on selected tab
  const filteredNotebooks = EXAMPLE_NOTEBOOKS.filter((notebook) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "running")
      return notebook.status === "running" || notebook.status === "starting";
    if (selectedTab === "stopped")
      return notebook.status === "stopped" || notebook.status === "stopping";

    return true;
  }).filter((notebook) =>
    notebook.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sidebar content
  const sidebarContent = (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="px-2 py-1.5 text-sm font-semibold">Dashboard</div>
        <div className="space-y-1">
          <Button className="w-full justify-start" variant="ghost">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button className="w-full justify-start" variant="ghost">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Notebooks
          </Button>
          <Button className="w-full justify-start" variant="ghost">
            <Server className="mr-2 h-4 w-4" />
            Servers
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="px-2 py-1.5 text-sm font-semibold">Settings</div>
        <div className="space-y-1">
          <Button className="w-full justify-start" variant="ghost">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button className="w-full justify-start" variant="ghost">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </Button>
          <Button
            className="w-full justify-start text-[--color-infra-error]"
            variant="ghost"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  // Header content
  const headerContent = (
    <AppHeader
      actions={
        <>
          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <User className="h-5 w-5" />
          </Button>
        </>
      }
      logo={
        <div className="h-8 w-8 rounded-md bg-gradient-to-r from-[--color-infra-gradient-start] to-[--color-infra-gradient-end] flex items-center justify-center text-white font-bold">
          J
        </div>
      }
      title="JupyterHub Client"
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    />
  );

  return (
    <>
      {loading && <LoadingOverlay text="Processing request..." />}
      {/*<DashboardLayout*/}
      {/*  header={headerContent}*/}
      {/*  sidebar={sidebarOpen ? sidebarContent : undefined}*/}
      {/*>*/}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <PageHeader
            description="Manage your Jupyter notebooks"
            title="My Notebooks"
          />
          <ServerStatus message="Server is running normally" status="active" />
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-infra-text-secondary" />
            <Input
              className="pl-8 border-0 shadow "
              placeholder="Search notebooks..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Notebook
          </Button>
        </div>

        {filteredNotebooks.length > 0 ? (
          <NotebooksGrid
            notebooks={filteredNotebooks}
            onSettings={handleOpenSettings}
            onStart={handleStartNotebook}
            onStop={handleStopNotebook}
          />
        ) : (
          <div className="text-center p-12 border border-dashed border-[--color-infra-border] rounded-lg">
            <p className="text-[--color-infra-text-secondary]">
              No notebooks found matching the selected filter.
            </p>
          </div>
        )}
      </div>
      {/*</DashboardLayout>*/}
    </>
  );
}
