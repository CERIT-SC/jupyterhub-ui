import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { ChevronRight, Cpu, Gpu, MemoryStick, Rocket, Settings, Settings2, Shield } from "lucide-react";

import { CardTitle, Card, CardContent, CardDescription, CardFooter, CardHeader } from "../ui/card";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { DialogContent } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { ServerNameInput } from "./ServerNameInput";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { createServer } from "@/services/client/jupyterHub";
import { defaultJupyterHubServerOptions, minimalJupyterHubServerOptions } from "@/config/hub";
import { useAuth } from "@/hooks/useAuth";
import { ServerPreset } from "@/config/quickpresets";

interface QuickPresetCardProps {
  preset: ServerPreset;
}

function QuickPresetCard({ preset }: QuickPresetCardProps) {
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

  // Clear "required" error once user types something
  useEffect(() => {
    if (serverNameError && serverName.trim() !== "") {
      setServerNameError(undefined);
    }
  }, [serverName, serverNameError]);

  // Handle server creation
  const handleCreateServer = async () => {
    const trimmed = serverName.trim();
    if (!trimmed) {
      setServerNameError("Server name is required");
      return;
    }
    setIsSpawning(true);
    try {
      await createServer(trimmed, { ...minimalJupyterHubServerOptions, ...preset.options }, user?.name);
      router.push(`/hub/spawn/progress/${trimmed}`);
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
        "group flex h-full flex-col overflow-hidden transition-all duration-300",
        "border-infra-border border",
        "] hover:ring-infra-primary hover:border-infra-primary shadow-lg",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn("flex-shrink-0 rounded-lg p-2 transition-colors")}>{preset.icon}</div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-infra-text-primary text-lg font-medium">{preset.name}</CardTitle>
            <CardDescription className="mt-1 text-sm">{preset.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-8">
        {/* Resource specifications - inline layout like PresetSelector */}
        <div className="jus grid grid-cols-2 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm">
                <Cpu className="mr-1 h-4 w-4" />
                <span>{completeOptions.cpu} CPU</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>CPU cores</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm">
                <MemoryStick className="mr-1 h-4 w-4" />
                <span>{completeOptions.mem} GB</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Memory allocation</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm">
                <Gpu className="mr-1 h-4 w-4" />
                <span>
                  {completeOptions.gpu === "none" || completeOptions.gpu === undefined
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
              <div className="flex items-center text-sm">
                <Shield className={cn("mr-1 h-4 w-4", completeOptions.ssh ? "text-emerald-600" : "text-gray-400")} />
                <span>{completeOptions.ssh ? "SSH" : "No SSH"}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>SSH access {completeOptions.ssh ? "enabled" : "disabled"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {preset.tags?.map((tag: string, index: number) => (
            <Badge key={index} className="text-infra-primary border-infra-primary text-xs" variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex gap-2 pt-6">
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
              <DialogDescription>Create a new notebook server with {preset.name} configuration</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <ServerNameInput error={serverNameError} value={serverName} onChangeNameAction={setServerName} />

              {/* Server configuration summary */}
              <div className="bg-secondary/30 space-y-3 rounded-md p-4">
                <h4 className="text-sm font-medium">Configuration Summary:</h4>
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
                    <span>{preset.options.gpu === "none" ? "No GPU" : preset.options.gpu}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    <span>{preset.options.ssh ? "SSH Enabled" : "No SSH"}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setShowStartDialog(false)}>
                Cancel
              </Button>
              <Button className="gap-2" disabled={isSpawning} type="button" onClick={handleCreateServer}>
                {isSpawning ? <Loading className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
                Create Notebook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function CustomPresetCard({ onConfigure }: { onConfigure: () => void }) {
  return (
    <Card
      className={cn(
        "flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:shadow-lg",
        "border-infra-border hover:border-infra-primary/50 border-2 border-dashed",
      )}
      onClick={onConfigure}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="bg-infra-surface-secondary flex-shrink-0 rounded-lg p-2">
            <Settings2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-infra-text-primary text-lg font-medium">Custom Configuration</CardTitle>
            <CardDescription className="text-infra-text-secondary mt-1 text-sm">
              Full control over server specifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 py-2">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <Cpu className="mr-1 h-4 w-4" />
              <span>Custom CPU</span>
            </div>
            <div className="flex items-center text-sm">
              <MemoryStick className="mr-1 h-4 w-4" />
              <span>Custom RAM</span>
            </div>
            <div className="flex items-center text-sm">
              <Gpu className="mr-1 h-4 w-4" />
              <span>GPU Options</span>
            </div>
            <div className="flex items-center text-sm">
              <Gpu className="mr-1 h-4 w-4" />
              <span>Storage Options</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto pt-6">
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
          <ChevronRight className="ml-auto h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export { type QuickPresetCardProps, CustomPresetCard, QuickPresetCard };
