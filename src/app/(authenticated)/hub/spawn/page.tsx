"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

import { quickstartServerPresets } from "@/config/quickpresets";
import {
  CustomPresetCard,
  QuickPresetCard,
} from "@/components/hub/presetCards";

export default function SpawnSelection() {
  const router = useRouter();

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
            <QuickPresetCard key={preset.id} preset={preset} />
          ))}

          {/* Custom Configuration Card */}
          <CustomPresetCard onConfigure={handleCustomConfigure} />
        </div>
      </div>
    </div>
  );
}
