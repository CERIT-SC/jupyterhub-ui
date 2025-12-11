import React from "react";
import { Cpu, MemoryStick, Zap } from "lucide-react";

import { ServerPreset, quickstartServerPresets } from "@/config/presets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PresetSelectorProps {
  onSelectPreset: (preset: ServerPreset) => void;
  selectedPresetId?: string;
}

export function PresetSelector({ onSelectPreset, selectedPresetId }: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Quick Options</h3>
      <p className="text-muted-foreground text-sm">Select a preset configuration or customize below</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickstartServerPresets.map((preset) => (
          <Card
            key={preset.id}
            className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${selectedPresetId === preset.id ? "ring-primary ring-2" : ""}`}
            onClick={() => onSelectPreset(preset)}
          >
            <CardContent className="space-y-2 p-4">
              <h4 className="text-lg font-medium">{preset.name}</h4>
              <p className="text-muted-foreground text-sm">{preset.description}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm">
                        <Cpu className="mr-1 h-4 w-4" />
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
                        <MemoryStick className="mr-1 h-4 w-4" />
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
                        <Zap className="mr-1 h-4 w-4" />
                        <span>{preset.options.gpu === "none" ? "No GPU" : `${preset.options.gpu} GPU`}</span>
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
                  variant={selectedPresetId === preset.id ? "primary" : "outline"}
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
