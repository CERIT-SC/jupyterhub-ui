"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { HelpText } from "@/components/ui/help-text";
import { cn } from "@/lib/utils";
import { useServerNameValidation } from "@/hooks/useServerNameValidation";

interface ServerNameInputBareProps {
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Current server name value
   */
  value: string;
  /**
   * Callback when server name changes
   */
  onNameChangeAction: (value: string) => void;
  /**
   * Additional CSS class
   */
  className?: string;
  /**
   * Custom error message from parent component
   */
  error?: string;
  /**
   * Callback when validation state changes
   */
  onValidationChange?: (isValid: boolean) => void;
  /**
   * Show help text
   */
  showHelpText?: boolean;
}

/**
 * A simplified version of the ServerNameInput without the card wrapper.
 * Useful for embedding in dialogs or other UI components.
 */
export function ServerNameInputBare({
  label = "Server name",
  value,
  onNameChangeAction,
  className,
  error: externalError,
  onValidationChange,
  showHelpText = true,
}: ServerNameInputBareProps) {
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
    onNameChangeAction(newValue);
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
    <div className={className}>
      {label && (
        <Label className="font-medium" htmlFor="server-name">
          {label}
        </Label>
      )}
      <div className="relative mt-1">
        <Input
          className={cn(
            "pr-10",
            error
              ? "border-red-500"
              : validationStatus === "valid"
                ? "border-green-500"
                : "",
          )}
          id="server-name"
          placeholder="my-notebook"
          value={serverName}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {renderStatusIcon()}
        </div>
      </div>
      <FormError message={error === null ? undefined : error} />
      {showHelpText && (
        <HelpText shortDescription="Use a unique name with lowercase letters, numbers, and hyphens." />
      )}
    </div>
  );
}
