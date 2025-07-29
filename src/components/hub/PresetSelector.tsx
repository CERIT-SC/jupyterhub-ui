import React from "react";
import { Cpu, MemoryStick, Zap } from "lucide-react";

import { ServerPreset, serverPresets } from "@/config/presets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PresetSelectorProps {
  onSelectPreset: (preset: ServerPreset) => void;
  selectedPresetId?: string;
}

export function PresetSelector({
  onSelectPreset,
  selectedPresetId,
}: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Quick Options</h3>
      <p className="text-sm text-muted-foreground">
        Select a preset configuration or customize below
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {serverPresets.map((preset) => (
          <Card
            key={preset.id}
            className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedPresetId === preset.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => onSelectPreset(preset)}
          >
            <CardContent className="p-4 space-y-2">
              <h4 className="font-medium text-lg">{preset.name}</h4>
              <p className="text-sm text-muted-foreground">
                {preset.description}
              </p>
              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm">
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
                      <div className="flex items-center text-sm">
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
                      <div className="flex items-center text-sm">
                        <Zap className="h-4 w-4 mr-1" />
                        <span>
                          {preset.options.gpu === "none"
                            ? "No GPU"
                            : `${preset.options.gpu} GPU`}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>GPU allocation</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  className="text-xs"
                  size="sm"
                  variant={
                    selectedPresetId === preset.id ? "primary" : "outline"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPreset(preset);
                  }}
                >
                  {selectedPresetId === preset.id ? "Selected" : "Select"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
