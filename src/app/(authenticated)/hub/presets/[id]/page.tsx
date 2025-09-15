"use client"
import { useEffect, useState } from "react";
import { fetchNotebookPresetById, updateNotebookPreset } from '@/services/client/notebookPresets';
import { useParams } from 'next/navigation';
import { Loading } from "@/components/ui/loading";
import { NotebookPreset } from "@/db/notebooksPresetsRepository";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { ImageSettings, ResourceSettings, StorageSettings } from "@/components/hub/settings/simpleSettings";

export default function PresetDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [preset, setPreset] = useState<NotebookPreset | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Editable fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState<any>(null);

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
        // TODO: call updateNotebookPreset API
        await updateNotebookPreset(Number(id?.toString()), {name, description, serverOptions: options });
    };

    const handleDelete = async () => {
        // TODO: call deleteNotebookPreset API
        // await deleteNotebookPreset(id);
    };

    return (
        <div>
            <h1 className="text-xl font-bold mb-2">Preset: {preset.name}</h1>
            <div>Preset ID: {id}</div>

            <div className="my-4">
                <label className="block font-medium mb-1" htmlFor="preset-name">Name</label>
                <Input
                    id="preset-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mb-2"
                />
                <label className="block font-medium mb-1" htmlFor="preset-description">Description</label>
                <Input
                    id="preset-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            <ImageSettings options={options} setOptions={setOptions} />
            <ResourceSettings options={options} setOptions={setOptions} />
            <StorageSettings options={options} setOptions={setOptions} />

            <div className="flex gap-2 mt-6">
                <Button onClick={handleSave}>Save changes</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete preset</Button>
            </div>
        </div>
    );
}