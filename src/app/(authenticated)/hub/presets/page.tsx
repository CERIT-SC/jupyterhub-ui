"use client"
import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createNotebookPreset } from "@/services/client/notebookPresets";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PresetsPage() {
        const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [creatingPreset, setCreatingPreset] = useState(false);
    const [error, setError] = useState<string | null>(null);


    async function handleCreate() {
        setCreatingPreset(true);
        setError(null);
        try {
            const preset = await createNotebookPreset({ name });
            if (preset && preset.id) {
                setOpen(false);
                setName("");
                router.push(`/hub/presets/${preset.id}`); // <-- Fixed here
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
        <div>
            <div>Presets Page</div>
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
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter preset name"
                        />
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreate} disabled={!name || creatingPreset}>
                            {creatingPreset ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}