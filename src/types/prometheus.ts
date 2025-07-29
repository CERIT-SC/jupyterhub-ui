// Prometheus API response types
export interface PrometheusResponse<T = any> {
  status: "success" | "error";
  data: T;
  errorType?: string;
  error?: string;
}

export interface PrometheusQueryResult {
  resultType: "matrix" | "vector" | "scalar" | "string";
  result: PrometheusMetric[];
}

export interface PrometheusMetric {
  metric: Record<string, string>;
  value?: [number, string]; // [timestamp, value]
  values?: Array<[number, string]>; // For range queries
}

// GPU-specific metric types
export interface GPUMetrics {
  instanceId: string;
  instanceName: string;
  gpuCount: number;
  availableGPUs: number;
  usedGPUs: number;
  gpuUtilization: number;
  gpuMemoryUsage: number;
  gpuMemoryTotal: number;
  gpuTemperature?: number;
  gpuPowerUsage?: number;
  timestamp: number;
}

export interface JupyterGPUMetrics {
  notebookId: string;
  notebookName: string;
  userId: string;
  podName: string;
  namespace: string;
  gpuMetrics: GPUMetrics;
}

export interface GPUAvailabilityMetrics {
  totalGPUs: number;
  availableGPUs: number;
  usedGPUs: number;
  gpuNodes: Array<{
    nodeName: string;
    totalGPUs: number;
    availableGPUs: number;
    usedGPUs: number;
  }>;
}

// GPU device information
export interface GPUDevice {
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  deviceUUID?: string;
  nodeName: string;
  driverVersion?: string;
  cudaVersion?: string;
  memoryTotal?: number;
  isAvailable: boolean;
}

export interface GPUDeviceInfo {
  totalGPUs: number;
  availableGPUs: number;
  gpuDevices: GPUDevice[];
  uniqueGPUModels: string[];
}

// Common Prometheus query parameters
export interface PrometheusQueryParams {
  query: string;
  time?: string;
  timeout?: string;
  step?: string;
  start?: string;
  end?: string;
}
