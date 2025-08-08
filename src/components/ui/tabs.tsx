import * as React from "react";

import { cn } from "@/lib/cn";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: "",
  onValueChange: () => {},
});

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [selectedValue, setSelectedValue] = React.useState(
    value || defaultValue || "",
  );

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setSelectedValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [onValueChange, value],
  );

  const contextValue = React.useMemo(
    () => ({
      value: value !== undefined ? value : selectedValue,
      onValueChange: handleValueChange,
    }),
    [handleValueChange, selectedValue, value],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full bg-white border border-infra-border shadow-[0_3px_12px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      aria-selected={isSelected}
      className={cn(
        "inline-flex border border-transparent  items-center justify-center whitespace-nowrap rounded-full px-4 h-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-infra-primary/30 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-gradient-to-r from-infra-gradient-start to-infra-gradient-end text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)]"
          : "text-infra-text-secondary hover:text-infra-text-primary hover:border-infra-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        className,
      )}
      disabled={disabled}
      role="tab"
      type="button"
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      className={cn(
        "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-infra-primary/30 focus-visible:ring-offset-2",
        className,
      )}
      role="tabpanel"
    >
      {children}
    </div>
  );
}
