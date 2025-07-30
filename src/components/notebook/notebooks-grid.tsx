import React from "react";

import { NotebookCard } from "@/components/notebook/notebook-card";
import { ServerStatus } from "@/services/jupyterHub";

interface NotebooksGridProps {
  notebooks: Record<string, ServerStatus>;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onSettings?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function NotebooksGrid({
  notebooks,
  onStart,
  onStop,
  onSettings,
  onRemove,
}: NotebooksGridProps) {
  const notebookEntries = Object.entries(notebooks);

  if (notebookEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-lg font-medium">No notebooks found</div>
        <p className="text-gray-500 mt-2">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {notebookEntries.map(([id, server]) => (
        <NotebookCard
          key={id}
          name={id}
          server={server}
          onRemove={() => onRemove?.(id)}
          onSettings={() => onSettings?.(id)}
          onStart={() => onStart?.(id)}
          onStop={() => onStop?.(id)}
        />
      ))}
    </div>
  );
}
