import React, { useEffect, useState } from "react";
import {
  BarChart,
  Calculator,
  CheckCircle,
  Cloud,
  Code,
  Cpu,
  Dna,
  HardDrive,
  Loader2,
  MemoryStick,
  Server,
  XCircle,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { ImageSelector } from "@/components/hub/ImageSelector";
import { resourcePresets, ServerPreset } from "@/config/presets";
import { JupyterHubServerOptions } from "@/services/client/jupyterHub";
import { hubConfig } from "@/config/hub";
import {
  cpuOptions,
  homeOptions,
  memoryOptions,
  mockPvcNames,
  mockS3Buckets,
} from "@/config/hub/jupyterOptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { CardSection } from "@/components/ui/card-section";
import { getAllocatableGPUS } from "@/api/prometheus/prometheusApiClient";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SelectionCard,
  SelectionCardGrid,
} from "@/components/hub/settings/cardSelection";

interface OptionsComponentInterface {
  options: Partial<JupyterHubServerOptions>;
  setOptions: React.Dispatch<
    React.SetStateAction<Partial<JupyterHubServerOptions>>
  >;
}

// Icon mapping
const iconMap = {
  code: Code,
  "bar-chart": BarChart,
  cpu: Cpu,
  calculator: Calculator,
  cloud: Cloud,
  dna: Dna,
};

interface ResourcePresetCardProps {
  preset: ServerPreset;
  selected: boolean;
  onClick: () => void;
}

export function ResourcePresetCard({
  preset,
  selected,
  onClick,
}: ResourcePresetCardProps) {
  return (
    <SelectionCard selected={selected} onClick={onClick}>
      <CardContent className="p-4 space-y-2">
        <h4
          className={cn(
            "font-medium text-lg transition-colors duration-200",
            selected ? "text-primary" : "text-gray-900",
          )}
        >
          {preset.name}
        </h4>
        <p
          className={cn(
            "text-sm transition-colors duration-200",
            selected ? "text-primary/70" : "text-muted-foreground",
          )}
        >
          {preset.description}
        </p>

        <div className="pt-2">
          <div className="flex space-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center text-sm transition-colors duration-200",
                    selected ? "text-primary" : "text-gray-600",
                  )}
                >
                  <Cpu className="h-4 w-4 mr-1" />
                  <span>{preset.options.cpu} CPU</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>CPU cores</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center text-sm transition-colors duration-200",
                    selected ? "text-primary" : "text-gray-600",
                  )}
                >
                  <MemoryStick className="h-4 w-4 mr-1" />
                  <span>{preset.options.mem} GB</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Memory allocation</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center text-sm transition-colors duration-200",
                    selected ? "text-primary" : "text-gray-600",
                  )}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  <span>
                    {preset.options.gpu === "none" ? "No GPU" : `GPU`}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {preset.options.gpu === "none"
                    ? "No GPU acceleration"
                    : `GPU: ${preset.options.gpu}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>

      {/* Selected overlay effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10",
          "transition-opacity duration-300",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
    </SelectionCard>
  );
}

export const SimpleImageCards = ({
  selected,
  image,
  onClick,
}: {
  selected: boolean;
  image?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tags: string[];
    options: Partial<JupyterHubServerOptions>;
  };
  onClick?: () => void;
}) => {
  if (!image) return null;

  const IconComponent = iconMap[image.icon as keyof typeof iconMap] || Code;

  return (
    <SelectionCard selected={selected} onClick={onClick}>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className="h-5 w-5 text-primary" />
          <h4 className="font-medium text-lg">{image.name}</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {image.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {image.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex justify-end" />
      </CardContent>
    </SelectionCard>
  );
};

export const SimpleStatus = ({ isSimple }: { isSimple: boolean }) => {
  return <>{isSimple ? <div>Simple</div> : <div>Advanced</div>}</>;
};

export const ImageSettingsSimple = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  // Handle selection of an image card with toggle functionality
  const handleSelectImage = (
    image: (typeof hubConfig.simpleOptions.image)[0],
  ) => {
    if (
      options.container_image &&
      image.options.container_image === options.container_image
    ) {
      const { container_image, ...restOptions } = options;

      setOptions(restOptions);
    } else {
      setOptions({
        ...options,
        container_image: image.options.container_image,
      });
    }
  };

  const selectedPresetImage = hubConfig.simpleOptions.image.find((img) => {
    return img.options.container_image === options.container_image;
  });

  // Determine which images to show
  const getVisibleImages = () => {
    return hubConfig.simpleOptions.image;
  };

  const visibleImages = getVisibleImages();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Select a pre-configured notebook environment. Click again to
            unselect.
          </p>
        </div>
      </div>
      <SelectionCardGrid
        cards={(() => {
          // Find the selected image
          const selectedImage = visibleImages.find(
            (image) =>
              selectedPresetImage !== undefined &&
              image.id === selectedPresetImage?.id,
          );

          // Get all other images
          const otherImages = visibleImages.filter(
            (image) =>
              !(
                selectedPresetImage !== undefined &&
                image.id === selectedPresetImage?.id
              ),
          );

          // Put selected image first, then others
          const orderedImages = selectedImage
            ? [selectedImage, ...otherImages]
            : visibleImages;

          return orderedImages.map((image) => (
            <SimpleImageCards
              key={image.id}
              image={image}
              selected={
                selectedPresetImage !== undefined &&
                image.id === selectedPresetImage?.id
              }
              onClick={() => handleSelectImage(image)}
            />
          ));
        })()}
        customCard={
          options.container_image && !selectedPresetImage ? (
            <SelectionCard
              selected={true}
              onClick={() => {
                setOptions((prevState) => {
                  const { container_image, ...rest } = prevState;

                  return rest;
                });
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-5 w-5 text-primary" />
                  <h4 className="font-medium text-lg">Custom Image</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your custom container image
                </p>
                <div className="text-xs bg-secondary px-2 py-1 rounded break-all mb-3">
                  {options.container_image}
                </div>
              </CardContent>
            </SelectionCard>
          ) : undefined
        }
        isCardSelected={selectedPresetImage !== undefined}
      />
    </div>
  );
};

export const ImageSettingsAdvanced = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  const handleImageChange = (imagePath: string) => {
    setOptions({
      ...options,
      container_image: imagePath,
    });
  };

  return (
    <div>
      <ImageSelector
        value={options.container_image}
        onChangeImageAction={handleImageChange}
      />
    </div>
  );
};

export const ImageSettings = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  const [isSimple, setIsSimple] = useState(true);

  // Toggle SSH access
  const handleSshChange = (checked: boolean) => {
    setOptions({
      ...options,
      ssh: checked,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Choose Image
          <Switch
            checked={!isSimple}
            onCheckedChange={() => setIsSimple(!isSimple)}
          />
          <SimpleStatus isSimple={isSimple} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSimple ? (
          <ImageSettingsSimple options={options} setOptions={setOptions} />
        ) : (
          <ImageSettingsAdvanced options={options} setOptions={setOptions} />
        )}
        <CardSection className={"mt-4"} title={"Enable SSH Access"}>
          <div className="mt-4 flex items-center gap-2">
            <Switch
              checked={!!options.ssh}
              id="sshaccess"
              onCheckedChange={handleSshChange}
            />
            <label className="cursor-pointer" htmlFor="sshaccess">
              SSH access
            </label>
          </div>
        </CardSection>
      </CardContent>
    </Card>
  );
};

export const ResourceSettingsAdvanced = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  // Track GPU-specific state to show/hide MIG amount selector
  const [showMigAmount, setShowMigAmount] = useState(false);

  //
  // // Track available GPU options
  // const [gpuOptions, setGpuOptions] = useState<
  //   Array<{ value: string; label: string }>
  // >([
  //   { value: "none", label: "None" },
  //   { value: "mig-1g.10gb", label: "10GB part A100" },
  //   { value: "mig-2g.20gb", label: "20GB part A100" },
  //   { value: "a10", label: "Whole A10" },
  //   { value: "a40", label: "Whole A40" },
  // ]);
  //
  // // Set up effect to handle GPU MIG amount visibility
  useEffect(() => {
    setShowMigAmount(!!options.gpu?.startsWith("mig"));
  }, [options.gpu]);

  // Handle CPU change
  const handleCpuChange = (value: string) => {
    setOptions({
      ...options,
      cpu: value,
    });
  };

  // Handle memory change
  const handleMemoryChange = (value: string) => {
    setOptions({
      ...options,
      mem: value,
      shmsize: value, // Set shared memory size equal to memory
    });
  };

  // // Handle GPU change
  // const handleGpuChange = (value: string) => {
  //   const newOptions = { ...options, gpu: value };
  //
  //   // Clear migamount if not needed
  //   if (!value.startsWith("mig")) {
  //     delete newOptions.migamount;
  //   } else if (!newOptions.migamount) {
  //     // Default to 1 if selecting a MIG GPU
  //     newOptions.migamount = "1";
  //   }
  //
  //   setOptions(newOptions);
  // };
  //

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">
          Configure computing resources
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Customize CPU, memory, and GPU resources for your specific workload
        </p>
      </div>

      <div className="space-y-6">
        {/* CPU Selection */}
        <div className="space-y-2">
          <Label htmlFor="cpu-selection">CPU Cores:</Label>
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
          <p className="text-sm text-muted-foreground">
            CPU cores determine how many computational tasks your notebook can
            handle simultaneously
          </p>
        </div>

        {/* Memory Selection */}
        <div className="space-y-2">
          <Label htmlFor="memory-selection">Memory (RAM):</Label>
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
          <p className="text-sm text-muted-foreground">
            Memory determines how much data your notebook can work with at once
          </p>
        </div>
      </div>
    </div>
  );
};

export const ResourceSettingsSimple = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  const [selectedPresetId, setSelectedPresetId] = useState<
    string | undefined
  >();

  // Initialize selected preset when component mounts
  useEffect(() => {
    // Try to find a preset that matches current options
    const matchingPreset = resourcePresets.find(
      (preset) =>
        preset.options.cpu === options.cpu &&
        preset.options.mem === options.mem &&
        preset.options.gpu === options.gpu,
    );

    if (matchingPreset) {
      setSelectedPresetId(matchingPreset.id);
    } else {
      setSelectedPresetId(undefined);
    }
  }, [options]);

  // Handle preset selection
  const handleSelectPreset = (preset: ServerPreset) => {
    // Check if preset is already selected
    const isSelected = selectedPresetId === preset.id;

    // Toggle selection if clicking on the same preset
    if (isSelected) {
      setSelectedPresetId(undefined);
      setOptions((prev) => {
        const { cpu, mem, gpu, shmsize, ...rest } = prev;

        return rest;
      });
    } else {
      setSelectedPresetId(preset.id);
      // Update options with preset values
      setOptions({
        ...options,
        ...preset.options,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">
          Choose resource configuration
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a pre-configured resource profile for your notebook
        </p>
      </div>
      {/*//TODO too slow memo or alt*/}
      <SelectionCardGrid
        cards={(() => {
          // Find the selected preset
          const selectedPreset = resourcePresets.find(
            (preset) => preset.id === selectedPresetId,
          );

          // Get all other presets
          const otherPresets = resourcePresets.filter(
            (preset) => preset.id !== selectedPresetId,
          );

          // Put selected preset first, then others
          const orderedPresets = selectedPreset
            ? [selectedPreset, ...otherPresets]
            : resourcePresets;

          return orderedPresets.map((preset) => (
            <ResourcePresetCard
              key={preset.id}
              preset={preset}
              selected={preset.id === selectedPresetId}
              onClick={() => handleSelectPreset(preset)}
            />
          ));
        })()}
        customCard={
          !selectedPresetId && options.cpu && options.mem ? (
            <SelectionCard
              selected={true}
              onClick={() => {
                setOptions((prev) => {
                  const { cpu, mem, shmsize, ...rest } = prev;

                  return rest;
                });
              }}
            >
              <CardContent className="p-4 space-y-2">
                <h4
                  className={cn(
                    "font-medium text-lg transition-colors duration-200",
                    "text-primary",
                  )}
                >
                  Custom
                </h4>
                <p
                  className={cn(
                    "text-sm transition-colors duration-200",
                    "text-primary/70",
                  )}
                >
                  Cuatom resource configuration
                </p>

                <div className="pt-2">
                  <div className="flex space-x-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center text-sm transition-colors duration-200",
                            "text-primary",
                          )}
                        >
                          <Cpu className="h-4 w-4 mr-1" />
                          <span>{options.cpu} CPU</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>CPU cores</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center text-sm transition-colors duration-200",
                            "text-primary",
                          )}
                        >
                          <MemoryStick className="h-4 w-4 mr-1" />
                          <span>{options.mem} GB</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Memory allocation</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center text-sm transition-colors duration-200",
                            "text-primary",
                          )}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          <span>
                            {options.gpu === undefined || options.gpu === "none"
                              ? "No GPU"
                              : `GPU`}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {options?.gpu === "none"
                            ? "No GPU acceleration"
                            : `GPU: ${options.gpu}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </SelectionCard>
          ) : undefined
        }
        isCardSelected={selectedPresetId !== undefined}
      />
    </div>
  );
};

export function GpuSelector({
  options,
  setOptions,
}: OptionsComponentInterface) {
  const [gpuNames, setGpuNames] = React.useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["allocatable-gpus"],
    queryFn: () => {
      return getAllocatableGPUS();
    },
    refetchInterval: 3000000, // Refetch every 30 seconds
  });

  const valueFromNames = (name: string) => {
    const parts = name.split(" ").map((str) => str.toLowerCase());

    const migPart = parts.find((str) => str.includes("g."));

    if (migPart) {
      return "mig-" + migPart;
    }

    const aPart = parts.find((str) => str.startsWith("a"));

    if (aPart) {
      return aPart;
    }

    const hPart = parts.find((str) => str.startsWith("h"));

    if (hPart) return hPart;

    return parts[0];
  };

  // Update gpuNames when data changes
  React.useEffect(() => {
    if (data) {
      const gpus: Record<string, string> = { none: "none" };

      const names = Object.keys(data);

      // Create gpuName: gpuName record
      names.forEach((name) => {
        gpus[name] = name;
      });

      setGpuNames(gpus);
    }
  }, [data]);

  const handleGpuChange = (value: string) => {
    if (value.startsWith("mig")) {
      setOptions((prev) => ({
        ...prev,
        gpu: value,
        migamount: "1",
      }));
    } else {
      setOptions((prev) => ({ ...prev, gpu: value }));
    }
  };

  return (
    <div>
      <p className="text-muted-foreground mb-3">
        Select the GPU type for your notebook environment.
      </p>
      <div className="flex items-center gap-2">
        <Select
          disabled={
            isLoading ||
            error !== null ||
            !data ||
            Object.keys(data).length === 0
          }
          value={options.gpu || "none"}
          onValueChange={handleGpuChange}
        >
          <SelectTrigger className="w-full flex">
            <SelectValue
              placeholder={
                isLoading ? "Loading ..." : error ? "" : "Select GPU"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {Object.entries(gpuNames)
              .filter(([key]) => key !== "none")
              .map(([gpuName, gpuValue]) => (
                <SelectItem key={gpuName} value={valueFromNames(gpuValue)}>
                  {gpuName} ({data?.[gpuName] || 0} available)
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : error ? (
          <XCircle className="h-4 w-4 text-red-500" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
      </div>
    </div>
  );
}

export const ResourceSettings = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  const [isSimple, setIsSimple] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Choose Resources
          <Switch
            checked={!isSimple}
            onCheckedChange={() => setIsSimple(!isSimple)}
          />
          <SimpleStatus isSimple={isSimple} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSimple ? (
          <ResourceSettingsSimple options={options} setOptions={setOptions} />
        ) : (
          <ResourceSettingsAdvanced options={options} setOptions={setOptions} />
        )}
        <CardSection title={"Gpu:"}>
          <GpuSelector options={options} setOptions={setOptions} />
        </CardSection>
      </CardContent>
    </Card>
  );
};

export const StorageSettingPhome = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  // Persistent Home state
  const [isPersistentHomeEnabled, setIsPersistentHomeEnabled] = useState(false);
  const [phomeType, setPhomeType] = useState<"new" | "existing">(
    options.phome === "delete" || options.phome === "remain"
      ? "new"
      : "existing",
  );

  // Handle Persistent Home toggle
  const handlePersistentHomeToggle = (enabled: boolean) => {
    setIsPersistentHomeEnabled(enabled);
  };

  // Handle persistent home type change
  const handlePhomeTypeChange = (value: string) => {
    const newPhomeType = value as "new" | "existing";

    setPhomeType(newPhomeType);

    if (newPhomeType === "new") {
      setOptions({
        ...options,
        phome: "remain", // Default to "remain" for new phome
      });
    } else if (mockPvcNames.length > 0) {
      // For existing, select the first PVC if available
      setOptions({
        ...options,
        phome: mockPvcNames[0].value,
      });
    }
  };

  // Handle phome delete option change
  const handlePhomeDeleteChange = (checked: boolean) => {
    setOptions({
      ...options,
      phome: checked ? "delete" : "remain",
    });
  };

  return (
    <CollapsibleCard
      description="Keep your files safe between notebook sessions"
      icon={<HardDrive className="h-4 w-4" />}
      isEnabled={isPersistentHomeEnabled}
      title={
        options.phome === "remain"
          ? "Persistent Home (default)"
          : "Persistent Home (changed)"
      }
      onToggle={handlePersistentHomeToggle}
    >
      <div className="space-y-4 mt-2">
        <RadioGroup
          className="space-y-3"
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
              <p className="text-xs text-muted-foreground mt-1">
                If checked, any existing home directory with the same name will
                be erased and recreated.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/*//TODO*/}
            <RadioGroupItem
              disabled={true}
              id="phome-existing"
              value="existing"
            />
            <Label
              className="font-medium text-infra-text-secondary"
              htmlFor="phome-existing"
            >
              Use existing persistent home (Feature not available yet)
            </Label>
          </div>

          {phomeType === "existing" && (
            <div className="ml-6 mt-3">
              <Label className="text-sm mb-1 block">
                Select existing persistent home:
              </Label>
              <Select
                value={
                  typeof options.phome === "string" &&
                  options.phome !== "delete" &&
                  options.phome !== "remain"
                    ? options.phome
                    : undefined
                }
                onValueChange={(value) => {
                  setOptions({
                    ...options,
                    phome: value,
                  });
                }}
              >
                <SelectTrigger id="existing-phome">
                  <SelectValue placeholder="Select a persistent home" />
                </SelectTrigger>
                <SelectContent>
                  {mockPvcNames.map((pvc) => (
                    <SelectItem key={pvc.value} value={pvc.value}>
                      {pvc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </RadioGroup>
      </div>
    </CollapsibleCard>
  );
};

export const StorageSettings = ({
  options,
  setOptions,
}: OptionsComponentInterface) => {
  // MetaCentrum Home state
  const [isMetacentrumHomeEnabled, setIsMetacentrumHomeEnabled] = useState(
    !!options.home,
  );

  // S3 Storage state
  const [isS3Enabled, setIsS3Enabled] = useState(
    !!options.s3url || !!options.s3existing,
  );
  const [s3Type, setS3Type] = useState<"new" | "existing">(
    options.s3url ? "new" : "existing",
  );

  // Handle MetaCentrum Home toggle
  const handleMetacentrumHomeToggle = (enabled: boolean) => {
    setIsMetacentrumHomeEnabled(enabled);
    if (enabled && homeOptions.length > 0) {
      // Set default home when enabling
      setOptions({
        ...options,
        home: homeOptions[0].value,
      });
    } else {
      // Clear home when disabling
      const newOptions = { ...options };

      newOptions.home = null;
      delete newOptions.mounttostorage;
      setOptions(newOptions);
    }
  };

  // Handle home selection change
  const handleHomeChange = (value: string) => {
    setOptions({
      ...options,
      home: value,
    });
  };

  // Handle storage location mount change
  const handleStorageLocationChange = (checked: boolean) => {
    setOptions({
      ...options,
      mounttostorage: checked,
    });
  };

  // Handle project directories toggle
  const handleMountProjectsChange = (checked: boolean) => {
    setOptions({
      ...options,
      mountprojects: checked,
    });
  };

  // Handle S3 toggle
  const handleS3Toggle = (enabled: boolean) => {
    setIsS3Enabled(enabled);
    if (enabled) {
      // Default to new S3 when enabling
      setS3Type("new");
      setOptions({
        ...options,
        s3url: "",
        s3bucket: "",
      });
    } else {
      // Clear S3 settings when disabling
      const newOptions = { ...options };

      delete newOptions.s3url;
      delete newOptions.s3bucket;
      delete newOptions.s3accesskey;
      delete newOptions.s3secretkey;
      delete newOptions.s3existing;
      setOptions(newOptions);
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
      newOptions.s3url = "";
      newOptions.s3bucket = "";
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

    setOptions(newOptions);
  };

  // Handle S3 field changes
  const handleS3FieldChange = (
    field: "s3url" | "s3bucket" | "s3accesskey" | "s3secretkey",
    value: string,
  ) => {
    setOptions({
      ...options,
      [field]: value,
    });
  };

  // Handle existing S3 bucket selection
  const handleExistingS3Change = (value: string) => {
    setOptions({
      ...options,
      s3existing: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StorageSettingPhome options={options} setOptions={setOptions} />

        {/* MetaCentrum Home Section */}
        <CollapsibleCard
          description="Access your MetaCentrum home and project directories"
          icon={<Server className="h-4 w-4" />}
          isEnabled={isMetacentrumHomeEnabled}
          isSwitch={true}
          title="MetaCentrum Storage"
          onToggle={handleMetacentrumHomeToggle}
        >
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="home-selection">Select home storage:</Label>
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
              <p className="text-xs text-muted-foreground">
                Choose which MetaCentrum home to mount
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={!!options.mounttostorage}
                  id="location-storage-mount"
                  onCheckedChange={handleStorageLocationChange}
                />
                <Label className="font-medium" htmlFor="location-storage-mount">
                  Also mount to storage path
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Mount MetaCentrum home to{" "}
                <code className="text-xs">
                  /storage/[chosen_storage]/home/[meta_username]
                </code>{" "}
                as well
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={!!options.mountprojects}
                  id="project-mount"
                  onCheckedChange={handleMountProjectsChange}
                />
                <Label className="font-medium" htmlFor="project-mount">
                  Mount project directories
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Access your MetaCentrum project directories from within your
                notebook
              </p>
            </div>
          </div>
        </CollapsibleCard>

        {/* S3 Storage Section */}
        <CollapsibleCard
          description="Connect to S3-compatible cloud storage"
          icon={<Cloud className="h-4 w-4" />}
          isEnabled={isS3Enabled}
          isSwitch={true}
          title="S3 Storage"
          onToggle={handleS3Toggle}
        >
          <div className="space-y-4 mt-2">
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

              {s3Type === "new" && (
                <div className="ml-6 space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="s3-url">S3 URL:</Label>
                    <Input
                      id="s3-url"
                      placeholder="https://s3.amazonaws.com"
                      value={options.s3url || ""}
                      onChange={(e) =>
                        handleS3FieldChange("s3url", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      The endpoint URL of your S3 service
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="s3-bucket">S3 Bucket:</Label>
                    <Input
                      id="s3-bucket"
                      placeholder="my-data-bucket"
                      value={options.s3bucket || ""}
                      onChange={(e) =>
                        handleS3FieldChange("s3bucket", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Name of the S3 bucket to connect to
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="s3-access-key">Access Key:</Label>
                    <Input
                      id="s3-access-key"
                      value={options.s3accesskey || ""}
                      onChange={(e) =>
                        handleS3FieldChange("s3accesskey", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Your S3 access key credential
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="s3-secret-key">Secret Key:</Label>
                    <Input
                      id="s3-secret-key"
                      type="password"
                      value={options.s3secretkey || ""}
                      onChange={(e) =>
                        handleS3FieldChange("s3secretkey", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Your S3 secret key credential (securely stored)
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <RadioGroupItem id="s3-existing" value="existing" />
                <Label className="font-medium" htmlFor="s3-existing">
                  Use existing S3 connection
                </Label>
              </div>

              {s3Type === "existing" && (
                <div className="ml-6 mt-3">
                  <Label className="text-sm mb-1 block">
                    Select existing S3 connection:
                  </Label>
                  <Select
                    value={options.s3existing}
                    onValueChange={handleExistingS3Change}
                  >
                    <SelectTrigger id="s3-existing-bucket">
                      <SelectValue placeholder="Select an S3 bucket" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockS3Buckets.map((bucket) => (
                        <SelectItem key={bucket.value} value={bucket.value}>
                          {bucket.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </RadioGroup>
          </div>
        </CollapsibleCard>
      </CardContent>
    </Card>
  );
};
