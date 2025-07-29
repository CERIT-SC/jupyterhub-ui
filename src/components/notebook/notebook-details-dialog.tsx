import React, { useState } from "react";
import { format } from "date-fns";
import {
  Info,
  Clock,
  Cpu,
  Database,
  Calendar,
  User,
  Server,
  ExternalLink,
  RefreshCw,
  Zap,
  Square,
  Play,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServerStatus } from "@/services/jupyterHub";

interface NotebookDetailsDialogProps {
  notebook: ServerStatus;
  notebookName: string;
  trigger: React.ReactNode;
  /**
   * Callback when user confirms deletion of the notebook
   */
  onDelete?: () => void;
}

export function NotebookDetailsDialog({
  notebook,
  notebookName,
  trigger,
  onDelete,
}: NotebookDetailsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {notebookName === "Default" ? "Default Server" : notebookName}
            </DialogTitle>
            <Badge
              className={`ml-auto ${notebook.ready ? "bg-green-100 text-green-800" : notebook.pending ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}
              variant="outline"
            >
              {notebook.ready
                ? "Running"
                : notebook.pending === "spawn"
                  ? "Starting"
                  : notebook.pending === "stop"
                    ? "Stopping"
                    : "Stopped"}
            </Badge>
          </div>
          <DialogDescription>
            Detailed information about this notebook server
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 overflow-y-auto pr-1">
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors">
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <h4 className="text-sm font-medium">Last Activity</h4>
              </div>
              <p className="text-sm text-gray-700">
                {notebook.last_activity
                  ? format(new Date(notebook.last_activity), "PPpp")
                  : "Never accessed"}
              </p>
            </div>

            {notebook.started && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-3">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium">Started At</h4>
                </div>
                <p className="text-sm text-gray-700">
                  {format(new Date(notebook.started), "PPpp")}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Zap className="h-4 w-4 text-gray-500 mr-2" />
                <h4 className="text-sm font-medium">Status</h4>
              </div>
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${notebook.ready ? "bg-green-500" : notebook.pending ? "bg-yellow-500" : "bg-gray-500"}`}
                />
                <p className="text-sm">
                  {notebook.ready
                    ? "Running"
                    : notebook.pending === "spawn"
                      ? "Starting"
                      : notebook.pending === "stop"
                        ? "Stopping"
                        : "Stopped"}
                </p>
              </div>
            </div>

            {notebook.progress_url && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-3">
                  <Info className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium">Progress Information</h4>
                </div>
                <Button asChild className="w-full" size="sm" variant="outline">
                  <a
                    href={notebook.progress_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    View Progress Details
                  </a>
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {showDeleteConfirm ? (
            <div className="bg-red-50 p-4 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-medium text-red-800">Confirm Deletion</h3>
              </div>
              <p className="text-sm text-red-700 mb-4">
                Are you sure you want to delete the notebook "{notebookName}"?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Cpu className="h-4 w-4 text-gray-500 mr-2" />
              Server Technical Details
            </h3>
            <div className="text-xs font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-auto max-h-[150px]">
              <pre>{JSON.stringify(notebook, null, 2)}</pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
