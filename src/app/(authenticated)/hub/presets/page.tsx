"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createNotebookPreset,
  fetchNotebookPresets,
} from "@/services/client/notebookPresets";
import { PresetCards } from "@/components/ui/preset-cards";

export default function PresetsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creatingPreset, setCreatingPreset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: presets, isLoading } = useQuery({
    queryKey: ["presets"],
    queryFn: () => fetchNotebookPresets(),
  });

  async function handleCreate() {
    setCreatingPreset(true);
    setError(null);
    try {
      const preset = await createNotebookPreset({ name });

      if (preset && preset.id) {
        setOpen(false);
        setName("");
        router.push(`/hub/presets/${preset.id}`);
      } else {
        setError("Failed to create preset.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to create preset.");
    } finally {
      setCreatingPreset(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notebook Presets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Create Preset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="Enter preset name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
            <DialogFooter>
              <Button disabled={!name || creatingPreset} onClick={handleCreate}>
                {creatingPreset ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <PresetCards
        isLoading={isLoading}
        presets={presets}
        onPresetClick={(id) => router.push(`/hub/presets/${id}`)}
      />
    </div>
  );
}
