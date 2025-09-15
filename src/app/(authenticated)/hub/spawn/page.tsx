"use client";

import { useRouter } from "next/navigation";
import { Settings, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { quickstartServerPresets } from "@/config/quickpresets";
import {
  CustomPresetCard,
  QuickPresetCard,
} from "@/components/hub/presetCards";
import { fetchNotebookPresets } from "@/services/client/notebookPresets";
import { PresetCards } from "@/components/ui/preset-cards";

export default function SpawnSelection() {
  const router = useRouter();

  const { data: userPresets, isLoading } = useQuery({
    queryKey: ["presets"],
    queryFn: () => fetchNotebookPresets(),
  });

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
      <section aria-label="Quickstart presets" className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-infra-primary/10 rounded-lg">
            <Zap className="h-5 w-5 text-infra-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-infra-text-primary">
              Quick Start Presets
            </h2>
            <p className="text-sm text-infra-text-secondary">
              Pre-configured environments ready to launch
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
      </section>

      {/* User Presets Section */}
      <section aria-label="User presets" className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-infra-primary/10 rounded-lg">
            <Settings className="h-5 w-5 text-infra-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-infra-text-primary">
              Custom Presets
            </h2>
            <p className="text-sm text-infra-text-secondary">
              Your saved configurations for quick access
            </p>
          </div>
        </div>

        <PresetCards
          isLoading={isLoading}
          presets={userPresets || []}
          onPresetClick={(id) => router.push(`/hub/presets/${id}`)}
        />
      </section>
    </div>
  );
}
