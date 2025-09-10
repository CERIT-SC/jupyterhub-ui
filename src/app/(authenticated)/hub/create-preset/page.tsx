"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { JupyterHubServerOptions } from "@/services/client/jupyterHub";
import { Button } from "@/components/ui/button";
import { StorageSettings, ResourceSettings, ImageSettings } from "@/components/hub/settings/simpleSettings";

export default function CreatePresetPage() {
    const [presetName, setPresetName] = useState("");
    const [presetDescription, setPresetDescription] = useState("");
    const [options, setOptions] = useState<Partial<JupyterHubServerOptions>>({});

    return (<div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <h1>Create Preset</h1>
        <p>This is the Create Preset page.</p>
        <Input placeholder="Preset Name" className="w-full max-w-md" />
        <Input placeholder="Description" className="w-full max-w-md" />

        <ImageSettings options={options} setOptions={setOptions} />

        <ResourceSettings options={options} setOptions={setOptions} />

        <StorageSettings options={options} setOptions={setOptions} />

        <Button disabled={!presetName}>Save Preset</Button>

    </div>);
}