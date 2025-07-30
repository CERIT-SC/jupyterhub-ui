import type {
  PrometheusResponse,
  PrometheusQueryResult,
  PrometheusMetric,
  GPUMetrics,
  JupyterGPUMetrics,
  GPUAvailabilityMetrics,
  PrometheusQueryParams,
  GPUDevice,
  GPUDeviceInfo,
} from "../../types/prometheus";

import { prometheusClient } from "./prometheus-api";

// Common GPU-related Prometheus metrics for Jupyter/Kubernetes environments
export const GPU_METRICS_QUERIES = {
  // NVIDIA GPU metrics (using nvidia-dcgm-exporter or similar)
  GPU_UTILIZATION: "DCGM_FI_DEV_GPU_UTIL",
  GPU_MEMORY_USED: "DCGM_FI_DEV_FB_USED",
  GPU_MEMORY_TOTAL: "DCGM_FI_DEV_FB_TOTAL",
  GPU_TEMPERATURE: "DCGM_FI_DEV_GPU_TEMP",
  GPU_POWER_USAGE: "DCGM_FI_DEV_POWER_USAGE",

  // Kubernetes GPU metrics
  GPU_REQUEST:
    'kube_pod_container_resource_requests{resource="nvidia.com/gpu"}',
  GPU_LIMIT: 'kube_pod_container_resource_limits{resource="nvidia.com/gpu"}',
  NODE_GPU_CAPACITY: 'kube_node_status_capacity{resource="nvidia.com/gpu"}',
  NODE_GPU_ALLOCATABLE:
    'kube_node_status_allocatable{resource="nvidia.com/gpu"}',

  // JupyterHub specific queries
  JUPYTER_POD_GPU_REQUEST:
    'kube_pod_container_resource_requests{resource="nvidia.com/gpu",namespace=~"jupyter.*"}',
  JUPYTER_POD_GPU_USAGE: 'DCGM_FI_DEV_GPU_UTIL{pod=~"jupyter.*"}',

  // Alternative GPU metrics (for different exporters)
  NVIDIA_GPU_UTILIZATION: "nvidia_gpu_utilization_gpu",
  NVIDIA_GPU_MEMORY_USED: "nvidia_gpu_memory_used_bytes",
  NVIDIA_GPU_MEMORY_TOTAL: "nvidia_gpu_memory_total_bytes",
  NVIDIA_GPU_TEMPERATURE: "nvidia_gpu_temperature_celsius",
  NVIDIA_GPU_POWER_DRAW: "nvidia_gpu_power_draw_watts",

  // GPU device information queries
  GPU_DEVICE_INFO: "DCGM_FI_DEV_NAME",
  GPU_DEVICE_UUID: "DCGM_FI_DEV_UUID",
  GPU_DEVICE_MEMORY_TOTAL: "DCGM_FI_DEV_FB_TOTAL",
  GPU_DRIVER_VERSION: "DCGM_FI_DRIVER_VERSION",
  GPU_CUDA_VERSION: "DCGM_FI_CUDA_DRIVER_VERSION",

  // Alternative device info queries
  NVIDIA_GPU_NAME: "nvidia_gpu_name_info",
  NVIDIA_GPU_UUID: "nvidia_gpu_uuid_info",
  NVIDIA_GPU_DRIVER_VERSION: "nvidia_driver_version_info",

  // Node GPU information
  NODE_GPU_INFO: 'kube_node_info{gpu_name!=""}',
  GPU_DEVICE_PLUGIN_INFO: "nvidia_gpu_num_devices",
};

/**
 * Execute a Prometheus query and return typed results
 */
export const executePrometheusQuery = async (
  query: string,
  params?: Partial<PrometheusQueryParams>,
): Promise<PrometheusResponse<PrometheusQueryResult>> => {
  try {
    const queryParams = new URLSearchParams({
      query,
      ...params,
    });

    const response = await prometheusClient.get(`/api/v1/query?${queryParams}`);

    return response.data;
  } catch (error) {
    console.error("Failed to execute Prometheus query:", error);
    throw error;
  }
};

/**
 * Get free GPUs by model - GPUs that are not assigned to any pod, on allocatable nodes, and on schedulable nodes
 */
export const getFreeGPUsByModel = async (): Promise<{
  freeGPUs: Record<string, number>;
  totalFree: number;
  gpuDetails: Array<{
    deviceId: string;
    modelName: string;
    nodeName: string;
    freeMemoryMB: number;
    totalMemoryMB: number;
    driverVersion: string;
    uuid: string;
    gpuInstanceId?: string;
    gpuInstanceProfile?: string;
  }>;
}> => {
  try {
    // Query all GPUs with their free memory (this gives us all GPUs)
    const freeMemoryResponse = await executePrometheusQuery(
      "DCGM_FI_DEV_FB_FREE",
    );

    // Query total memory for each GPU
    const totalMemoryResponse = await executePrometheusQuery(
      "DCGM_FI_DEV_FB_TOTAL",
    );

    // Query allocatable GPUs per node
    const allocatableGPUResponse = await executePrometheusQuery(
      'kube_node_status_allocatable{resource="nvidia.com/gpu"}',
    );

    // Query unschedulable nodes
    const unschedulableResponse = await executePrometheusQuery(
      "kube_node_spec_unschedulable",
    );

    if (
      !freeMemoryResponse.data.result ||
      freeMemoryResponse.data.result.length === 0
    ) {
      return {
        freeGPUs: {},
        totalFree: 0,
        gpuDetails: [],
      };
    }

    // Build sets for filtering
    const allocatableGPUNodes = new Set<string>();
    const unschedulableNodes = new Set<string>();

    // Process allocatable GPU nodes
    allocatableGPUResponse.data.result?.forEach((metric: PrometheusMetric) => {
      const nodeName = metric.metric.node;
      const gpuCount = parseInt(metric.value?.[1] || "0", 10);

      if (nodeName && gpuCount > 0) {
        allocatableGPUNodes.add(nodeName);
      }
    });

    // Process unschedulable nodes
    unschedulableResponse.data.result?.forEach((metric: PrometheusMetric) => {
      const nodeName = metric.metric.node;
      const isUnschedulable = metric.value?.[1] === "1";

      if (nodeName && isUnschedulable) {
        unschedulableNodes.add(nodeName);
      }
    });

    const freeGPUs: Record<string, number> = {};
    const gpuDetails: Array<{
      deviceId: string;
      modelName: string;
      nodeName: string;
      freeMemoryMB: number;
      totalMemoryMB: number;
      driverVersion: string;
      uuid: string;
      gpuInstanceId?: string;
      gpuInstanceProfile?: string;
    }> = [];

    // Process each GPU
    for (const freeMemMetric of freeMemoryResponse.data.result) {
      const deviceId =
        freeMemMetric.metric.gpu || freeMemMetric.metric.device || "unknown";
      const nodeName =
        freeMemMetric.metric.Hostname ||
        freeMemMetric.metric.instance ||
        freeMemMetric.metric.node ||
        "unknown";
      const modelName = freeMemMetric.metric.modelName || "Unknown GPU";
      const driverVersion =
        freeMemMetric.metric.DCGM_FI_DRIVER_VERSION || "unknown";
      const uuid = freeMemMetric.metric.UUID || "unknown";

      // Extract GPU instance fields
      const gpuInstanceId = freeMemMetric.metric.GPU_I_ID || undefined;
      const gpuInstanceProfile =
        freeMemMetric.metric.GPU_I_PROFILE || undefined;

      // Check if GPU is assigned to a pod
      const isAssignedToPod =
        freeMemMetric.metric.exported_pod !== undefined &&
        freeMemMetric.metric.exported_pod !== null &&
        freeMemMetric.metric.exported_pod !== "";

      // Check node conditions
      const nodeAllocatable = allocatableGPUNodes.has(nodeName);
      const nodeSchedulable = !unschedulableNodes.has(nodeName);

      console.log(
        `GPU ${deviceId} (${modelName}${gpuInstanceProfile ? ` - ${gpuInstanceProfile}` : ""}): assigned to pod = ${isAssignedToPod}, node allocatable = ${nodeAllocatable}, node schedulable = ${nodeSchedulable}`,
      );

      // Only include GPUs that are FREE: not assigned to pod, on allocatable node, and on schedulable node
      if (!isAssignedToPod && nodeAllocatable && nodeSchedulable) {
        const freeMemoryBytes = parseFloat(freeMemMetric.value?.[1] || "0");
        const freeMemoryMB = Math.round(freeMemoryBytes / (1024 * 1024));

        // Find corresponding total memory
        const totalMemMetric = totalMemoryResponse.data.result?.find(
          (m: PrometheusMetric) =>
            (m.metric.gpu === deviceId || m.metric.device === deviceId) &&
            (m.metric.Hostname === nodeName ||
              m.metric.instance === nodeName ||
              m.metric.node === nodeName),
        );
        const totalMemoryBytes = totalMemMetric
          ? parseFloat(totalMemMetric.value?.[1] || "0")
          : 0;
        const totalMemoryMB = Math.round(totalMemoryBytes / (1024 * 1024));

        // Create dictionary key: modelName + GPU_I_PROFILE (if exists)
        const dictionaryKey = gpuInstanceProfile
          ? `${modelName} ${gpuInstanceProfile}`
          : modelName;

        // Add to free GPUs count by model (including profile)
        if (freeGPUs[dictionaryKey]) {
          freeGPUs[dictionaryKey]++;
        } else {
          freeGPUs[dictionaryKey] = 1;
        }

        // Add to detailed list
        gpuDetails.push({
          deviceId,
          modelName,
          nodeName,
          freeMemoryMB,
          totalMemoryMB,
          driverVersion,
          uuid,
          gpuInstanceId,
          gpuInstanceProfile,
        });
      }
    }

    const totalFree = Object.values(freeGPUs).reduce(
      (sum, count) => sum + count,
      0,
    );

    console.log("Free GPUs by model:", freeGPUs);
    console.log("Total free GPUs:", totalFree);

    return {
      freeGPUs,
      totalFree,
      gpuDetails,
    };
  } catch (error) {
    console.error("Failed to get free GPUs by model:", error);

    return {
      freeGPUs: {},
      totalFree: 0,
      gpuDetails: [],
    };
  }
};

/**
 * Execute a Prometheus range query
 */
export const executePrometheusRangeQuery = async (
  query: string,
  start: string,
  end: string,
  step: string = "1m",
): Promise<PrometheusResponse<PrometheusQueryResult>> => {
  try {
    const queryParams = new URLSearchParams({
      query,
      start,
      end,
      step,
    });

    const response = await prometheusClient.get(
      `/api/v1/query_range?${queryParams}`,
    );

    return response.data;
  } catch (error) {
    console.error("Failed to execute Prometheus range query:", error);
    throw error;
  }
};

/**
 * Get GPU availability metrics for the cluster
 */
export const getGPUAvailabilityMetrics =
  async (): Promise<GPUAvailabilityMetrics> => {
    try {
      // Query total GPU capacity per node
      const totalGPUResponse = await executePrometheusQuery(
        GPU_METRICS_QUERIES.NODE_GPU_CAPACITY,
      );

      // Query allocatable GPUs per node
      const allocatableGPUResponse = await executePrometheusQuery(
        GPU_METRICS_QUERIES.NODE_GPU_ALLOCATABLE,
      );

      // Query currently requested GPUs
      const requestedGPUResponse = await executePrometheusQuery(
        'sum by (node) (kube_pod_container_resource_requests{resource="nvidia.com/gpu"})',
      );

      const gpuNodes = totalGPUResponse.data.result.map(
        (metric: PrometheusMetric) => {
          const nodeName = metric.metric.node || "unknown";
          const totalGPUs = parseInt(metric.value?.[1] || "0", 10);

          // Find corresponding allocatable and requested metrics
          const allocatableMetric = allocatableGPUResponse.data.result.find(
            (m: PrometheusMetric) => m.metric.node === nodeName,
          );
          const requestedMetric = requestedGPUResponse.data.result.find(
            (m: PrometheusMetric) => m.metric.node === nodeName,
          );

          const allocatableGPUs = parseInt(
            allocatableMetric?.value?.[1] || "0",
            10,
          );
          const usedGPUs = parseInt(requestedMetric?.value?.[1] || "0", 10);

          return {
            nodeName,
            totalGPUs,
            availableGPUs: allocatableGPUs - usedGPUs,
            usedGPUs,
          };
        },
      );

      const totalGPUs = gpuNodes.reduce((sum, node) => sum + node.totalGPUs, 0);
      const availableGPUs = gpuNodes.reduce(
        (sum, node) => sum + node.availableGPUs,
        0,
      );
      const usedGPUs = gpuNodes.reduce((sum, node) => sum + node.usedGPUs, 0);

      return {
        totalGPUs,
        availableGPUs,
        usedGPUs,
        gpuNodes,
      };
    } catch (error) {
      console.error("Failed to get GPU availability metrics:", error);
      throw error;
    }
  };

/**
 * Get GPU metrics for a specific Jupyter notebook instance
 */
export const getJupyterGPUMetrics = async (
  notebookId: string,
  userId?: string,
  namespace?: string,
): Promise<JupyterGPUMetrics | null> => {
  try {
    const namespaceFilter = namespace
      ? `namespace="${namespace}"`
      : 'namespace=~"jupyter.*"';
    const podFilter = `pod=~"jupyter.*${notebookId}.*"`;

    // Query GPU utilization for the specific notebook
    const utilizationQuery = `${GPU_METRICS_QUERIES.GPU_UTILIZATION}{${podFilter}}`;
    const memoryUsedQuery = `${GPU_METRICS_QUERIES.GPU_MEMORY_USED}{${podFilter}}`;
    const memoryTotalQuery = `${GPU_METRICS_QUERIES.GPU_MEMORY_TOTAL}{${podFilter}}`;
    const temperatureQuery = `${GPU_METRICS_QUERIES.GPU_TEMPERATURE}{${podFilter}}`;
    const powerQuery = `${GPU_METRICS_QUERIES.GPU_POWER_USAGE}{${podFilter}}`;

    // Query GPU requests for the pod
    const gpuRequestQuery = `kube_pod_container_resource_requests{resource="nvidia.com/gpu",${namespaceFilter},pod=~".*${notebookId}.*"}`;

    const [
      utilizationResponse,
      memoryUsedResponse,
      memoryTotalResponse,
      temperatureResponse,
      powerResponse,
      gpuRequestResponse,
    ] = await Promise.all([
      executePrometheusQuery(utilizationQuery),
      executePrometheusQuery(memoryUsedQuery),
      executePrometheusQuery(memoryTotalQuery),
      executePrometheusQuery(temperatureQuery),
      executePrometheusQuery(powerQuery),
      executePrometheusQuery(gpuRequestQuery),
    ]);

    if (!gpuRequestResponse.data.result.length) {
      return null; // No GPU allocation found for this notebook
    }

    const gpuRequestMetric = gpuRequestResponse.data.result[0];
    const podName = gpuRequestMetric.metric.pod || "";
    const podNamespace = gpuRequestMetric.metric.namespace || "";
    const gpuCount = parseInt(gpuRequestMetric.value?.[1] || "0", 10);

    // Extract GPU utilization (average across all GPUs if multiple)
    const gpuUtilization =
      utilizationResponse.data.result.length > 0
        ? utilizationResponse.data.result.reduce(
            (sum: number, metric: PrometheusMetric) =>
              sum + parseFloat(metric.value?.[1] || "0"),
            0,
          ) / utilizationResponse.data.result.length
        : 0;

    // Extract memory usage (sum across all GPUs)
    const gpuMemoryUsage = memoryUsedResponse.data.result.reduce(
      (sum: number, metric: PrometheusMetric) =>
        sum + parseFloat(metric.value?.[1] || "0"),
      0,
    );

    const gpuMemoryTotal = memoryTotalResponse.data.result.reduce(
      (sum: number, metric: PrometheusMetric) =>
        sum + parseFloat(metric.value?.[1] || "0"),
      0,
    );

    // Extract temperature (average)
    const gpuTemperature =
      temperatureResponse.data.result.length > 0
        ? temperatureResponse.data.result.reduce(
            (sum: number, metric: PrometheusMetric) =>
              sum + parseFloat(metric.value?.[1] || "0"),
            0,
          ) / temperatureResponse.data.result.length
        : undefined;

    // Extract power usage (sum)
    const gpuPowerUsage =
      powerResponse.data.result.reduce(
        (sum: number, metric: PrometheusMetric) =>
          sum + parseFloat(metric.value?.[1] || "0"),
        0,
      ) || undefined;

    const gpuMetrics: GPUMetrics = {
      instanceId: notebookId,
      instanceName: podName,
      gpuCount,
      availableGPUs: gpuCount,
      usedGPUs: gpuCount,
      gpuUtilization,
      gpuMemoryUsage,
      gpuMemoryTotal,
      gpuTemperature,
      gpuPowerUsage,
      timestamp: Date.now(),
    };

    return {
      notebookId,
      notebookName: podName,
      userId: userId || "unknown",
      podName,
      namespace: podNamespace,
      gpuMetrics,
    };
  } catch (error) {
    console.error("Failed to get Jupyter GPU metrics:", error);
    throw error;
  }
};

/**
 * Get GPU metrics for all Jupyter notebook instances
 */
export const getAllJupyterGPUMetrics = async (
  namespace?: string,
): Promise<JupyterGPUMetrics[]> => {
  try {
    const namespaceFilter = namespace
      ? `namespace="${namespace}"`
      : 'namespace=~"jupyter.*"';

    // First, get all pods with GPU requests in Jupyter namespaces
    const gpuPodsQuery = `kube_pod_container_resource_requests{resource="nvidia.com/gpu",${namespaceFilter}}`;
    const gpuPodsResponse = await executePrometheusQuery(gpuPodsQuery);

    const jupyterMetrics: JupyterGPUMetrics[] = [];

    for (const podMetric of gpuPodsResponse.data.result) {
      const podName = podMetric.metric.pod || "";
      const podNamespace = podMetric.metric.namespace || "";

      // Extract notebook ID from pod name (assuming format like jupyter-username-notebookid)
      const notebookIdMatch = podName.match(/jupyter-(.+)-(.+)/);
      const notebookId = notebookIdMatch ? notebookIdMatch[2] : podName;
      const userId = notebookIdMatch ? notebookIdMatch[1] : "unknown";

      try {
        const metrics = await getJupyterGPUMetrics(
          notebookId,
          userId,
          podNamespace,
        );

        if (metrics) {
          jupyterMetrics.push(metrics);
        }
      } catch (error) {
        console.warn(
          `Failed to get metrics for notebook ${notebookId}:`,
          error,
        );
      }
    }

    return jupyterMetrics;
  } catch (error) {
    console.error("Failed to get all Jupyter GPU metrics:", error);
    throw error;
  }
};

/**
 * Get historical GPU utilization data for a Jupyter notebook
 */
export const getJupyterGPUHistory = async (
  notebookId: string,
  startTime: string,
  endTime: string,
  step: string = "1m",
): Promise<
  Array<{ timestamp: number; utilization: number; memoryUsage: number }>
> => {
  try {
    const podFilter = `pod=~"jupyter.*${notebookId}.*"`;
    const utilizationQuery = `${GPU_METRICS_QUERIES.GPU_UTILIZATION}{${podFilter}}`;
    const memoryUsedQuery = `${GPU_METRICS_QUERIES.GPU_MEMORY_USED}{${podFilter}}`;

    const [utilizationResponse, memoryResponse] = await Promise.all([
      executePrometheusRangeQuery(utilizationQuery, startTime, endTime, step),
      executePrometheusRangeQuery(memoryUsedQuery, startTime, endTime, step),
    ]);

    const historyData: Array<{
      timestamp: number;
      utilization: number;
      memoryUsage: number;
    }> = [];

    // Process utilization data
    const utilizationData = utilizationResponse.data.result[0]?.values || [];
    const memoryData = memoryResponse.data.result[0]?.values || [];

    utilizationData.forEach(([timestamp, utilization]: [number, string]) => {
      // Find corresponding memory data point
      const memoryPoint = memoryData.find(
        ([ts]: [number, string]) => ts === timestamp,
      );
      const memoryUsage = memoryPoint ? parseFloat(memoryPoint[1]) : 0;

      historyData.push({
        timestamp: timestamp * 1000, // Convert to milliseconds
        utilization: parseFloat(utilization),
        memoryUsage,
      });
    });

    return historyData.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error("Failed to get Jupyter GPU history:", error);
    throw error;
  }
};

/**
 * Monitor GPU metrics with real-time updates
 */
export const createGPUMetricsMonitor = (
  notebookId: string,
  callback: (metrics: JupyterGPUMetrics | null) => void,
  interval: number = 30000, // 30 seconds
): { stop: () => void } => {
  let isRunning = true;
  let timeoutId: NodeJS.Timeout;

  const fetchMetrics = async () => {
    if (!isRunning) return;

    try {
      const metrics = await getJupyterGPUMetrics(notebookId);

      callback(metrics);
    } catch (error) {
      console.error("Error fetching GPU metrics:", error);
      callback(null);
    }

    if (isRunning) {
      timeoutId = setTimeout(fetchMetrics, interval);
    }
  };

  // Start monitoring
  fetchMetrics();

  return {
    stop: () => {
      isRunning = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
};

/**
 * Discover available GPU-related metrics in Prometheus
 */
export const discoverGPUMetrics = async (): Promise<string[]> => {
  try {
    // Get all metric names
    const response = await prometheusClient.get(
      "/api/v1/label/__name__/values",
    );
    const allMetrics = response.data.data || [];

    // Filter for GPU-related metrics
    const gpuMetrics = allMetrics.filter(
      (metric: string) =>
        metric.toLowerCase().includes("gpu") ||
        metric.toLowerCase().includes("nvidia") ||
        metric.toLowerCase().includes("dcgm") ||
        metric.toLowerCase().includes("cuda") ||
        metric.includes("nvidia.com/gpu"),
    );

    console.log("Available GPU metrics:", gpuMetrics);

    return gpuMetrics;
  } catch (error) {
    console.error("Failed to discover GPU metrics:", error);

    return [];
  }
};

/**
 * Get sample data for a specific metric
 */
export const getMetricSample = async (metricName: string): Promise<any> => {
  try {
    const response = await executePrometheusQuery(metricName);

    return response.data;
  } catch (error) {
    console.error(`Failed to get sample for metric ${metricName}:`, error);

    return null;
  }
};

/**
 * Get free GPU information using DCGM_FI_DEV_FB_FREE metric
 */
export const getFreeGPUInfo = async (): Promise<{
  totalGPUs: number;
  freeGPUs: number;
  freeGPUDevices: Array<{
    deviceId: string;
    deviceName: string;
    nodeName: string;
    freeMemoryMB: number;
    totalMemoryMB?: number;
    memoryUtilizationPercent?: number;
  }>;
  gpuNames: string[];
}> => {
  try {
    // Query free GPU memory
    const freeMemoryResponse = await executePrometheusQuery(
      "DCGM_FI_DEV_FB_FREE",
    );

    // Query total GPU memory for comparison
    const totalMemoryResponse = await executePrometheusQuery(
      "DCGM_FI_DEV_FB_TOTAL",
    );

    // Query GPU device names
    const deviceNameResponse = await executePrometheusQuery("DCGM_FI_DEV_NAME");

    console.log("Free memory response:", freeMemoryResponse.data);
    console.log("Total memory response:", totalMemoryResponse.data);
    console.log("Device name response:", deviceNameResponse.data);

    if (
      !freeMemoryResponse.data.result ||
      freeMemoryResponse.data.result.length === 0
    ) {
      return {
        totalGPUs: 0,
        freeGPUs: 0,
        freeGPUDevices: [],
        gpuNames: [],
      };
    }

    const freeGPUDevices = [];
    const gpuNames = new Set<string>();

    // Process each GPU device
    for (const freeMemMetric of freeMemoryResponse.data.result) {
      const deviceId =
        freeMemMetric.metric.gpu || freeMemMetric.metric.device || "unknown";
      const nodeName =
        freeMemMetric.metric.instance || freeMemMetric.metric.node || "unknown";
      const freeMemoryBytes = parseFloat(freeMemMetric.value?.[1] || "0");
      const freeMemoryMB = Math.round(freeMemoryBytes / (1024 * 1024));

      // Find corresponding total memory
      const totalMemMetric = totalMemoryResponse.data.result?.find(
        (m: PrometheusMetric) =>
          (m.metric.gpu === deviceId || m.metric.device === deviceId) &&
          (m.metric.instance === nodeName || m.metric.node === nodeName),
      );
      const totalMemoryBytes = totalMemMetric
        ? parseFloat(totalMemMetric.value?.[1] || "0")
        : 0;
      const totalMemoryMB = Math.round(totalMemoryBytes / (1024 * 1024));

      // Find corresponding device name
      const deviceNameMetric = deviceNameResponse.data.result?.find(
        (m: PrometheusMetric) =>
          (m.metric.gpu === deviceId || m.metric.device === deviceId) &&
          (m.metric.instance === nodeName || m.metric.node === nodeName),
      );
      const deviceName =
        deviceNameMetric?.metric.modelName ||
        deviceNameMetric?.metric.name ||
        `GPU-${deviceId}`;

      // Calculate memory utilization
      const memoryUtilizationPercent =
        totalMemoryMB > 0
          ? Math.round(((totalMemoryMB - freeMemoryMB) / totalMemoryMB) * 100)
          : 0;

      // Consider GPU as "free" if it has more than 90% memory available
      const isFree =
        totalMemoryMB > 0
          ? freeMemoryMB / totalMemoryMB > 0.9
          : freeMemoryMB > 1000;

      const gpuDevice = {
        deviceId,
        deviceName,
        nodeName,
        freeMemoryMB,
        totalMemoryMB: totalMemoryMB > 0 ? totalMemoryMB : undefined,
        memoryUtilizationPercent,
        isFree,
      };

      freeGPUDevices.push(gpuDevice);
      gpuNames.add(deviceName);
    }

    // Filter for only free GPUs
    const actuallyFreeGPUs = freeGPUDevices.filter((gpu) => gpu.isFree);

    return {
      totalGPUs: freeGPUDevices.length,
      freeGPUs: actuallyFreeGPUs.length,
      freeGPUDevices: actuallyFreeGPUs,
      gpuNames: Array.from(gpuNames),
    };
  } catch (error) {
    console.error("Failed to get free GPU info:", error);

    return {
      totalGPUs: 0,
      freeGPUs: 0,
      freeGPUDevices: [],
      gpuNames: [],
    };
  }
};

/**
 * Get list of GPUs not assigned to any pod, grouped by model name
 */
export const getUnassignedGPUsByModel = async (): Promise<{
  unassignedGPUs: Record<string, number>;
  totalUnassigned: number;
  gpuDetails: Array<{
    deviceId: string;
    modelName: string;
    nodeName: string;
    freeMemoryMB: number;
    totalMemoryMB: number;
    driverVersion: string;
    uuid: string;
    gpuInstanceId?: string;
    gpuInstanceProfile?: string;
  }>;
}> => {
  try {
    // Query all GPUs with their free memory (this gives us all GPUs)
    const freeMemoryResponse = await executePrometheusQuery(
      "DCGM_FI_DEV_FB_FREE",
    );

    // Query total memory for each GPU
    const totalMemoryResponse = await executePrometheusQuery(
      "DCGM_FI_DEV_FB_TOTAL",
    );

    if (
      !freeMemoryResponse.data.result ||
      freeMemoryResponse.data.result.length === 0
    ) {
      return {
        unassignedGPUs: {},
        totalUnassigned: 0,
        gpuDetails: [],
      };
    }

    const unassignedGPUs: Record<string, number> = {};
    const gpuDetails: Array<{
      deviceId: string;
      modelName: string;
      nodeName: string;
      freeMemoryMB: number;
      totalMemoryMB: number;
      driverVersion: string;
      uuid: string;
      gpuInstanceId?: string;
      gpuInstanceProfile?: string;
    }> = [];

    // Process each GPU
    for (const freeMemMetric of freeMemoryResponse.data.result) {
      const deviceId =
        freeMemMetric.metric.gpu || freeMemMetric.metric.device || "unknown";
      const nodeName =
        freeMemMetric.metric.Hostname ||
        freeMemMetric.metric.instance ||
        freeMemMetric.metric.node ||
        "unknown";
      const modelName = freeMemMetric.metric.modelName || "Unknown GPU";
      const driverVersion =
        freeMemMetric.metric.DCGM_FI_DRIVER_VERSION || "unknown";
      const uuid = freeMemMetric.metric.UUID || "unknown";

      // Extract GPU instance fields
      const gpuInstanceId = freeMemMetric.metric.GPU_I_ID || undefined;
      const gpuInstanceProfile =
        freeMemMetric.metric.GPU_I_PROFILE || undefined;

      // Check if GPU is assigned to a pod
      const isAssignedToPod =
        freeMemMetric.metric.exported_pod !== undefined &&
        freeMemMetric.metric.exported_pod !== null &&
        freeMemMetric.metric.exported_pod !== "";

      // Only include GPUs that are NOT assigned to any pod
      if (!isAssignedToPod) {
        const freeMemoryBytes = parseFloat(freeMemMetric.value?.[1] || "0");
        const freeMemoryMB = Math.round(freeMemoryBytes / (1024 * 1024));

        // Find corresponding total memory
        const totalMemMetric = totalMemoryResponse.data.result?.find(
          (m: PrometheusMetric) =>
            (m.metric.gpu === deviceId || m.metric.device === deviceId) &&
            (m.metric.Hostname === nodeName ||
              m.metric.instance === nodeName ||
              m.metric.node === nodeName),
        );
        const totalMemoryBytes = totalMemMetric
          ? parseFloat(totalMemMetric.value?.[1] || "0")
          : 0;
        const totalMemoryMB = Math.round(totalMemoryBytes / (1024 * 1024));

        // Create dictionary key: modelName + GPU_I_PROFILE (if exists)
        const dictionaryKey = gpuInstanceProfile
          ? `${modelName} ${gpuInstanceProfile}`
          : modelName;

        // Add to unassigned GPUs count by model (including profile)
        if (unassignedGPUs[dictionaryKey]) {
          unassignedGPUs[dictionaryKey]++;
        } else {
          unassignedGPUs[dictionaryKey] = 1;
        }

        // Add to detailed list
        gpuDetails.push({
          deviceId,
          modelName,
          nodeName,
          freeMemoryMB,
          totalMemoryMB,
          driverVersion,
          uuid,
          gpuInstanceId,
          gpuInstanceProfile,
        });
      }
    }

    const totalUnassigned = Object.values(unassignedGPUs).reduce(
      (sum, count) => sum + count,
      0,
    );


    return {
      unassignedGPUs,
      totalUnassigned,
      gpuDetails,
    };
  } catch (error) {
    console.error("Failed to get unassigned GPUs by model:", error);

    return {
      unassignedGPUs: {},
      totalUnassigned: 0,
      gpuDetails: [],
    };
  }
};
