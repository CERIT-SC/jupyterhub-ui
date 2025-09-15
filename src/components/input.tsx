import * as React from "react";
import { useState } from "react";

import { Button } from "./ui/button";

import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-full border border-infra-violet bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-infra-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-infra-primary disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        type={type}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

type EditableFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>;
};

function EditableField({
  label,
  value,
  onChange,
  textarea,
  inputProps,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // Sync draft if value changes externally
  if (value !== draft && !editing) setDraft(value);

  const handleSave = () => {
    onChange(draft);
    setEditing(false);
  };

  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      {!editing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-h-[2.5rem] border rounded px-3 py-2 bg-muted">
            {value || (
              <span className="text-muted-foreground">
                No {label.toLowerCase()}
              </span>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {textarea ? (
            <textarea
              className="border rounded px-3 py-2 flex-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              {...inputProps}
            />
          ) : (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              {...inputProps}
            />
          )}
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              setDraft(value);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export { Input, EditableField };
