import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getUserNamedNotebooks } from "@/services/jupyterHub";
import { useAuth } from "@/hooks/useAuth";

export type ValidationStatus = "checking" | "valid" | "invalid" | "idle";

export interface ServerNameValidationResult {
  /**
   * Current server name value
   */
  serverName: string;
  /**
   * Update the server name
   */
  updateServerName: (value: string) => void;
  /**
   * Error message if validation fails
   */
  error: string | null;
  /**
   * Current validation status
   */
  validationStatus: ValidationStatus;
  /**
   * Whether the name is valid
   */
  isValid: boolean;
  /**
   * Whether validation is in progress
   */
  isValidating: boolean;
  /**
   * Set of existing server names
   */
  existingServerNames: Set<string>;
  /**
   * Manually trigger validation
   */
  validate: () => Promise<boolean>;
  /**
   * Refresh the list of existing server names
   */
  refreshServerNames: () => Promise<void>;
}

interface UseServerNameValidationOptions {
  /**
   * Initial server name value
   */
  initialName?: string;
  /**
   * Should the hook validate immediately or wait for an explicit check call
   */
  validateOnChange?: boolean;
  /**
   * Custom stale time for the server names query when value hasn't changed (ms)
   */
  defaultStaleTime?: number;
  /**
   * Custom stale time for the server names query when value has changed (ms)
   */
  changedValueStaleTime?: number;
}

/**
 * Custom hook for validating server names
 *
 * Handles validation rules, uniqueness checking, and status visualization
 */
export function useServerNameValidation({
  initialName = "",
  validateOnChange = true,
  defaultStaleTime = 5000, // 5 seconds by default
  changedValueStaleTime = 2000, // 2 seconds by default
}: UseServerNameValidationOptions = {}): ServerNameValidationResult {
  const [serverName, setServerName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>("idle");
  const [isValid, setIsValid] = useState(false);
  const { user } = useAuth();

  // Keep track of previous value to detect changes
  const [previousValue, setPreviousValue] = useState(serverName);
  const hasValueChanged = previousValue !== serverName;
  const staleTime = hasValueChanged ? changedValueStaleTime : defaultStaleTime;

  // Fetch user servers names with dynamic stale time
  const {
    data: servers,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Set<string>>({
    queryKey: ["user-notebooks", user?.name],
    queryFn: async () => {
      try {
        setValidationStatus("checking");
        const notebooks = await getUserNamedNotebooks(user?.name);

        return new Set(Object.keys(notebooks));
      } catch (error) {
        setError("Failed to fetch notebook server names");
        setValidationStatus("invalid");
        throw error;
      }
    },
    staleTime: staleTime,
    enabled: !!user?.name,
    refetchOnWindowFocus: false,
  });

  // Store the set of existing server names
  const existingServerNames = servers || new Set<string>();

  // Validate server name against rules and existing names
  const validateServerName = async (name: string): Promise<boolean> => {
    // Start in checking state
    setValidationStatus("checking");

    // Basic validation
    if (!name) {
      setError("Server name is required");
      setValidationStatus("invalid");
      setIsValid(false);

      return false;
    }

    if (name.length > 63) {
      setError("Server name must be 63 characters or less");
      setValidationStatus("invalid");
      setIsValid(false);

      return false;
    }

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) {
      setError(
        "Server name must contain only lowercase letters, numbers, and hyphens, " +
          "and must start and end with a letter or number",
      );
      setValidationStatus("invalid");
      setIsValid(false);

      return false;
    }

    // Check if name already exists in servers
    if (existingServerNames.has(name)) {
      setError(`Server name "${name}" is already in use`);
      setValidationStatus("invalid");
      setIsValid(false);

      return false;
    }

    // All checks passed
    setError(null);
    setValidationStatus("valid");
    setIsValid(true);

    return true;
  };

  // Update name and validate if needed
  const updateServerName = (name: string) => {
    setServerName(name);

    // If the value changed, track it and possibly trigger refetch
    if (name !== serverName) {
      setPreviousValue(serverName);
      if (validateOnChange) {
        refetch();
      }
    }
  };

  // Validate current name on demand
  const validate = async (): Promise<boolean> => {
    // Refresh server list before validation to ensure fresh data
    await refetch();

    return validateServerName(serverName);
  };

  // When servers data changes or loading state changes, update validation
  useEffect(() => {
    if (isLoading || isRefetching) {
      setValidationStatus("checking");
    } else if (serverName) {
      validateServerName(serverName);
    }
  }, [isLoading, isRefetching, existingServerNames, serverName]);

  // Create a void version of refetch that satisfies the interface
  const refreshServerNames = async (): Promise<void> => {
    await refetch();
    // No return value needed since we want Promise<void>
  };

  return {
    serverName,
    updateServerName,
    error,
    validationStatus,
    isValid,
    isValidating: isLoading || isRefetching,
    existingServerNames,
    validate,
    refreshServerNames,
  };
}
