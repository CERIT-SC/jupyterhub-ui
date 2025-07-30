/**
 * Configuration for JupyterHub container images
 * Each category contains a mapping of image paths to their display names
 */

export const imageOptions = {
    simple: {
        "cerit.io/hubs/minimalnb:02-01-2025-ai": "Minimal NB with AI",
        "cerit.io/hubs/minimalnb:15-07-2025-intelligence-ai": "Minimal NB with notebook-intelligence",
        "cerit.io/hubs/minimalnb:01-02-2025": "Minimal NB with SSH access",
        "cerit.io/hubs/minimalnb-cs:31-10-2024": "Minimal NB with Integrated VS Code",
        "cerit.io/hubs/minimalnb-cs:17-11-2024-ai": "Minimal NB with Integrated VS Code and AI",
        "cerit.io/hubs/datasciencenb:26-09-2024": "DataScience NB",
        "cerit.io/hubs/datasciencenb:31-10-2024-ssh": "DataScience NB with SSH access",
        "cerit.io/hubs/datasciencenb:2025-05-30-nrp": "DataScience NB for NRP",
    },
    r: {
        "cerit.io/hubs/jupyterhubronly:05-02-2024": "Python 3.11 and R 4.3.1 kernels",
        "cerit.io/hubs/rstudio:11-08-2022-7": "RStudio with R 4.2.1",
        "cerit.io/hubs/rstudio:4.2.1-rsat": "RStudio with R 4.2.1 and RSAT",
        "cerit.io/hubs/rstudio:4.3.1": "RStudio with R 4.3.1",
        "cerit.io/hubs/rstudio:4.4.0": "RStudio with R 4.4.0",
        "cerit.io/hubs/rstudio:4.4.1": "RStudio with R 4.4.1",
        "cerit.io/hubs/rstudio:4.4.1-ai": "RStudio with R 4.4.1 and AI",
    },
    tf: {
        "cerit.io/hubs/tensorflownb:31-08-2023": "TensorFlow 2.10 (CPU only)",
        "cerit.io/hubs/tensorflowgpu:2.11.1": "TensorFlow 2.11.1 with GPU and TensorBoard",
        "cerit.io/hubs/tensorflowgpu:2.12.1": "TensorFlow 2.12.1 with GPU and TensorBoard",
        "cerit.io/hubs/tensorflowgpu:2.15.0": "TensorFlow 2.15.1 with GPU and TensorBoard",
        "cerit.io/hubs/tensorflowgpu:2.17.0": "TensorFlow 2.17.0 with GPU and TensorBoard",
        "cerit.io/hubs/pytorchgpu:2.4.1": "Pytorch 2.4.1",
        "cerit.io/hubs/nvidia-pytorch:2.5.0": "NVIDIA Pytorch 2.5.0",
        "cerit.io/hubs/nvidia-tensorflow:2.16.1": "NVIDIA Tensorflow 2.16.1",
    },
    matlab: {
        "cerit.io/hubs/matlab:r2022b": "MATLAB R2022b",
        "cerit.io/hubs/matlab:r2023a": "MATLAB R2023a",
        "cerit.io/hubs/matlab:r2024a": "MATLAB R2024a",
    },
    various: {
        "cerit.io/hubs/colab:2025-01-07": "Google Colab",
        "cerit.io/hubs/alphapose:2023-10-26": "Alphapose",
        "cerit.io/hubs/cuda-ubuntu:11.6-22.04": "CUDA 11.6",
        "cerit.io/hubs/cuda-ubuntu:11.8-22.04": "CUDA 11.8",
        "cerit.io/hubs/cuda-ubuntu:12.0-24.04": "CUDA 12.0",
        "cerit.io/hubs/cuda-ubuntu:12.1-22.04": "CUDA 12.1",
        "cerit.io/hubs/cuda-ubuntu:12.2-22.04": "CUDA 12.2",
        "cerit.io/hubs/cuda-ubuntu:12.3-22.04": "CUDA 12.3",
        "cerit.io/hubs/cuda-ubuntu:12.4-22.04": "CUDA 12.4",
    },
    folding: {
        "cerit.io/hubs/colabfold:1.5.5-cu12": "Colabfold 1.5.5",
        "cerit.io/hubs/esmfold:2.0.0": "ESM Fold 2.0",
    },
} as const;

/**
 * Get the list of categories with their display names
 */
export const categoryLabels: Record<keyof typeof imageOptions, string> = {
    simple: "Simple Jupyter Images",
    r: "R Images",
    tf: "TensorFlow Images",
    matlab: "Matlab Images",
    various: "Various Images",
    folding: "Folding Images",
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
