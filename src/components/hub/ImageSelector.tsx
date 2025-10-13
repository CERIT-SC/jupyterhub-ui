"use client";

import React, { useEffect, useRef, useState } from "react";
import { Server } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryLabels,
  findCategoryForImage,
  getDefaultImage,
  imageOptions,
} from "@/config/hub/imageOptions";

interface ImageSelectorProps {
  /**
   * Current selected image path
   */
  value?: string;
  /**
   * Callback when image is selected
   */
  onChangeImageAction: (imagePath: string) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * A component for selecting JupyterHub images
 */
export function ImageSelector({
  value = getDefaultImage(),
  onChangeImageAction,
  className,
}: ImageSelectorProps) {
  // Track the current category
  const [category, setCategory] = useState<
    keyof typeof imageOptions | "custom"
  >("simple");
  // Track custom image input
  const [customImage, setCustomImage] = useState("");
  // Validation error for custom image
  const [customError, setCustomError] = useState<string | null>(null);
  // Track specific image for the selected category
  const [selectedImage, setSelectedImage] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When value changes externally, update category if we're not in custom mode
  useEffect(() => {
    if (category === "custom") return; // ignore external value while editing custom

    const foundCategory = value ? findCategoryForImage(value) : undefined;

    if (foundCategory) {
      setCategory(foundCategory);
      setSelectedImage(value || "");
      setCustomError(null);
    } else if (value) {
      setCategory("custom");
      setCustomImage(value);
      setCustomError(value.trim() ? null : "Image is required");
    }
  }, [value, category]);

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    const typedCategory = newCategory as keyof typeof imageOptions | "custom";
    setCategory(typedCategory);

    if (typedCategory === "custom") {
      // Prefill with current selection if present
      const prefill = (value || selectedImage || customImage || "").trim();
      setCustomImage(prefill);
      setCustomError(prefill ? null : "Image is required");

      // IMPORTANT: Do NOT push value to parent here to avoid auto-detection
      // The parent will be updated as the user types in the input.
    } else {
      // When switching categories, select the first image in that category
      const firstImageKey = Object.keys(
        imageOptions[typedCategory as keyof typeof imageOptions],
      )[0];

      if (firstImageKey) {
        setSelectedImage(firstImageKey);
        setCustomError(null);
        onChangeImageAction(firstImageKey);
      }
    }
  };

  // Handle specific image selection within a category
  const handleImageSelect = (newSelectedImage: string) => {
    setSelectedImage(newSelectedImage);
    onChangeImageAction(newSelectedImage);
  };

  // Handle custom image input
  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomImage(newValue);
    setCustomError(newValue.trim() ? null : "Image is required");
    // Do not push immediately; debounced below
  };

  // Debounce pushing custom image to parent
  useEffect(() => {
    if (category !== "custom") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onChangeImageAction(customImage);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [customImage, category, onChangeImageAction]);

  return (
    <div className={className}>
      <p className="text-muted-foreground">
        Select the type of notebook environment you want to use. Custom images
        should be specified in format repo/image_name:tag.
      </p>

      <div className="space-y-4 mt-4">
        {/* Step 1: Select Category */}
        <div className="space-y-2">
          <Label htmlFor="category-select">Step 1: Select Image Category</Label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category-select">
              <SelectValue placeholder="Choose an image category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([cat, label]) => (
                <SelectItem key={cat} value={cat}>
                  {label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom image</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Select specific image or enter custom */}
        {category !== "custom" ? (
          <div className="space-y-2">
            <Label htmlFor="image-select">Step 2: Select Specific Image</Label>
            <Select value={selectedImage} onValueChange={handleImageSelect}>
              <SelectTrigger id="image-select">
                <SelectValue placeholder="Choose a specific image" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(
                  imageOptions[category as keyof typeof imageOptions],
                ).map(([imagePath, displayName]) => (
                  <SelectItem key={imagePath} value={imagePath}>
                    {displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="customimage">Step 2: Enter Custom Image Name</Label>
            <Input
              id="customimage"
              placeholder="repo/image_name:tag"
              value={customImage}
              onChange={handleCustomImageChange}
              onBlur={() => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                onChangeImageAction(customImage);
              }}
              aria-invalid={!!customError}
              required
            />
            {customError && (
              <p className="text-sm text-destructive">{customError}</p>
            )}
          </div>
        )}
      </div>

      {/* Image details or preview could go here */}
      {selectedImage && category !== "custom" && (
        <div className="mt-4 p-4 border rounded-md bg-muted/30">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Selected image:</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground break-all">
            {selectedImage}
          </p>
        </div>
      )}
    </div>
  );
}
