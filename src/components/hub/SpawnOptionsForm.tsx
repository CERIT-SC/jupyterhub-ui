"use client";

import { useEffect, useState } from "react";
import { Cpu, HardDrive, Server } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { HelpText } from "@/components/ui/help-text";
import { CardSection } from "@/components/ui/card-section";
import { ImageSelector } from "@/components/hub/ImageSelector";
import { JupyterHubServerOptions } from "@/services/jupyterHub";
import {
  cpuOptions,
  homeOptions,
  memoryOptions,
  migAmountOptions,
  mockPvcNames,
  mockS3Buckets,
} from "@/config/hub/jupyterOptions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAllocatableGPUS } from "@/api/prometheus/prometheus-api";

interface SpawnOptionsFormProps {
  options: JupyterHubServerOptions;
  onOptionsChange: (options: JupyterHubServerOptions) => void;
  errors?: {
    image?: string;
    cpu?: string;
    memory?: string;
    gpu?: string;
    storage?: string;
    [key: string]: string | undefined;
  };
}

export function SpawnOptionsForm({
  options,
  onOptionsChange,
  errors = {},
}: SpawnOptionsFormProps) {
  // Track GPU-specific state to show/hide MIG amount selector
  const [showMigAmount, setShowMigAmount] = useState(false);

  // Track available GPU options from Prometheus
  const [gpuOptions, setGpuOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [gpuOptionsLoading, setGpuOptionsLoading] = useState(true);

  // Track home storage state
  const [mountMetacentrumHome, setMountMetacentrumHome] = useState(
    !!options.home,
  );

  // Track persistent home state
  const [phomeType, setPhomeType] = useState<"new" | "existing">(
    options.phome === "delete" || options.phome === "remain"
      ? "new"
      : "existing",
  );

  // Track S3 storage state
  const [mountS3, setMountS3] = useState(
    !!options.s3url || !!options.s3existing,
  );
  const [s3Type, setS3Type] = useState<"new" | "existing">(
    options.s3url ? "new" : "existing",
  );

  // Set up effect to handle GPU MIG amount visibility
  useEffect(() => {
    setShowMigAmount(options.gpu.startsWith("mig"));
  }, [options.gpu]);

  // Load GPU options from Prometheus API
  useEffect(() => {
    const loadGpuOptions = async () => {
      try {
        setGpuOptionsLoading(true);
        const allocableGPUs = await getAllocatableGPUS();

        // Transform the allocable GPUs data into options format
        const options = Object.entries(allocableGPUs).map(([name, count]) => ({
          value: name,
          label: `${name} (${count} available)`,
        }));

        // Add "None" option at the beginning
        setGpuOptions([{ value: "none", label: "None" }, ...options]);
      } catch (error) {
        console.error("Failed to load GPU options:", error);
        // Fallback to a basic option if API fails
        setGpuOptions([{ value: "none", label: "None" }]);
      } finally {
        setGpuOptionsLoading(false);
      }
    };

    loadGpuOptions();
  }, []);

  // Handle image change
  const handleImageChange = (imagePath: string) => {
    onOptionsChange({
      ...options,
      container_image: imagePath,
      custom: !imagePath.startsWith("cerit.io/hubs/"),
    });
  };

  // Handle CPU change
  const handleCpuChange = (value: string) => {
    onOptionsChange({
      ...options,
      cpu: value,
    });
  };

  // Handle memory change
  const handleMemoryChange = (value: string) => {
    onOptionsChange({
      ...options,
      mem: value,
      shmsize: value, // Set shared memory size equal to memory
    });
  };

  // Handle GPU change
  const handleGpuChange = (value: string) => {
    const newOptions = { ...options, gpu: value };

    // Clear migamount if not needed
    if (!value.startsWith("mig")) {
      delete newOptions.migamount;
    } else if (!newOptions.migamount) {
      // Default to 1 if selecting a MIG GPU
      newOptions.migamount = "1";
    }

    onOptionsChange(newOptions);
  };

  // Handle MIG amount change
  const handleMigAmountChange = (value: string) => {
    onOptionsChange({
      ...options,
      migamount: value,
    });
  };

  // Handle SSH access change
  const handleSshChange = (checked: boolean) => {
    onOptionsChange({
      ...options,
      ssh: checked,
    });
  };

  // Handle persistent home type change
  const handlePhomeTypeChange = (value: string) => {
    const newPhomeType = value as "new" | "existing";

    setPhomeType(newPhomeType);

    // Update options based on type
    if (newPhomeType === "new") {
      onOptionsChange({
        ...options,
        phome: "remain", // Default to "remain" for new phome
      });
    } else if (mockPvcNames.length > 0) {
      // For existing, select the first PVC if available
      onOptionsChange({
        ...options,
        phome: mockPvcNames[0].value,
      });
    }
  };

  // Handle phome delete option change
  const handlePhomeDeleteChange = (checked: boolean) => {
    onOptionsChange({
      ...options,
      phome: checked ? "delete" : "remain",
    });
  };

  // Handle existing phome selection
  const handleExistingPhomeChange = (value: string) => {
    onOptionsChange({
      ...options,
      phome: value,
    });
  };

  // Handle mount projects change
  const handleMountProjectsChange = (checked: boolean) => {
    onOptionsChange({
      ...options,
      mountprojects: checked,
    });
  };

  // Handle Metacentrum home mount toggle
  const handleMetacentrumHomeToggle = (checked: boolean) => {
    setMountMetacentrumHome(checked);

    if (!checked) {
      // If unchecking, clear home settings
      onOptionsChange({
        ...options,
        home: null,
        mounttostorage: false,
      });
    } else if (homeOptions.length > 0) {
      // If checking, set default home
      onOptionsChange({
        ...options,
        home: homeOptions[0].value,
      });
    }
  };

  // Handle home selection change
  const handleHomeChange = (value: string) => {
    onOptionsChange({
      ...options,
      home: value,
    });
  };

  // Handle storage location mount change
  const handleStorageLocationChange = (checked: boolean) => {
    onOptionsChange({
      ...options,
      mounttostorage: checked,
    });
  };

  // Handle S3 mount toggle
  const handleS3Toggle = (checked: boolean) => {
    setMountS3(checked);

    if (!checked) {
      // If unchecking, clear S3 settings
      const newOptions = { ...options };

      delete newOptions.s3url;
      delete newOptions.s3bucket;
      delete newOptions.s3accesskey;
      delete newOptions.s3secretkey;
      delete newOptions.s3existing;
      onOptionsChange(newOptions);
    }
  };

  // Handle S3 type change
  const handleS3TypeChange = (value: string) => {
    const newS3Type = value as "new" | "existing";

    setS3Type(newS3Type);

    // Clear inappropriate fields based on type
    const newOptions = { ...options };

    if (newS3Type === "new") {
      delete newOptions.s3existing;
    } else {
      delete newOptions.s3url;
      delete newOptions.s3bucket;
      delete newOptions.s3accesskey;
      delete newOptions.s3secretkey;

      // Set default bucket if available
      if (mockS3Buckets.length > 0) {
        newOptions.s3existing = mockS3Buckets[0].value;
      }
    }

    onOptionsChange(newOptions);
  };

  // Handle S3 field changes
  const handleS3FieldChange = (
    field: "s3url" | "s3bucket" | "s3accesskey" | "s3secretkey",
    value: string,
  ) => {
    onOptionsChange({
      ...options,
      [field]: value,
    });
  };

  // Handle existing S3 bucket selection
  const handleExistingS3Change = (value: string) => {
    onOptionsChange({
      ...options,
      s3existing: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Image Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Choose Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-3xl mx-auto">
            <p className="text-muted-foreground mb-4">
              Select the type of environment you want to use for your notebook.
            </p>

            <ImageSelector
              value={options.container_image}
              onChange={handleImageChange}
            />
            <FormError message={errors.image} />

            <div className="mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={options.ssh}
                  id="sshaccess"
                  onCheckedChange={handleSshChange}
                />
                <Label className="font-medium" htmlFor="sshaccess">
                  Enable SSH access to the notebook
                </Label>
              </div>
              <HelpText
                shortDescription="Allows direct terminal access to your notebook via SSH"
                tooltip={
                  <>
                    <p>
                      SSH access lets you connect to your notebook server from
                      your terminal using:
                    </p>
                    <code className="block bg-gray-100 p-2 my-2 rounded text-sm">
                      ssh jovyan@notebook-dns-domain
                    </code>
                    <p>This is useful for:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>File transfers using SCP or SFTP</li>
                      <li>Running terminal commands directly</li>
                      <li>Setting up port forwarding</li>
                    </ul>
                  </>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Resource Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-3xl mx-auto">
            <p className="text-muted-foreground mb-4">
              Specify the computing resources needed for your notebook. Each
              resource affects how your notebook will perform for different
              types of tasks.
            </p>

            <CardSection title="CPU">
              <FormField
                description="Select the number of CPU processing cores for your notebook"
                error={errors.cpu}
                id="cpu-selection"
                label="CPU Cores:"
                recommended={true}
                tooltip={
                  <>
                    <p className="font-medium">About CPU Cores</p>
                    <p className="mt-1">
                      CPU cores determine how many computational tasks your
                      notebook can handle simultaneously.
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>
                        <strong>1-2 cores:</strong> Good for basic data analysis
                        and lightweight notebooks
                      </li>
                      <li>
                        <strong>4-8 cores:</strong> Better for medium-sized
                        datasets and more complex calculations
                      </li>
                      <li>
                        <strong>16+ cores:</strong> Best for heavy parallel
                        processing tasks
                      </li>
                    </ul>
                    <p className="mt-2 italic text-muted-foreground">
                      {`Note: More cores don't always mean better performance for
                      all tasks.`}
                    </p>
                  </>
                }
              >
                <Select value={options.cpu} onValueChange={handleCpuChange}>
                  <SelectTrigger id="cpu-selection">
                    <SelectValue placeholder="Select CPU cores" />
                  </SelectTrigger>
                  <SelectContent>
                    {cpuOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </CardSection>

            <CardSection title="Memory">
              <FormField
                description="Select how much memory your notebook will have"
                error={errors.memory}
                id="memory-selection"
                label="Memory (RAM):"
                tooltip={
                  <>
                    <p className="font-medium">About Memory (RAM)</p>
                    <p className="mt-1">
                      Memory determines how much data your notebook can work
                      with at once.
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>
                        <strong>4-8 GB:</strong> Suitable for basic data
                        analysis with small datasets
                      </li>
                      <li>
                        <strong>16-32 GB:</strong> Good for medium-sized
                        datasets and most machine learning tasks
                      </li>
                      <li>
                        <strong>64+ GB:</strong> Best for large datasets that
                        need to be processed in memory
                      </li>
                    </ul>
                    <p className="mt-2 text-muted-foreground">
                      If your notebook runs out of memory, it may crash or slow
                      down significantly.
                    </p>
                  </>
                }
              >
                <Select value={options.mem} onValueChange={handleMemoryChange}>
                  <SelectTrigger id="memory-selection">
                    <SelectValue placeholder="Select memory amount" />
                  </SelectTrigger>
                  <SelectContent>
                    {memoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </CardSection>

            <CardSection title="GPU">
              <FormField
                description="Select GPU type for accelerated computing tasks"
                error={errors.gpu}
                id="gpu-selection"
                label="GPU Type:"
                tooltip={
                  <>
                    <p className="font-medium">About GPUs</p>
                    <p className="mt-1">
                      GPUs (Graphics Processing Units) significantly accelerate
                      certain computations, especially for:
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>Deep learning training and inference</li>
                      <li>Computer vision tasks</li>
                      <li>Large matrix operations</li>
                      <li>Complex simulations</li>
                    </ul>
                    <p className="mt-2">
                      <strong>MIG (Multi-Instance GPU):</strong> Allows sharing
                      a physical GPU among multiple users.
                    </p>
                    <p className="mt-2 text-blue-600 font-medium">
                      We recommend using MIG parts instead of whole GPUs when
                      possible to efficiently utilize resources.
                    </p>
                  </>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    disabled={gpuOptionsLoading}
                    value={options.gpu}
                    onValueChange={handleGpuChange}
                  >
                    <SelectTrigger id="gpu-selection">
                      <SelectValue
                        placeholder={
                          gpuOptionsLoading
                            ? "Loading GPU options..."
                            : "Select GPU type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {gpuOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {showMigAmount && (
                    <Select
                      value={options.migamount || "1"}
                      onValueChange={handleMigAmountChange}
                    >
                      <SelectTrigger id="mig-amount">
                        <SelectValue placeholder="Select MIG parts" />
                      </SelectTrigger>
                      <SelectContent>
                        {migAmountOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </FormField>

              {options.gpu !== "none" && (
                <div className="bg-blue-50 p-4 rounded-md mt-3 text-sm text-blue-700 border border-blue-200">
                  <p className="font-medium">GPU Request Guidelines</p>
                  <p className="mt-1">
                    We strongly advise requesting a GPU part instead of a whole
                    GPU due to limited resources. Inefficient use of whole GPUs
                    may result in restrictions on future requests.
                  </p>
                </div>
              )}
            </CardSection>
          </div>
        </CardContent>
      </Card>

      {/* Storage Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-3xl mx-auto">
            <p className="text-muted-foreground mb-4">
              Configure where and how your data will be stored. The right
              storage options ensure your work is preserved and accessible
              across notebook sessions.
            </p>
            <FormError message={errors.storage} />

            {/* Persistent Home */}
            <CardSection title="Persistent Home">
              <div className="space-y-4">
                <HelpText
                  recommended={true}
                  shortDescription="A persistent home directory keeps your files safe even when your notebook is deleted or restarted."
                  tooltip={
                    <>
                      <p className="font-medium">About Persistent Home</p>
                      <p className="mt-1">
                        When enabled, your notebook will have a permanent
                        storage area mounted at <code>/home/jovyan</code>.
                      </p>
                      <p className="mt-2">Benefits:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>
                          Your files remain safe even if your notebook server
                          crashes
                        </li>
                        <li>
                          Continue your work across different notebook sessions
                        </li>
                        <li>
                          Install custom packages that persist between restarts
                        </li>
                      </ul>
                    </>
                  }
                />

                <RadioGroup
                  className="space-y-3 mt-2"
                  value={phomeType}
                  onValueChange={handlePhomeTypeChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="phome-new" value="new" />
                    <Label className="font-medium" htmlFor="phome-new">
                      Create new persistent home
                    </Label>
                  </div>

                  {phomeType === "new" && (
                    <div className="ml-6 mt-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={options.phome === "delete"}
                          id="phome-delete"
                          onCheckedChange={handlePhomeDeleteChange}
                        />
                        <Label className="font-medium" htmlFor="phome-delete">
                          Erase if home already exists
                        </Label>
                      </div>
                      <HelpText
                        shortDescription="If checked, any existing home directory with the same name will be erased and recreated."
                        tooltip="Warning: This will permanently delete any existing data in a persistent home with the same name."
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="phome-existing" value="existing" />
                    <Label className="font-medium" htmlFor="phome-existing">
                      Use existing persistent home
                    </Label>
                  </div>

                  {phomeType === "existing" && (
                    <Alert variant={"destructive"}>
                      <AlertTitle>Feature not supported</AlertTitle>
                      <AlertDescription>
                        Selecting existing persistent home is not implemented
                      </AlertDescription>
                    </Alert>
                    // <FormField
                    //     className="ml-6 mt-3"
                    //     description="Choose from your previously created persistent home directories"
                    //     id="existing-phome"
                    //     label="Select existing persistent home:"
                    //     maxWidth="max-w-md"
                    // >
                    //     <Select
                    //         value={
                    //             typeof options.phome === "string" &&
                    //             options.phome !== "delete" &&
                    //             options.phome !== "remain"
                    //                 ? options.phome
                    //                 : undefined
                    //         }
                    //         onValueChange={handleExistingPhomeChange}
                    //     >
                    //         <SelectTrigger id="existing-phome">
                    //             <SelectValue placeholder="Select a persistent home" />
                    //         </SelectTrigger>
                    //         <SelectContent>
                    //             {mockPvcNames.map((pvc) => (
                    //                 <SelectItem key={pvc.value} value={pvc.value}>
                    //                     {pvc.label}
                    //                 </SelectItem>
                    //             ))}
                    //         </SelectContent>
                    //     </Select>
                    // </FormField>
                  )}
                </RadioGroup>
              </div>
            </CardSection>

            {/* MetaCentrum Home */}
            <CardSection title="MetaCentrum Storage Options">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={mountMetacentrumHome}
                    id="metacentrum-home"
                    onCheckedChange={handleMetacentrumHomeToggle}
                  />
                  <Label className="font-medium" htmlFor="metacentrum-home">
                    Mount MetaCentrum home directory
                  </Label>
                </div>
                <HelpText
                  shortDescription="Access your MetaCentrum home directory from within your notebook"
                  tooltip={
                    <>
                      <p>
                        When enabled, your MetaCentrum home directory will be
                        mounted at:
                      </p>
                      <code className="block bg-gray-100 p-2 my-2 rounded text-sm">
                        /home/meta/username
                      </code>
                      <p>
                        This gives you access to all your existing MetaCentrum
                        files without needing to copy them.
                      </p>
                    </>
                  }
                />

                {mountMetacentrumHome && (
                  <div className="ml-6 space-y-4 mt-2">
                    <FormField
                      description="Choose which MetaCentrum home to mount"
                      id="home-selection"
                      label="Select home storage:"
                      maxWidth="max-w-md"
                    >
                      <Select
                        value={options.home || undefined}
                        onValueChange={handleHomeChange}
                      >
                        <SelectTrigger id="home-selection">
                          <SelectValue placeholder="Select home storage" />
                        </SelectTrigger>
                        <SelectContent>
                          {homeOptions.map((home) => (
                            <SelectItem key={home.value} value={home.value}>
                              {home.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={!!options.mounttostorage}
                          id="location-storage-mount"
                          onCheckedChange={handleStorageLocationChange}
                        />
                        <Label
                          className="font-medium"
                          htmlFor="location-storage-mount"
                        >
                          Also mount to storage path
                        </Label>
                      </div>
                      <HelpText
                        shortDescription={
                          <span>
                            Mount MetaCentrum home to{" "}
                            <code className="text-xs">
                              /storage/[chosen_storage]/home/[meta_username]
                            </code>{" "}
                            as well
                          </span>
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={options.mountprojects}
                    id="project-mount"
                    onCheckedChange={handleMountProjectsChange}
                  />
                  <Label className="font-medium" htmlFor="project-mount">
                    Mount project directories
                  </Label>
                </div>
                <HelpText shortDescription="Access your MetaCentrum project directories from within your notebook" />
              </div>
            </CardSection>

            {/* S3 Storage */}
            <CardSection title="S3 Storage">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={mountS3}
                    id="s3-check"
                    onCheckedChange={handleS3Toggle}
                  />
                  <Label className="font-medium" htmlFor="s3-check">
                    Mount S3 bucket
                  </Label>
                </div>
                <HelpText
                  shortDescription="Connect to S3-compatible cloud storage for large datasets or shared files"
                  tooltip={
                    <>
                      <p className="font-medium">About S3 Storage</p>
                      <p className="mt-1">
                        S3 is a cloud storage protocol that allows you to store
                        and access large amounts of data:
                      </p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>
                          {`Ideal for large datasets that won't fit in your
                          notebook storage`}
                        </li>
                        <li>Access the same data from multiple notebooks</li>
                        <li>Share data with collaborators</li>
                        <li>
                          Works with any S3-compatible storage service (AWS S3,
                          MinIO, etc.)
                        </li>
                      </ul>
                    </>
                  }
                />

                {mountS3 && (
                  <div className="ml-6 mt-3 space-y-4">
                    <RadioGroup
                      className="space-y-3"
                      value={s3Type}
                      onValueChange={handleS3TypeChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="s3-new" value="new" />
                        <Label className="font-medium" htmlFor="s3-new">
                          Connect to new S3 bucket
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="s3-existing" value="existing" />
                        <Label className="font-medium" htmlFor="s3-existing">
                          Use existing S3 connection
                        </Label>
                      </div>
                    </RadioGroup>

                    {s3Type === "new" && (
                      <div className="space-y-4 mt-2">
                        <FormField
                          description="The endpoint URL of your S3 service"
                          id="s3-url"
                          label="S3 URL:"
                          maxWidth="max-w-md"
                          tooltip="For AWS S3, use https://s3.amazonaws.com or a regional endpoint"
                        >
                          <Input
                            id="s3-url"
                            placeholder="https://s3.amazonaws.com"
                            value={options.s3url || ""}
                            onChange={(e) =>
                              handleS3FieldChange("s3url", e.target.value)
                            }
                          />
                        </FormField>

                        <FormField
                          description="Name of the S3 bucket to connect to"
                          id="s3-bucket"
                          label="S3 Bucket:"
                          maxWidth="max-w-md"
                        >
                          <Input
                            id="s3-bucket"
                            placeholder="my-data-bucket"
                            value={options.s3bucket || ""}
                            onChange={(e) =>
                              handleS3FieldChange("s3bucket", e.target.value)
                            }
                          />
                        </FormField>

                        <FormField
                          description="Your S3 access key credential"
                          id="s3-access-key"
                          label="Access Key:"
                          maxWidth="max-w-md"
                        >
                          <Input
                            id="s3-access-key"
                            value={options.s3accesskey || ""}
                            onChange={(e) =>
                              handleS3FieldChange("s3accesskey", e.target.value)
                            }
                          />
                        </FormField>

                        <FormField
                          description="Your S3 secret key credential"
                          id="s3-secret-key"
                          label="Secret Key:"
                          maxWidth="max-w-md"
                          tooltip="This sensitive information is securely stored and will only be used to connect to your S3 bucket"
                        >
                          <Input
                            id="s3-secret-key"
                            type="password"
                            value={options.s3secretkey || ""}
                            onChange={(e) =>
                              handleS3FieldChange("s3secretkey", e.target.value)
                            }
                          />
                        </FormField>
                      </div>
                    )}

                    {s3Type === "existing" && (
                      <FormField
                        className="mt-2"
                        description="Choose from your previously configured S3 connections"
                        id="s3-existing-bucket"
                        label="Select existing S3 connection:"
                        maxWidth="max-w-md"
                      >
                        <Select
                          value={options.s3existing}
                          onValueChange={handleExistingS3Change}
                        >
                          <SelectTrigger id="s3-existing-bucket">
                            <SelectValue placeholder="Select an S3 bucket" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockS3Buckets.map((bucket) => (
                              <SelectItem
                                key={bucket.value}
                                value={bucket.value}
                              >
                                {bucket.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    )}
                  </div>
                )}
              </div>
            </CardSection>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
