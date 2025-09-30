import { queryOptions, useQuery } from "@tanstack/react-query";

import { getGPUAllocatableNodes, getUnassignedGPUsByModel } from "@/api/prometheus/prometheusApiClient";
import { QueryConfig } from "@/lib/react-query";

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
) =>
  gpuDetails.reduce(
    (acc, { gpuInstanceProfile, modelName }) => {
      const dictionaryKey = gpuInstanceProfile ? `${modelName} ${gpuInstanceProfile}` : modelName;

      return { ...acc, [dictionaryKey]: (acc[dictionaryKey] ?? 0) + 1 };
    },
    {} as Record<string, number>,
  );

export const getAllocatableGPUS = async () => {
  try {
    const allocatableNodes: Set<string> = await getGPUAllocatableNodes();
    const unusedGPUs = await getUnassignedGPUsByModel();

    const filteredGpus = unusedGPUs.gpuDetails.filter((gpu) => allocatableNodes.has(gpu.nodeName));

    console.log("filteredGpus", filteredGpus);

    return aggregateGPUsByModel(filteredGpus);
  } catch (error) {
    console.error("Failed to get allocatable GPUs:", error);
  }
};

export const getAllocatableGpusOptions = () => {
  return queryOptions({
    queryKey: ["allocatable-gpus"],
    queryFn: () => getAllocatableGPUS(),
  });
};

type UseAllocatableGpusOptions = {
  queryConfig?: QueryConfig<typeof getAllocatableGpusOptions>;
};

export const useAllocatableGpus = ({ queryConfig }: UseAllocatableGpusOptions = {}) => {
  return useQuery({
    ...getAllocatableGpusOptions(),
    ...queryConfig,
  });
};
