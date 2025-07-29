/**
 * Configuration for JupyterHub container images
 * Each category contains a mapping of image paths to their display names
 */

export const imageOptions = {
  simple: {
    "cerit.io/hubs/minimalnb-cs:31-10-2024": "Minimal Jupyter",
    "cerit.io/hubs/jupyter-minimal": "Jupyter Minimal",
    "cerit.io/hubs/datascience-notebook": "Data Science Notebook",
  },
  r: {
    "cerit.io/hubs/r-notebook:latest": "R Notebook",
    "cerit.io/hubs/rstudio:latest": "RStudio",
  },
  tf: {
    "cerit.io/hubs/tensorflow-notebook:latest": "TensorFlow Notebook",
    "cerit.io/hubs/tensorflow-gpu:latest": "TensorFlow with GPU",
  },
  matlab: {
    "cerit.io/hubs/matlab:r2023a": "MATLAB R2023a",
    "cerit.io/hubs/matlab:r2022b": "MATLAB R2022b",
  },
  various: {
    "cerit.io/hubs/scipy-notebook:latest": "SciPy Notebook",
    "cerit.io/hubs/pytorch-notebook:latest": "PyTorch Notebook",
  },
  folding: {
    "cerit.io/hubs/colabfold:latest": "ColabFold",
    "cerit.io/hubs/esmfold:latest": "ESMFold",
  },
} as const;

/**
 * Get the list of categories with their display names
 */
export const categoryLabels: Record<keyof typeof imageOptions, string> = {
  simple: "Simple Jupyter images",
  r: "R images",
  tf: "TensorFlow Jupyter images",
  matlab: "MATLAB images",
  various: "Various images",
  folding: "Folding images (Colabfold, ESMFold)",
};

/**
 * Find the category for a given image path
 */
export function findCategoryForImage(
  imagePath: string,
): keyof typeof imageOptions | null {
  for (const [category, images] of Object.entries(imageOptions)) {
    if (Object.keys(images).includes(imagePath)) {
      return category as keyof typeof imageOptions;
    }
  }

  return null;
}

/**
 * Get default image path
 */
export function getDefaultImage(): string {
  return "cerit.io/hubs/minimalnb-cs:31-10-2024";
}
