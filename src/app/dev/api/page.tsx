"use client";
import { useState } from "react";

// Import tester components
import PrometheusApiTester from "./PrometheusApiTester";
import GpuMetricsTester from "./GpuMetricsTester";
import JupyterHubTester from "./JupyterHubTester";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DevPage = () => {
  const [activeTab, setActiveTab] = useState("jupyterhub");

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 gap-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl md:text-6xl font-bold tracking-tight">
          Development
        </h1>
        <p className="text-muted-foreground mb-8">
          Testing and development tools
        </p>
      </div>

      <Tabs
        className="w-full max-w-5xl"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="prometheus">Prometheus</TabsTrigger>
          <TabsTrigger value="gpu-metrics">GPU Metrics</TabsTrigger>
          <TabsTrigger value="jupyterhub">JupyterHub</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent className="w-full" value="prometheus">
            <PrometheusApiTester />
          </TabsContent>

          <TabsContent className="w-full" value="gpu-metrics">
            <GpuMetricsTester />
          </TabsContent>

          <TabsContent className="w-full" value="jupyterhub">
            <JupyterHubTester />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
};

export default DevPage;
