"use client";

import { useEffect, useState } from "react";
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
  onChange: (imagePath: string) => void;
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
  onChange,
  className,
}: ImageSelectorProps) {
  // Track the current category
  const [category, setCategory] = useState<
    keyof typeof imageOptions | "custom"
  >("simple");
  // Track custom image input
  const [customImage, setCustomImage] = useState("");
  // Track specific image for the selected category
  const [selectedImage, setSelectedImage] = useState<string>("");

  // When component mounts or value changes, determine if we need to update the category
  useEffect(() => {
    // Check if this is a known image
    const foundCategory = findCategoryForImage(value);

    if (foundCategory) {
      // It's a known image, set the category
      setCategory(foundCategory);
      setSelectedImage(value);
    } else if (value) {
      // It's a custom image
      setCategory("custom");
      setCustomImage(value);
    }
  }, [value]);

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    const typedCategory = newCategory as keyof typeof imageOptions | "custom";

    setCategory(typedCategory);

    if (typedCategory === "custom") {
      // If switching to custom, use the custom image value if available
      if (customImage) {
        onChange(customImage);
      }
    } else {
      // When switching categories, select the first image in that category
      const firstImageKey = Object.keys(
        imageOptions[typedCategory as keyof typeof imageOptions],
      )[0];

      if (firstImageKey) {
        setSelectedImage(firstImageKey);
        onChange(firstImageKey);
      }
    }
  };

  // Handle specific image selection within a category
  const handleImageSelect = (newSelectedImage: string) => {
    setSelectedImage(newSelectedImage);
    onChange(newSelectedImage);
  };

  // Handle custom image input
  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setCustomImage(newValue);
    onChange(newValue);
  };

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
            <Select
              id="image-select"
              value={selectedImage}
              onValueChange={handleImageSelect}
            >
              <SelectTrigger>
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
            />
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
