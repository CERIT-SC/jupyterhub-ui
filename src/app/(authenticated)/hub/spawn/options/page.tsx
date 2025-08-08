"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Rocket, AlertCircle } from "lucide-react";
import { DialogBody } from "next/dist/client/components/react-dev-overlay/ui/components/dialog";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { JupyterHubServerOptions, createServer } from "@/services/jupyterHub";
import {
  defaultJupyterHubServerOptions,
  minimalJupyterHubServerOptions,
} from "@/config/hub";
import {
  ImageSettings,
  ResourceSettings,
  StorageSettings,
} from "@/components/simpleSettings";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServerNameInput } from "@/components/hub/ServerNameInput";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/cn";

export default function SpawnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [options, setOptions] = useState<Partial<JupyterHubServerOptions>>(
    defaultJupyterHubServerOptions,
  );
  const [serverName, setServerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [serverNameError, setServerNameError] = useState<string>("");

  // Refs for scrolling to sections
  const nameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const resourceRef = useRef<HTMLDivElement>(null);

  // Validation logic
  const validation = useMemo(() => {
    const errors: string[] = [];
    const missingFields: string[] = [];

    // Check server name
    if (!serverName.trim()) {
      errors.push("Server name is required");
    }

    // Check minimal required options
    const minimalKeys = Object.keys(
      minimalJupyterHubServerOptions,
    ) as (keyof JupyterHubServerOptions)[];

    for (const key of minimalKeys) {
      const currentValue = options[key];

      if (currentValue === undefined || currentValue === "") {
        missingFields.push(key);
      }
    }

    const isValid = errors.length === 0 && missingFields.length === 0;

    return {
      isValid,
      errors,
      missingFields,
      hasRequiredOptions: missingFields.length === 0,
    };
  }, [serverName, options]);

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
    // Reset errors
    setServerNameError("");

    // Validate and scroll to first error
    if (!serverName.trim()) {
      setServerNameError("Server name is required");
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
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
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

      {/*/!* Display current options from URL parameters *!/*/}
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle>Current Configuration</CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <div className="space-y-2">*/}
      {/*      <div className="grid grid-cols-2 gap-4 text-sm">*/}
      {/*        <div>*/}
      {/*          <span className="font-medium">Container Image:</span>*/}
      {/*          <p className="break-all">{options.container_image}</p>*/}
      {/*        </div>*/}
      {/*        <div>*/}
      {/*          <span className="font-medium">CPU:</span>*/}
      {/*          <p>{options.cpu} cores</p>*/}
      {/*        </div>*/}
      {/*        <div>*/}
      {/*          <span className="font-medium">Memory:</span>*/}
      {/*          <p>{options.mem} GB</p>*/}
      {/*        </div>*/}
      {/*        <div>*/}
      {/*          <span className="font-medium">GPU:</span>*/}
      {/*          <p>{options.gpu === "none" ? "None" : options.gpu}</p>*/}
      {/*        </div>*/}
      {/*        <div>*/}
      {/*          <span className="font-medium">SSH Access:</span>*/}
      {/*          <p>{options.ssh ? "Enabled" : "Disabled"}</p>*/}
      {/*        </div>*/}
      {/*        <div>*/}
      {/*          <span className="font-medium">Mount Projects:</span>*/}
      {/*          <p>{options.mountprojects ? "Yes" : "No"}</p>*/}
      {/*        </div>*/}
      {/*        {options.home && (*/}
      {/*          <div>*/}
      {/*            <span className="font-medium">Home Directory:</span>*/}
      {/*            <p>{options.home}</p>*/}
      {/*          </div>*/}
      {/*        )}*/}
      {/*        {options.s3url && (*/}
      {/*          <div>*/}
      {/*            <span className="font-medium">S3 URL:</span>*/}
      {/*            <p className="break-all">{options.s3url}</p>*/}
      {/*          </div>*/}
      {/*        )}*/}
      {/*        {options.s3bucket && (*/}
      {/*          <div>*/}
      {/*            <span className="font-medium">S3 Bucket:</span>*/}
      {/*            <p>{options.s3bucket}</p>*/}
      {/*          </div>*/}
      {/*        )}*/}
      {/*        {options.migamount && (*/}
      {/*          <div>*/}
      {/*            <span className="font-medium">MIG Amount:</span>*/}
      {/*            <p>{options.migamount}</p>*/}
      {/*          </div>*/}
      {/*        )}*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}

      {/*/!* Debug section - can be removed later *!/*/}
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle>Debug: Raw URL Parameters</CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <div className="text-sm bg-gray-100 p-4 rounded">*/}
      {/*      <pre>*/}
      {/*        {JSON.stringify(*/}
      {/*          Object.fromEntries(searchParams.entries()),*/}
      {/*          null,*/}
      {/*          2,*/}
      {/*        )}*/}
      {/*      </pre>*/}
      {/*    </div>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}

      {/*/!* Debug section - can be removed later *!/*/}
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle>Debug: Parsed Options Object</CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <div className="text-sm bg-gray-100 p-4 rounded">*/}
      {/*      <pre>{JSON.stringify(options, null, 2)}</pre>*/}
      {/*    </div>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}

      <div className="space-y-6  mx-auto py-6">
        <div className="flex justify-end mb-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                View JSON
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Options Configuration</DialogTitle>
              <DialogBody className={"h-96 overflow-auto"}>
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(options, null, 2)}
                </pre>
              </DialogBody>
            </DialogContent>
          </Dialog>
        </div>

        <div ref={nameRef}>
          <ServerNameInput
            error={serverNameError}
            value={serverName}
            onChangeNameAction={setServerName}
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

      {/* Floating Create Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className={cn(
            "shadow-lg  transition-all duration-200",
            "min-w-[160px] gap-2 text-base font-medium",
          )}
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
              {!validation.hasRequiredOptions
                ? "Missing Options"
                : "Create Notebook"}
            </>
          )}
        </Button>

        {/* Validation tooltip */}
        {!validation.isValid && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg max-w-xs">
            {validation.errors.length > 0 && (
              <div className="mb-1">
                <strong>Errors:</strong>
                <ul className="list-disc list-inside">
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
  );
}
