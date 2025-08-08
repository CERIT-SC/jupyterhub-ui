import axios, { AxiosResponse } from "axios";

import { getUnassignedGPUsByModel } from "@/api/prometheus/prometheus-gpu-metrics"; // Use Next.js proxy rewrite for Prometheus

// Use Next.js proxy rewrite for Prometheus
const PROMETHEUS_BASE_URL = "/api/prometheus";

// Create axios instance for Prometheus
const prometheusClient = axios.create({
  baseURL: PROMETHEUS_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
prometheusClient.interceptors.request.use(
  (config) => {
    console.log(
      "Making Prometheus request:",
      config.method?.toUpperCase(),
      config.url,
    );

    return config;
  },
  (error) => {
    console.error("Prometheus request error:", error);

    return Promise.reject(error);
  },
);

// Add response interceptor for logging
prometheusClient.interceptors.response.use(
  (response) => {
    console.log(
      "Prometheus response received:",
      response.status,
      response.statusText,
    );

    return response;
  },
  (error) => {
    console.error(
      "Prometheus response error:",
      error.response?.data || error.message,
    );

    return Promise.reject(error);
  },
);

// Call Prometheus server
export const callPrometheusServer = async (): Promise<any> => {
  try {
    const response: AxiosResponse = await prometheusClient.get(
      PROMETHEUS_ENDPOINTS.QUERY,
    );

    return response.data;
  } catch (error) {
    console.error("Failed to call Prometheus server:", error);
    throw error;
  }
};

export const getUnschedulableNodes = async (): Promise<any> => {
  try {
    const response = await prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
      params: {
        query: "kube_node_spec_unschedulable",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getting unschedulable nodes:", error);
    throw error;
  }
};

export const getAllocatableNodes = async (): Promise<any> => {
  try {
    const response = await prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
      params: {
        query: "kube_node_status_allocatable",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getting allocatable nodes:", error);
    throw error;
  }
};

export const getNodeAllocatableResources = async (): Promise<any> => {
  try {
    const response = await prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
      params: {
        query: "kube_node_status_allocatable",
      },
    });

    if (!response.data?.data?.result) {
      return {
        nodes: [],
        summary: { totalNodes: 0, resourceTypes: [] },
      };
    }

    // Group by node
    const nodeResources = new Map();
    const resourceTypes = new Set();

    response.data.data.result.forEach((item: any) => {
      const nodeName = item.metric?.node;
      const resource = item.metric?.resource;
      const value = item.value?.[1];

      if (nodeName && resource && value) {
        if (!nodeResources.has(nodeName)) {
          nodeResources.set(nodeName, {});
        }
        nodeResources.get(nodeName)[resource] = value;
        resourceTypes.add(resource);
      }
    });

    // Convert to array format
    const nodes = Array.from(nodeResources.entries()).map(
      ([nodeName, resources]) => ({
        name: nodeName,
        resources: resources,
      }),
    );

    return {
      nodes,
      summary: {
        totalNodes: nodes.length,
        resourceTypes: Array.from(resourceTypes).sort(),
      },
    };
  } catch (error) {
    console.error("Error getting node allocatable resources:", error);
    throw error;
  }
};

/**
 * Aggregates GPU details by model name and returns count for each model
 */
const aggregateGPUsByModel = (
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
  }>,
): Record<string, number> => {
  const gpuCounts: Record<string, number> = {};

  for (const gpu of gpuDetails) {
    // Create dictionary key: modelName + GPU_I_PROFILE (if exists)
    const dictionaryKey = gpu.gpuInstanceProfile
      ? `${gpu.modelName} ${gpu.gpuInstanceProfile}`
      : gpu.modelName;

    // Add to GPU count by model (including profile)
    if (gpuCounts[dictionaryKey]) {
      gpuCounts[dictionaryKey]++;
    } else {
      gpuCounts[dictionaryKey] = 1;
    }
  }

  return gpuCounts;
};

/**
 * Aggregates GPU details by model name and returns count for each model
 */
const aggregateGPUsByModelAndDeviceId = (
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
  }>,
): Record<string, number> => {
  const gpuCounts: Record<string, number> = {};

  for (const gpu of gpuDetails) {
    // Create dictionary key: modelName + GPU_I_PROFILE (if exists)
    const dictionaryKey = gpu.gpuInstanceProfile
      ? `${gpu.modelName} ${gpu.gpuInstanceProfile}`
      : gpu.modelName;

    // Add to GPU count by model (including profile)
    if (gpuCounts[dictionaryKey]) {
      gpuCounts[dictionaryKey]++;
    } else {
      gpuCounts[dictionaryKey] = 1;
    }
  }

  return gpuCounts;
};

export const getAllocatableGPUS = async () => {
  try {
    const allocatableNodes: Set<string> = await getGPUAllocatableNodes();
    const unusedGPUs = await getUnassignedGPUsByModel();

    const filteredGpus = unusedGPUs.gpuDetails.filter((gpu) =>
      allocatableNodes.has(gpu.nodeName),
    );

    console.log("filteredGpus", filteredGpus);

    return aggregateGPUsByModel(filteredGpus);
  } catch (error) {
    console.error("Failed to get allocatable GPUs:", error);
  }
};

export const getGPUAllocatableNodes = async (): Promise<Set<string>> => {
  try {
    // Query all three metrics
    const [allocatableResponse, unschedulableResponse, labelsResponse] =
      await Promise.all([
        prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
          params: { query: "kube_node_status_allocatable" },
        }),
        prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
          params: { query: "kube_node_spec_unschedulable" },
        }),
        prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
          params: {
            query: 'kube_node_labels{label_cerit_io_jupyter_workload="true"}',
          },
        }),
      ]);

    const allocatableNodes = new Set<string>();
    const unschedulableNodes = new Set<string>();
    const jupyterWorkloadNodes = new Set<string>();

    // Process allocatable nodes
    if (allocatableResponse.data?.data?.result) {
      allocatableResponse.data.data.result.forEach((item: any) => {
        if (item.metric?.node) {
          allocatableNodes.add(item.metric.node);
        }
      });
    }

    // Process unschedulable nodes
    if (unschedulableResponse.data?.data?.result) {
      unschedulableResponse.data.data.result.forEach((item: any) => {
        if (item.metric?.node && item.value?.[1] === "1") {
          unschedulableNodes.add(item.metric.node);
        }
      });
    }

    // Process jupyter workload nodes
    if (labelsResponse.data?.data?.result) {
      labelsResponse.data.data.result.forEach((item: any) => {
        if (item.metric?.node) {
          jupyterWorkloadNodes.add(item.metric.node);
        }
      });
    }

    // Return only nodes that are allocatable, schedulable (not unschedulable), and have jupyterWorkload
    const validNodes = new Set<string>();

    for (const node of jupyterWorkloadNodes) {
      if (allocatableNodes.has(node) && !unschedulableNodes.has(node)) {
        validNodes.add(node);
      }
    }

    return validNodes;
  } catch (error) {
    console.error("Error getting node status:", error);
    throw error;
  }
};

export const getNodeStatus = async (): Promise<any> => {
  try {
    // Query all three metrics
    const [allocatableResponse, unschedulableResponse, labelsResponse] =
      await Promise.all([
        prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
          params: { query: "kube_node_status_allocatable" },
        }),
        prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
          params: { query: "kube_node_spec_unschedulable" },
        }),
        prometheusClient.get(PROMETHEUS_ENDPOINTS.QUERY, {
          params: {
            query: 'kube_node_labels{label_cerit_io_jupyter_workload="true"}',
          },
        }),
      ]);

    const allocatableNodes = new Set();
    const unschedulableNodes = new Set();
    const jupyterWorkloadNodes = new Set();

    // Process allocatable nodes
    if (allocatableResponse.data?.data?.result) {
      allocatableResponse.data.data.result.forEach((item: any) => {
        if (item.metric?.node) {
          allocatableNodes.add(item.metric.node);
        }
      });
    }

    // Process unschedulable nodes
    if (unschedulableResponse.data?.data?.result) {
      unschedulableResponse.data.data.result.forEach((item: any) => {
        if (item.metric?.node && item.value?.[1] === "1") {
          unschedulableNodes.add(item.metric.node);
        }
      });
    }

    // Process jupyter workload nodes
    if (labelsResponse.data?.data?.result) {
      labelsResponse.data.data.result.forEach((item: any) => {
        if (item.metric?.node) {
          jupyterWorkloadNodes.add(item.metric.node);
        }
      });
    }

    // Combine all nodes
    const allNodes = new Set([
      ...allocatableNodes,
      ...unschedulableNodes,
      ...jupyterWorkloadNodes,
    ]);

    const nodeStatus = Array.from(allNodes).map((node) => ({
      name: node,
      allocatable: allocatableNodes.has(node),
      schedulable: !unschedulableNodes.has(node),
      jupyterWorkload: jupyterWorkloadNodes.has(node),
    }));

    return {
      nodes: nodeStatus,
      summary: {
        total: nodeStatus.length,
        allocatable: nodeStatus.filter((n) => n.allocatable).length,
        schedulable: nodeStatus.filter((n) => n.schedulable).length,
        jupyterWorkload: nodeStatus.filter((n) => n.jupyterWorkload).length,
      },
    };
  } catch (error) {
    console.error("Error getting node status:", error);
    throw error;
  }
};

// Get Prometheus metrics
export const getPrometheusMetrics = async (query?: string): Promise<any> => {
  try {
    const endpoint = query
      ? `${PROMETHEUS_ENDPOINTS.QUERY}?query=${encodeURIComponent(query)}`
      : PROMETHEUS_ENDPOINTS.LABEL_VALUES("__name__");
    const response: AxiosResponse = await prometheusClient.get(endpoint);

    return response.data;
  } catch (error) {
    console.error("Failed to get Prometheus metrics:", error);
    throw error;
  }
};

// Get Prometheus health status
export const getPrometheusHealth = async (): Promise<any> => {
  try {
    const response: AxiosResponse = await prometheusClient.get(
      PROMETHEUS_ENDPOINTS.HEALTH,
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get Prometheus health:", error);
    throw error;
  }
};

// Export the configured Prometheus client for advanced usage
export { prometheusClient };

// Common Prometheus API endpoints
export const PROMETHEUS_ENDPOINTS = {
  QUERY: "/api/v1/query",
  QUERY_RANGE: "/api/v1/query_range",
  LABELS: "/api/v1/labels",
  LABEL_VALUES: (label: string) => `/api/v1/label/${label}/values`,
  SERIES: "/api/v1/series",
  TARGETS: "/api/v1/targets",
  RULES: "/api/v1/rules",
  ALERTS: "/api/v1/alerts",
  ALERTMANAGERS: "/api/v1/alertmanagers",
  CONFIG: "/api/v1/status/config",
  FLAGS: "/api/v1/status/flags",
  RUNTIME_INFO: "/api/v1/status/runtimeinfo",
  BUILD_INFO: "/api/v1/status/buildinfo",
  HEALTH: "/-/healthy",
  READY: "/-/ready",
};

// Export GPU metrics functions
export {
  getGPUAvailabilityMetrics,
  getAllJupyterGPUMetrics,
  getJupyterGPUHistory,
  getFreeGPUInfo,
  getUnassignedGPUsByModel,
  getFreeGPUsByModel,
  discoverGPUMetrics,
  getMetricSample,
  executePrometheusQuery,
  executePrometheusRangeQuery,
  GPU_METRICS_QUERIES,
} from "./prometheus-gpu-metrics";
