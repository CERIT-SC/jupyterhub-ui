"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  fetchNotebookPresetById,
  updateNotebookPreset,
} from "@/services/client/notebookPresets";
import { Loading, LoadingOverlay } from "@/components/ui/loading";
import { NotebookPreset } from "@/db/notebooksPresetsRepository";
import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  ImageSettings,
  ResourceSettings,
  StorageSettings,
} from "@/components/hub/settings/simpleSettings";

export default function PresetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [preset, setPreset] = useState<NotebookPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<any>(null);

  // Saving state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchNotebookPresetById(Number(id))
      .then((data) => {
        setPreset(data);
        setName(data?.name || "");
        setDescription(data?.description || "");
        setOptions(data?.serverOptions || {});
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.message || "Failed to fetch preset.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loading />
      </div>
    );
  }

  if (error || !preset) {
    return (
      <div className="text-red-500 text-center mt-8">
        {error || "Preset not found."}
      </div>
    );
  }

  // Save and delete handlers (implement as needed)
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotebookPreset(Number(id?.toString()), {
        name,
        description,
        serverOptions: options,
      });
    } finally {
      setSaving(false);
      router.push("/hub/presets"); // Navigate back to presets list after saving
    }
  };

  const handleDelete = async () => {
    // TODO: call deleteNotebookPreset API
    // await deleteNotebookPreset(id);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <h1 className="text-xl font-bold mb-2">Preset: {preset.name}</h1>
      <div>Preset ID: {id}</div>

      <div className="flex flex-col gap-4">
        <div className="my-4">
          <label
            className="block font-medium mb-1"
            htmlFor="preset-description"
          >
            Description
          </label>
          <Input
            id="preset-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <ImageSettings options={options} setOptions={setOptions} />
        <ResourceSettings options={options} setOptions={setOptions} />
        <StorageSettings options={options} setOptions={setOptions} />

        <div className="flex gap-2 mt-6 justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete preset
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? <Loading className="w-4 h-4 mr-2" /> : null}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
      {saving && <LoadingOverlay />}
    </div>
  );
}
