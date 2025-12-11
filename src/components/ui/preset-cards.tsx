import { Rocket } from "lucide-react";
import { Cpu, Gpu, MemoryStick, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ServerNameInput } from "../hub/ServerNameInput";

import { Button } from "./button";
import { Loading, LoadingPage } from "./loading";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

import { minimalJupyterHubServerOptions } from "@/config/hub";
import { cn } from "@/lib/cn";
import { createServer } from "@/services/client/jupyterHub";
import { useAuth } from "@/hooks/useAuth";
import { NotebookPreset } from "@/db/notebooksPresetsRepository";

// Define preset type (adjust according to your actual data structure)

// Styled PresetCard component (similar to QuickPresetCard)
function PresetCard({ preset, onClick }: { preset: NotebookPreset; onClick?: () => void }) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [serverName, setServerName] = useState("");
  const [serverNameError, setServerNameError] = useState("");
  const [isSpawning, setIsSpawning] = useState(false);
  const { user } = useAuth();
  // Get complete options from preset.serverOptions
  const completeOptions = preset.serverOptions || {};
  const router = useRouter();
  const handleConfigure = () => {
    onClick?.();
  };

  const handleCreateServer = async () => {
    if (!serverName) {
      setServerNameError("Server name is required");

      return;
    }
    setIsSpawning(true);
    try {
      await createServer(serverName, { ...minimalJupyterHubServerOptions, ...preset.serverOptions }, user?.name);

      // Redirect to the progress page
      router.push(`/hub/spawn/progress/${serverName}`);
      console.log("Creating server with:", {
        serverName,
        options: preset.serverOptions,
      });
    } catch (error) {
      console.error("Error creating server:", error);
    } finally {
      setIsSpawning(false);
      setShowStartDialog(false);
    }
  };

  const handleDialogClose = () => {
    setServerName("");
    setServerNameError("");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={cn(
            "group flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-300",
            "border-infra-border border",
            "hover:ring-infra-primary hover:border-infra-primary shadow-lg",
          )}
        >
          <CardHeader className="group-hover:text-infra-primary pb-3">
            <div className="flex items-start gap-3">
              <div className={cn("group-hover:bg-infra-primary/10 flex-shrink-0 rounded-lg p-2 transition-colors")}>
                <Settings className="text-infra-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-infra-text-primary group-hover:text-infra-primary text-lg font-medium">
                  {preset.name}
                </CardTitle>
                <CardDescription className="group-hover:text-infra-primary mt-1 text-sm">
                  {preset.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-8">
            {/* Resource specifications - inline layout like PresetSelector */}
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm">
                    <Cpu className="mr-1 h-4 w-4" />
                    <span>{completeOptions.cpu || "N/A"} CPU</span>
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
                    <span>{completeOptions.mem || "N/A"} GB</span>
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
                    <Shield
                      className={cn("mr-1 h-4 w-4", completeOptions.ssh ? "text-emerald-600" : "text-gray-400")}
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
            <div className="flex flex-wrap gap-2">
              {/* {preset.tags?.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  className="text-xs text-infra-primary border-infra-primary"
                  variant="outline"
                >
                  {tag}
                </Badge>
              ))} */}
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
                        <span>{completeOptions.cpu || "N/A"} CPU</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="h-3.5 w-3.5" />
                        <span>{completeOptions.mem || "N/A"} GB RAM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gpu className="h-3.5 w-3.5" />
                        <span>{completeOptions.gpu === "none" ? "No GPU" : completeOptions.gpu || "No GPU"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        <span>{completeOptions.ssh ? "SSH Enabled" : "No SSH"}</span>
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
      </TooltipTrigger>
      <TooltipContent className="max-w-sm" side="right">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{preset.name} Configuration</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>CPU:</span>
              <span>{completeOptions.cpu || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span>{completeOptions.mem || "N/A"} GB</span>
            </div>
            <div className="flex justify-between">
              <span>GPU:</span>
              <span>{completeOptions.gpu === "none" || !completeOptions.gpu ? "No GPU" : completeOptions.gpu}</span>
            </div>
            <div className="flex justify-between">
              <span>SSH:</span>
              <span>{completeOptions.ssh ? "Enabled" : "Disabled"}</span>
            </div>
            {completeOptions.container_image && (
              <div className="flex justify-between">
                <span>Image:</span>
                <span className="max-w-32 truncate">{completeOptions.container_image}</span>
              </div>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Updated PresetCards component
export function PresetCards({
  presets,
  isLoading,
  onPresetClick,
}: {
  presets?: NotebookPreset[];
  isLoading?: boolean;
  onPresetClick?: (id: number | string) => void;
}) {
  if (isLoading) {
    return <LoadingPage />;
  }

  if (!presets || presets.length === 0) {
    return <div className="text-muted-foreground">No presets found.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {presets.map((preset) => (
        <PresetCard key={preset.id} preset={preset} onClick={() => onPresetClick && onPresetClick(preset.id)} />
      ))}
    </div>
  );
}
