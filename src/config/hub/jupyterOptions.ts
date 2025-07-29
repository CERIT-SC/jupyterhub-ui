/**
 * Configuration options for JupyterHub server spawning
 */

// CPU options
export const cpuOptions = [
  { value: "1", label: "1 CPU" },
  { value: "2", label: "2 CPUs" },
  { value: "4", label: "4 CPUs" },
  { value: "8", label: "8 CPUs" },
  { value: "16", label: "16 CPUs" },
  { value: "32", label: "32 CPUs" },
];

// Memory options (in GB)
export const memoryOptions = [
  { value: "4", label: "4 GB" },
  { value: "8", label: "8 GB" },
  { value: "16", label: "16 GB" },
  { value: "32", label: "32 GB" },
  { value: "64", label: "64 GB" },
  { value: "128", label: "128 GB" },
  { value: "256", label: "256 GB" },
];

// GPU options
export const gpuOptions = [
  { value: "none", label: "None" },
  { value: "mig-1g.10gb", label: "10GB part A100" },
  { value: "mig-2g.20gb", label: "20GB part A100" },
  { value: "a10", label: "Whole A10" },
  { value: "a40", label: "Whole A40" },
  { value: "a100", label: "Whole A100" },
  { value: "any", label: "Any whole GPU" },
];

// GPU MIG amount options
export const migAmountOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
];

// Home storage options
export const homeOptions = [
  { value: "brno12-cerit", label: "brno12-cerit" },
];

// Phome options
export const phomeOptions = [
  { value: "new", label: "New" },
  { value: "existing", label: "Existing" },
];

// Mock PVC names for existing homes (would be fetched from API in production)
export const mockPvcNames = [
  { value: "user-home-1", label: "user-home-1" },
  { value: "user-home-2", label: "user-home-2" },
];

// Mock S3 buckets (would be fetched from API in production)
export const mockS3Buckets = [
  { value: "s3-bucket-1", label: "s3-bucket-1" },
  { value: "s3-bucket-2", label: "s3-bucket-2" },
];

// S3 selection options
export const s3SelectionOptions = [
  { value: "new", label: "New bucket" },
  { value: "existing", label: "Existing bucket" },
];
