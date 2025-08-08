"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Settings,
  Settings2,
  Zap,
  ChevronRight,
  Cpu,
  Gpu,
  Shield,
  MemoryStick,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { defaultJupyterHubServerOptions } from "@/config/hub";
import { ServerNameInput } from "@/components/hub/ServerNameInput";
import { cn } from "@/lib/cn";
// Import presets from config
import { ServerPreset, quickstartServerPresets } from "@/config/quickpresets";
import { createServer } from "@/services/jupyterHub";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { minimalJupyterHubServerOptions } from "@/config/hub";

interface PresetCardProps {
  preset: ServerPreset;
}

function PresetCard({ preset }: PresetCardProps) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [serverName, setServerName] = useState("");
  const [serverNameError, setServerNameError] = useState<string | undefined>();
  const [isSpawning, setIsSpawning] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const completeOptions = useMemo(
    () => ({
      ...defaultJupyterHubServerOptions,
      ...preset.options,
    }),
    [preset.options],
  );

  // Handle server creation
  const handleCreateServer = async () => {
    // Validate server name
    if (!serverName) {
      setServerNameError("Server name is required");

      return;
    }

    setIsSpawning(true);

    try {
      // Create the server with the specified options
      await createServer(
        serverName,
        { ...minimalJupyterHubServerOptions, ...preset.options },
        user?.name,
      );

      // Redirect to the progress page
      router.push(`/hub/spawn/progress/${serverName}`);
      setShowStartDialog(false);
    } catch (error) {
      setIsSpawning(false);
      console.error("Failed to create server:", error);
    }
  };

  // Handle configure button click
  const handleConfigure = () => {
    // Convert preset options to URL parameters
    const params = new URLSearchParams();

    // Add each option as a parameter
    Object.entries(preset.options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    // Navigate to options page with parameters
    const url = `/hub/spawn/options?${params.toString()}`;

    router.push(url);
  };

  // Reset state when dialog is closed
  const handleDialogClose = () => {
    setServerName("");
    setServerNameError(undefined);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full group",
        "border border-infra-border ",
        "] hover:ring-infra-primary hover:border-infra-primary shadow-lg ",
      )}
    >
      <CardHeader className="pb-3 group-hover:text-infra-primary">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-lg transition-colors flex-shrink-0, group-hover:bg-infra-primary/10",
            )}
          >
            {preset.icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium text-infra-text-primary group-hover:text-infra-primary">
              {preset.name}
            </CardTitle>
            <CardDescription className="text-sm mt-1 group-hover:text-infra-primary">
              {preset.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 flex-1">
        {/* Resource specifications - inline layout like PresetSelector */}
        <div className="grid grid-cols-2 gap-2 jus">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm ">
                <Cpu className="h-4 w-4 mr-1" />
                <span>{completeOptions.cpu} CPU</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>CPU cores</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm ">
                <MemoryStick className="h-4 w-4 mr-1" />
                <span>{completeOptions.mem} GB</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Memory allocation</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm ">
                <Gpu className="h-4 w-4 mr-1" />
                <span>
                  {completeOptions.gpu === "none" ||
                  completeOptions.gpu === undefined
                    ? "No GPU"
                    : completeOptions.gpu.toUpperCase()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>GPU allocation</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm ">
                <Shield
                  className={cn(
                    "h-4 w-4 mr-1",
                    completeOptions.ssh ? "text-emerald-600" : "text-gray-400",
                  )}
                />
                <span>{completeOptions.ssh ? "SSH" : "No SSH"}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>SSH access {completeOptions.ssh ? "enabled" : "disabled"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {preset.tags?.map((tag: string, index: number) => (
            <Badge
              key={index}
              className="text-xs text-infra-primary border-infra-primary"
              variant="outline"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-6 flex gap-2 mt-auto">
        <Button
          className="flex-1 gap-2"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleConfigure();
          }}
        >
          <Settings className="h-4 w-4" />
          Configure
        </Button>
        <Button
          className="flex-1 gap-2"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowStartDialog(true);
          }}
        >
          <Rocket className="h-4 w-4" />
          Quick Start
        </Button>

        {/* Quick Start Dialog */}
        <Dialog
          open={showStartDialog}
          onOpenChange={(open) => {
            setShowStartDialog(open);
            if (!open) handleDialogClose();
          }}
        >
          <DialogContent
            className="sm:max-w-md"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && serverName && !isSpawning) {
                e.preventDefault();
                await handleCreateServer();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Start Notebook Server</DialogTitle>
              <DialogDescription>
                Create a new notebook server with {preset.name} configuration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <ServerNameInput
                error={serverNameError}
                value={serverName}
                onChangeNameAction={setServerName}
              />

              {/* Server configuration summary */}
              <div className="bg-secondary/30 p-4 rounded-md space-y-3">
                <h4 className="font-medium text-sm">Configuration Summary:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>{preset.options.cpu} CPU</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MemoryStick className="h-3.5 w-3.5" />
                    <span>{preset.options.mem} GB RAM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gpu className="h-3.5 w-3.5" />
                    <span>
                      {preset.options.gpu === "none"
                        ? "No GPU"
                        : preset.options.gpu}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    <span>{preset.options.ssh ? "SSH Enabled" : "No SSH"}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStartDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="gap-2"
                disabled={isSpawning}
                type="button"
                onClick={handleCreateServer}
              >
                {isSpawning ? (
                  <Loading className="h-4 w-4" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                Create Notebook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function CustomCard({ onConfigure }: { onConfigure: () => void }) {
  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col h-full",
        "border-2 border-dashed border-infra-border hover:border-infra-primary/50",
      )}
      onClick={onConfigure}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-infra-surface-secondary flex-shrink-0">
            <Settings2 className="h-6 w-6 " />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium text-infra-text-primary">
              Custom Configuration
            </CardTitle>
            <CardDescription className="text-sm text-infra-text-secondary mt-1">
              Full control over server specifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2 space-y-4 flex-1">
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm ">
              <Cpu className="h-4 w-4 mr-1" />
              <span>Custom CPU</span>
            </div>
            <div className="flex items-center text-sm ">
              <MemoryStick className="h-4 w-4 mr-1" />
              <span>Custom RAM</span>
            </div>
            <div className="flex items-center text-sm ">
              <Gpu className="h-4 w-4 mr-1" />
              <span>GPU Options</span>
            </div>
            <div className="flex items-center text-sm ">
              <Gpu className="h-4 w-4 mr-1" />
              <span>Storage Options</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6 mt-auto">
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onConfigure();
          }}
        >
          <Settings className="h-4 w-4" />
          Configure Options
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SpawnSelection() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetConfigure = (presetId: string) => {
    router.push(`/hub/spawn/configure?preset=${presetId}`);
  };

  const handlePresetStart = (presetId: string, serverName?: string) => {
    // If server name is provided, include it in the URL
    const url = serverName
      ? `/hub/spawn/start?preset=${presetId}&name=${encodeURIComponent(serverName)}`
      : `/hub/spawn/start?preset=${presetId}`;

    router.push(url);
  };

  const handleCustomConfigure = () => {
    router.push("/hub/spawn/options");
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-infra-text-primary mb-2">
          Spawn New Server
        </h1>
        <p className="text-lg text-infra-text-secondary">
          Choose a preset to get started quickly, or customize advanced options
          for complete control.
        </p>
      </div>

      {/* Quick Start Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-infra-primary/10 rounded-lg">
            <Zap className="h-5 w-5 text-infra-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-infra-text-primary">
              Quick Start Presets
            </h2>
            <p className="text-sm text-infra-text-secondary">
              Select a preset configuration or customize below
            </p>
          </div>
        </div>

        {/* Grid layout matching PresetSelector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickstartServerPresets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}

          {/* Custom Configuration Card */}
          <CustomCard onConfigure={handleCustomConfigure} />
        </div>
      </div>
    </div>
  );
}
