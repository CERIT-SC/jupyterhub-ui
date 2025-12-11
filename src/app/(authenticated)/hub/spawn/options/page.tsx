"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Rocket, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { JupyterHubServerOptions, createServer } from "@/services/client/jupyterHub";
import { defaultJupyterHubServerOptions, minimalJupyterHubServerOptions } from "@/config/hub";
import { ImageSettings, ResourceSettings, StorageSettings } from "@/components/hub/settings/simpleSettings";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServerNameInput } from "@/components/hub/ServerNameInput";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/cn";

export default function SpawnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [options, setOptions] = useState<Partial<JupyterHubServerOptions>>(defaultJupyterHubServerOptions);
  const [serverName, setServerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [serverNameError, setServerNameError] = useState<string | undefined>();
  const [isServerNameValid, setIsServerNameValid] = useState(false);

  // Refs for scrolling to sections
  const nameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const resourceRef = useRef<HTMLDivElement>(null);

  // Read error passed from spawn progress
  const spawnError = searchParams.get("error") || undefined;

  // Validation logic
  const validation = useMemo(() => {
    const errors: string[] = [];
    const missingFields: string[] = [];

    // Server name validity is driven by ServerNameInput
    if (serverNameError) {
      errors.push(serverNameError);
    }

    // Check minimal required options
    const minimalKeys = Object.keys(minimalJupyterHubServerOptions) as (keyof JupyterHubServerOptions)[];

    for (const key of minimalKeys) {
      const currentValue = options[key];

      if (currentValue === undefined || currentValue === "") {
        missingFields.push(key);
      }
    }

    const isValid = isServerNameValid && missingFields.length === 0;

    return {
      isValid,
      errors,
      missingFields,
      hasRequiredOptions: missingFields.length === 0,
    };
  }, [isServerNameValid, options]);
  console.log(serverNameError);

  // Parse URL parameters into JupyterHubServerOptions
  useEffect(() => {
    const urlOptions: Partial<JupyterHubServerOptions> = {};
    // Helper function to convert string to boolean
    const parseBoolean = (value: string): boolean => {
      return value === "true";
    };

    // Parse each possible parameter
    for (const [key, value] of searchParams.entries()) {
      switch (key) {
        case "container_image":
          urlOptions.container_image = value;
          break;
        case "custom":
          urlOptions.custom = parseBoolean(value);
          break;
        case "ssh":
          urlOptions.ssh = parseBoolean(value);
          break;
        case "phome":
          urlOptions.phome = value;
          break;
        case "mountprojects":
          urlOptions.mountprojects = parseBoolean(value);
          break;
        case "home":
          urlOptions.home = value === "null" ? null : value;
          break;
        case "mounttostorage":
          urlOptions.mounttostorage = parseBoolean(value);
          break;
        case "s3url":
          urlOptions.s3url = value;
          break;
        case "s3bucket":
          urlOptions.s3bucket = value;
          break;
        case "s3accesskey":
          urlOptions.s3accesskey = value;
          break;
        case "s3secretkey":
          urlOptions.s3secretkey = value;
          break;
        case "s3existing":
          urlOptions.s3existing = value;
          break;
        case "cpu":
          urlOptions.cpu = value;
          break;
        case "mem":
          urlOptions.mem = value;
          break;
        case "gpu":
          urlOptions.gpu = value;
          break;
        case "migamount":
          urlOptions.migamount = value;
          break;
        case "shmsize":
          urlOptions.shmsize = value;
          break;
        default:
          // Ignore unknown parameters
          break;
      }
    }

    // Merge URL options with defaults
    if (Object.keys(urlOptions).length > 0) {
      setOptions((prev) => ({
        ...prev,
        ...urlOptions,
      }));
    }
  }, [searchParams]);

  // Scroll to section function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // Handle create notebook
  const handleCreateNotebook = async () => {
    // Reset forced external error
    setServerNameError(undefined);

    // If name invalid, scroll and (if empty) surface "required" via external error
    if (!isServerNameValid) {
      if (!serverName.trim()) {
        setServerNameError("Server name is required");
      }
      scrollToSection(nameRef);
      return;
    }

    if (!options.container_image) {
      scrollToSection(imageRef);
      return;
    }

    if (!options.cpu || !options.mem) {
      scrollToSection(resourceRef);
      return;
    }

    // All validations passed, create the notebook
    setIsCreating(true);

    try {
      // Merge options with minimal requirements
      const completeOptions = {
        ...minimalJupyterHubServerOptions,
        ...options,
      };

      await createServer(serverName, completeOptions, user?.name);

      // Redirect to progress page
      router.push(`/hub/spawn/progress/${serverName}`);
    } catch (error) {
      console.error("Failed to create server:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="relative container mx-auto max-w-7xl space-y-6 p-6">
      {spawnError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 text-sm">
          {spawnError}
        </div>
      )}
      {/* Back button */}
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="ghost" onClick={() => router.push("/hub/notebooks")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notebooks
        </Button>
      </div>

      {/* Page header */}
      <PageHeader description="Configure your JupyterHub notebook server" title="Create New Notebook" />

      <div className="mx-auto space-y-6 py-6">
        <div className="mb-2 flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                View JSON
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Options Configuration</DialogTitle>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(options, null, 2)}</pre>
            </DialogContent>
          </Dialog>
        </div>

        <div ref={nameRef}>
          <ServerNameInput
            value={serverName}
            onChangeNameAction={setServerName}
            error={serverNameError}
            onValidationChange={(valid) => {
              setIsServerNameValid(valid);
              if (valid && serverNameError) setServerNameError(undefined);
            }}
          />
        </div>

        <div ref={imageRef}>
          <ImageSettings options={options} setOptions={setOptions} />
        </div>

        <div ref={resourceRef}>
          <ResourceSettings options={options} setOptions={setOptions} />
        </div>

        <StorageSettings options={options} setOptions={setOptions} />
      </div>

      {/* Floating Create Button (sticks to viewport bottom, within container) */}
      <div className="sticky bottom-0 z-50">
        <div className="flex justify-end">
          <div className="relative inline-flex">
            <Button
              className={cn("shadow-lg transition-all duration-200", "min-w-[160px] gap-2 text-base font-medium")}
              disabled={isCreating}
              size="lg"
              onClick={handleCreateNotebook}
            >
              {isCreating ? (
                <>
                  <Loading className="h-5 w-5" />
                  Creating...
                </>
              ) : (
                <>
                  {!validation.hasRequiredOptions ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Rocket className="h-5 w-5" />
                  )}
                  {!validation.hasRequiredOptions ? "Missing Options" : "Create Notebook"}
                </>
              )}
            </Button>

            {/* Validation tooltip */}
            {!validation.isValid && (
              <div className="absolute right-0 bottom-full mb-2 max-w-xs rounded bg-gray-900 p-2 text-xs text-white shadow-lg">
                {validation.errors.length > 0 && (
                  <div className="mb-1">
                    <strong>Errors:</strong>
                    <ul className="list-inside list-disc">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validation.missingFields.length > 0 && (
                  <div>
                    <strong>Missing:</strong> {validation.missingFields.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
