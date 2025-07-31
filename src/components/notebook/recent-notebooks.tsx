import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Clock, ExternalLink, Info, Play, Square } from "lucide-react";

import { NotebookDetailsDialog } from "@/components/notebook/notebook-details-dialog";
import {
  getRecentNotebooks,
  startServer,
  stopServer,
} from "@/services/jupyterHub";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

interface RecentNotebooksProps {
  limit?: number;
}

export function RecentNotebooks({ limit = 3 }: RecentNotebooksProps) {
  const router = useRouter();

  const {
    data: notebooks,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["recent-notebooks", limit],
    queryFn: () => getRecentNotebooks(limit),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleStopNotebook = async (id: string) => {
    try {
      await stopServer(id);
      await refetch();
    } catch (error) {
      console.error("Failed to stop notebook:", error);
    }
  };

  const handleStartNotebook = async (id: string) => {
    try {
      await startServer(id);
      router.push(`/hub/spawn/progress/${id}`);
    } catch (error) {
      console.error("Failed to start notebook:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loading size="sm" text="Loading recent notebooks..." />
      </div>
    );
  }

  if (!notebooks || Object.keys(notebooks).length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            You don't have any notebooks yet. Create one to get started.
          </p>
          <Link className="inline-block mt-4" href="/hub/spawn/options">
            <Button>Create Notebook</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(notebooks).map(([name, notebook]) => (
        <Card
          key={name}
          className={`border-l-4 ${notebook.ready ? "border-l-green-500" : "border-l-gray-300"}`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-medium">
                {name === "Default" ? "Default Server" : name}
              </CardTitle>
              {notebook.ready ? (
                <Badge className="bg-green-500" variant="default">
                  <Play className="h-3 w-3 mr-1" />
                  Running
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Square className="h-3 w-3 mr-1" />
                  Stopped
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {notebook.last_activity
                ? `Last active: ${new Date(notebook.last_activity).toLocaleString()}`
                : "Never accessed"}
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <div className="flex justify-between w-full">
              {notebook.ready ? (
                <>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={notebook.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStopNotebook(name)}
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={() => handleStartNotebook(name)}>
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                  <NotebookDetailsDialog
                    notebook={notebook}
                    notebookName={name}
                    trigger={
                      <Button size="sm" variant="ghost">
                        <Info className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    }
                  />
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
