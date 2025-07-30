"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Info, ArrowLeft, RocketIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/hooks/useAuth";
import { JupyterHubServerOptions, createServer } from "@/services/jupyterHub";
import { SpawnOptionsForm } from "@/components/hub/SpawnOptionsForm";
import { ServerNameInput } from "@/components/hub/ServerNameInput";
import { PresetSelector } from "@/components/hub/PresetSelector";
import { defaultJupyterHubServerOptions } from "@/config/hub";
import { ServerPreset, serverPresets } from "@/config/presets";

export default function SpawnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isSpawning, setIsSpawning] = useState(false);
  const [serverName, setServerName] = useState("notebook-1");
  const [selectedPresetId, setSelectedPresetId] = useState<string>();
  const [options, setOptions] = useState<JupyterHubServerOptions>(
    defaultJupyterHubServerOptions,
  );
  const username = user?.name;

  // Handle preset selection from URL query parameter
  useEffect(() => {
    const presetId = searchParams.get("preset");

    if (presetId) {
      const preset = serverPresets.find((p) => p.id === presetId);

      if (preset) {
        setSelectedPresetId(preset.id);
        setOptions(preset.options);
      }
    }
  }, [searchParams]);

  // Handle preset selection
  const handlePresetSelect = (preset: ServerPreset) => {
    setSelectedPresetId(preset.id);
    setOptions(preset.options);
  };

  // State for validation errors
  const [errors, setErrors] = useState<{
    serverName?: string;
    general?: string;
    image?: string;
    cpu?: string;
    memory?: string;
    gpu?: string;
    storage?: string;
    [key: string]: string | undefined;
  }>({});

  // Handle spawning a new server
  const handleSpawn = async () => {
    try {
      // Reset any previous errors
      setErrors({});

      // Validate server name
      if (!serverName) {
        setErrors((prev) => ({
          ...prev,
          serverName: "Server name is required",
        }));

        return;
      }

      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(serverName)) {
        setErrors((prev) => ({
          ...prev,
          serverName:
            "Server name must contain only lowercase letters, numbers, and hyphens, and must start and end with a letter or number",
        }));

        return;
      }

      setIsSpawning(true);

      // Create the server with the specified options
      await createServer(serverName, options, username);

      // Redirect to the progress page
      router.push(`/hub/spawn/progress/${serverName}`);
    } catch (error) {
      console.error("Failed to spawn server:", error);
      setIsSpawning(false);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setErrors((prev) => ({
        ...prev,
        general: `Failed to spawn server: ${errorMessage}`,
      }));
    }
  };

  return (
    <div className="container mx-auto p-6 pb-24 space-y-6">
      {/* Back button */}
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push("/hub/notebooks")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notebooks
        </Button>
      </div>

      {/* Page header */}
      <PageHeader
        description="Configure your JupyterHub notebook server"
        title="Create New Notebook"
      />

      {/* Info alert */}
      <Alert variant={"info"}>
        <Info className="h-4 w-4" />
        <AlertTitle>Feature in developement</AlertTitle>
        <AlertDescription>
          Options are unavailable for the time being. You can spawn only basic
          notebook server.
        </AlertDescription>
      </Alert>

      <Separator />

      {/* Display general errors */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Preset selector */}
      <PresetSelector
        selectedPresetId={selectedPresetId}
        onSelectPreset={handlePresetSelect}
      />

      <Separator />

      {/* Server name input */}
      <ServerNameInput
        error={errors.serverName}
        value={serverName}
        onChange={setServerName}
      />

      {/* Spawn options form */}
      <SpawnOptionsForm
        errors={{
          image: errors.image,
          cpu: errors.cpu,
          memory: errors.memory,
          gpu: errors.gpu,
          storage: errors.storage,
        }}
        options={options}
        onOptionsChange={setOptions}
      />

      {/* Spawn button */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-background border-t border-gray-200 z-10">
        <div className="container mx-auto flex justify-end">
          <Button
            className="gap-2"
            // disabled={isSpawning || !serverName}
            disabled={true}
            size="lg"
            onClick={handleSpawn}
          >
            {isSpawning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Spawning...
              </>
            ) : (
              <>
                <RocketIcon className="h-5 w-5" />
                Launch Notebook
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
