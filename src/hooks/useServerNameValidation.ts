import { useCallback, useEffect, useMemo, useState } from "react";

import { useNotebooks } from "@/features/notebooks/api/get-notebooks";
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
  /**
   * Delay in ms to debounce validation while typing
   */
  debounceDelay?: number;
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
  debounceDelay = 300, // 300ms debounce by default
}: UseServerNameValidationOptions = {}): ServerNameValidationResult {
  const [serverName, setServerName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>("idle");
  const { user } = useAuth();

  // Keep track of previous value to detect changes
  const [previousValue, setPreviousValue] = useState(serverName);
  const hasValueChanged = previousValue !== serverName;
  const staleTime = hasValueChanged ? changedValueStaleTime : defaultStaleTime;

  // Fetch user servers names with dynamic stale time
  const {
    data: servers,
    status,
    error: fetchError,
    refetch,
  } = useNotebooks({
    queryConfig: {
      staleTime,
      enabled: Boolean(user?.name),
      refetchOnWindowFocus: false,
    },
  });

  const existingServerNames = useMemo(
    () => new Set(Object.keys(servers ?? {})),
    [servers],
  );

  // Validate server name against rules and existing names
  const validateServerName = useCallback(
    async (name: string): Promise<boolean> => {
      // Only set checking when there is something to validate
      setValidationStatus("checking");

      const trimmed = name.trim();

      // Basic validation
      if (trimmed.length === 0) {
        // Don't surface "required" during typing; caller (submit) can still get it
        setError("Server name is required");
        setValidationStatus("invalid");

        return false;
      }

      if (trimmed.length > 63) {
        setError("Server name must be 63 characters or less");
        setValidationStatus("invalid");

        return false;
      }

      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed)) {
        setError(
          "Server name must contain only lowercase letters, numbers, and hyphens, " +
            "and must start and end with a letter or number",
        );
        setValidationStatus("invalid");

        return false;
      }

      // Check if name already exists in servers
      if (existingServerNames.has(trimmed)) {
        setError(`Server name "${trimmed}" is already in use`);
        setValidationStatus("invalid");

        return false;
      }

      // All checks passed
      setError(null);
      setValidationStatus("valid");

      return true;
    },
    [existingServerNames],
  );

  // Debounced on-change validation
  useEffect(() => {
    if (!validateOnChange) return;

    const trimmed = serverName.trim();

    // If empty during typing, clear error and stay idle
    if (trimmed.length === 0) {
      setError(null);
      setValidationStatus("idle");
      return;
    }

    // Begin checking, then debounce actual validation
    setValidationStatus("checking");
    setError(null);

    const handle = setTimeout(() => {
      // No forced refetch here; rely on react-query caching and staleTime
      void validateServerName(serverName);
    }, debounceDelay);

    return () => clearTimeout(handle);
  }, [serverName, validateOnChange, debounceDelay, validateServerName]);

  // Public API to update the value (no immediate validate to avoid stale state)
  const updateServerName = useCallback((name: string) => {
    setPreviousValue((prev) => (prev !== name ? prev : prev));
    setServerName(name);
  }, []);

  // Explicit validate (e.g., on submit). Ensures latest servers first.
  const validate = useCallback(async (): Promise<boolean> => {
    try {
      await refetch();
    } catch {
      // Ignore fetch error here; rule-based validation still runs
    }
    return validateServerName(serverName);
  }, [refetch, validateServerName, serverName]);

  const refreshServerNames = async (): Promise<void> => {
    await refetch();
  };

  return {
    serverName,
    updateServerName,
    error,
    validationStatus,
    isValid: validationStatus === "valid",
    isValidating: status === "pending",
    existingServerNames,
    validate,
    refreshServerNames,
  };
}
