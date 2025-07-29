"use client";

import { useState, useEffect } from "react";
import { ServerIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { HelpText } from "@/components/ui/help-text";
import { cn } from "@/lib/utils";

interface ServerNameInputProps {
  /**
   * Current server name value
   */
  value: string;
  /**
   * Callback when server name changes
   */
  onChange: (value: string) => void;
  /**
   * Additional CSS class
   */
  className?: string;
  /**
   * Custom error message from parent component
   */
  error?: string;
}

export function ServerNameInput({
  value,
  onChange,
  className,
  error: externalError,
}: ServerNameInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Use external error if provided, otherwise use internal validation error
  const error = externalError || internalError;

  // Validate server name when it changes
  useEffect(() => {
    // Server name requirements based on Kubernetes naming conventions
    // - lowercase alphanumeric characters, '-' allowed
    // - must start and end with alphanumeric
    // - 63 characters or less

    if (!value) {
      setInternalError("Server name is required");

      return;
    }

    if (value.length > 63) {
      setInternalError("Server name must be 63 characters or less");

      return;
    }

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)) {
      setInternalError(
        "Server name must contain only lowercase letters, numbers, and hyphens, " +
          "and must start and end with a letter or number",
      );

      return;
    }

    setInternalError(null);
  }, [value]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ServerIcon className="h-5 w-5" />
          Server Name
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md">
          <Label className="font-medium" htmlFor="server-name">
            Enter a name for your notebook server:
          </Label>
          <Input
            className={cn("mt-2", error ? "border-red-500" : "")}
            id="server-name"
            placeholder="my-notebook"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <FormError message={error === null ? undefined : error} />
          <HelpText
            shortDescription="Use a unique name to identify this notebook. Only lowercase letters, numbers, and hyphens are allowed."
            tooltip={
              <>
                <p className="font-medium">Naming Rules:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Must start and end with a letter or number</li>
                  <li>Can contain lowercase letters, numbers, and hyphens</li>
                  <li>Maximum 63 characters long</li>
                  <li>Must be unique across your notebooks</li>
                </ul>
                <p className="mt-2">
                  Examples: <code>data-analysis</code>,{" "}
                  <code>jupyter-gpu-1</code>, <code>ml-project-2025</code>
                </p>
              </>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
