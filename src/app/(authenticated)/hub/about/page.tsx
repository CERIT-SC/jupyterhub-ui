"use client";
import React from "react";
import { useNotebooks } from "@/features/notebooks/api/get-notebooks";
import { useServerOptions } from "@/features/options/api/get-options";

export default function AboutPage() {
  const { data: options, isLoading: optionsLoading, error: optionsError } = useServerOptions({ serverName: "czcz" });

  const { data: notebooks, isLoading: notebooksLoading, error: notebooksError } = useNotebooks();

  return (
    <div className="container mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-semibold">About JupyterHub Client</h1>
      <p className="text-muted-foreground">A modern client for JupyterHub</p>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Server Options (czcz)</h2>
        {optionsLoading && <p>Loading options...</p>}
        {optionsError && (
          <p className="text-red-600">Error loading options: {(optionsError as any).message || "Unknown error"}</p>
        )}
        {!optionsLoading && !optionsError && (
          <pre className="bg-muted overflow-auto rounded p-3 text-xs">{JSON.stringify(options, null, 2)}</pre>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Notebooks</h2>
        {notebooksLoading && <p>Loading notebooks...</p>}
        {notebooksError && (
          <p className="text-red-600">Error loading notebooks: {(notebooksError as any).message || "Unknown error"}</p>
        )}
        {!notebooksLoading && !notebooksError && (
          <pre className="bg-muted overflow-auto rounded p-3 text-xs">{JSON.stringify(notebooks || [], null, 2)}</pre>
        )}
      </section>
    </div>
  );
}
