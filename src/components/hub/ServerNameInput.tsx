"use client";

import { useEffect } from "react";
import { CheckCircle, ServerIcon, XCircle, AlertCircle, Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { HelpText } from "@/components/ui/help-text";
import { cn } from "@/lib/utils";
import { useServerNameValidation } from "@/hooks/useServerNameValidation";

interface ServerNameInputProps {
  value: string;

  onChangeNameAction: (value: string) => void;

  className?: string;

  error?: string;

  onValidationChange?: (isValid: boolean) => void;
}

export function ServerNameInput({
  value,
  onChangeNameAction,
  className,
  error: externalError,
  onValidationChange,
}: ServerNameInputProps) {
  // Use the custom validation hook
  const {
    serverName,
    updateServerName,
    error: validationError,
    validationStatus,
    isValid,
  } = useServerNameValidation({
    initialName: value,
    validateOnChange: true,
    defaultStaleTime: 5000,
    changedValueStaleTime: 2000,
    // debounceDelay: 10000,
  });

  // Sync serverName with the parent component's value
  useEffect(() => {
    if (value !== serverName) {
      updateServerName(value);
    }
  }, [value, serverName, updateServerName]);

  // Notify parent component when validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  // Handle input change and propagate to parent
  const handleInputChange = (newValue: string) => {
    updateServerName(newValue);
    onChangeNameAction(newValue);
  };

  // Use external error if provided, otherwise use validation error
  const error = externalError || validationError;

  // Render status icon based on validation state
  const renderStatusIcon = () => {
    switch (validationStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "idle":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

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
          <div className="relative mt-2">
            <Input
              className={cn("pr-10", error ? "border-red-500" : validationStatus === "valid" ? "border-green-500" : "")}
              id="server-name"
              placeholder="my-notebook"
              value={serverName}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2">{renderStatusIcon()}</div>
          </div>
          <FormError message={error === null ? undefined : error} />
          <HelpText
            shortDescription="Use a unique name to identify this notebook. Only lowercase letters, numbers, and hyphens are allowed."
            tooltip={
              <>
                <p className="font-medium">Naming Rules:</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  <li>Must start and end with a letter or number</li>
                  <li>Can contain lowercase letters, numbers, and hyphens</li>
                  <li>Maximum 63 characters long</li>
                  <li>Must be unique across your notebooks</li>
                </ul>
                <p className="mt-2">
                  Examples: <code>data-analysis</code>, <code>jupyter-gpu-1</code>, <code>ml-project-2025</code>
                </p>
              </>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
