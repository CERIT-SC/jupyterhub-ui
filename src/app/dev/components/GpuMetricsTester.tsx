import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  discoverGPUMetrics,
  getUnassignedGPUsByModel,
  getFreeGPUsByModel,
  getUnschedulableNodes,
  getAllocatableNodes,
  getNodeStatus,
  getNodeAllocatableResources,
} from "@/api/prometheus/prometheus-api";

const GpuMetricsTester: FC = () => {
  const [loading, setLoading] = useState(false);
  const [unassignedGPUsByModel, setUnassignedGPUsByModel] = useState<any>(null);
  const [freeGPUsByModel, setFreeGPUsByModel] = useState<any>(null);
  const [discoveredMetrics, setDiscoveredMetrics] = useState<any>(null);
  const [unschedulableNodes, setUnschedulableNodes] = useState<any>(null);
  const [allocatableNodes, setAllocatableNodes] = useState<any>(null);
  const [nodeStatus, setNodeStatus] = useState<any>(null);
  const [nodeAllocatableResources, setNodeAllocatableResources] = useState<any>(null);

  const handleDiscoverGPUMetrics = async () => {
    setLoading(true);
    try {
      const metrics = await discoverGPUMetrics();

      setDiscoveredMetrics({ metrics, count: metrics.length });
      console.log("Discovered GPU metrics:", metrics);
    } catch (error) {
      console.error("Failed to discover GPU metrics:", error);
      setDiscoveredMetrics({ error: "Failed to discover GPU metrics" });
    } finally {
      setLoading(false);
    }
  };

  const handleGetUnassignedGPUsByModel = async () => {
    setLoading(true);
    try {
      const unassignedGPUs = await getUnassignedGPUsByModel();

      setUnassignedGPUsByModel(unassignedGPUs);
      console.log("Unassigned GPUs by model:", unassignedGPUs);
    } catch (error) {
      console.error("Failed to get unassigned GPUs by model:", error);
      setUnassignedGPUsByModel({
        error: "Failed to get unassigned GPUs by model",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetUnschedulableNodes = async () => {
    setLoading(true);
    try {
      const nodes = await getUnschedulableNodes();

      setUnschedulableNodes(nodes);
      console.log("Unschedulable nodes:", nodes);
    } catch (error) {
      console.error("Failed to get unschedulable nodes:", error);
      setUnschedulableNodes({
        error: "Failed to get unschedulable nodes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetFreeGPUsByModel = async () => {
    setLoading(true);
    try {
      const freeGPUs = await getFreeGPUsByModel();

      setFreeGPUsByModel(freeGPUs);
      console.log("Free GPUs by model:", freeGPUs);
    } catch (error) {
      console.error("Failed to get free GPUs by model:", error);
      setFreeGPUsByModel({
        error: "Failed to get free GPUs by model",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllocatableNodes = async () => {
    setLoading(true);
    try {
      const nodes = await getAllocatableNodes();

      setAllocatableNodes(nodes);
      console.log("Allocatable nodes:", nodes);
    } catch (error) {
      console.error("Failed to get allocatable nodes:", error);
      setAllocatableNodes({
        error: "Failed to get allocatable nodes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetNodeStatus = async () => {
    setLoading(true);
    try {
      const status = await getNodeStatus();

      setNodeStatus(status);
      console.log("Node status:", status);
    } catch (error) {
      console.error("Failed to get node status:", error);
      setNodeStatus({
        error: "Failed to get node status",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetNodeAllocatableResources = async () => {
    setLoading(true);
    try {
      const resources = await getNodeAllocatableResources();

      setNodeAllocatableResources(resources);
      console.log("Node allocatable resources:", resources);
    } catch (error) {
      console.error("Failed to get node allocatable resources:", error);
      setNodeAllocatableResources({
        error: "Failed to get node allocatable resources",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GPU Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Button disabled={loading} onClick={handleDiscoverGPUMetrics}>
            {loading ? "Loading..." : "Get All Metrics"}
          </Button>
          <Button disabled={loading} onClick={handleGetUnassignedGPUsByModel}>
            {loading ? "Loading..." : "Get Unused GPUs"}
          </Button>
          <Button disabled={loading} onClick={handleGetFreeGPUsByModel}>
            {loading ? "Loading..." : "Get Free GPUs"}
          </Button>
          <Button disabled={loading} onClick={handleGetUnschedulableNodes}>
            {loading ? "Loading..." : "Get Unschedulable Nodes"}
          </Button>
          <Button disabled={loading} onClick={handleGetAllocatableNodes}>
            {loading ? "Loading..." : "Get Allocatable Nodes"}
          </Button>
          <Button disabled={loading} onClick={handleGetNodeStatus}>
            {loading ? "Loading..." : "Get Node Status"}
          </Button>
          <Button disabled={loading} onClick={handleGetNodeAllocatableResources}>
            {loading ? "Loading..." : "Get Node Allocatable Resources"}
          </Button>
        </div>

        {discoveredMetrics && (
          <div className="mt-4 p-4 bg-pink-100 rounded text-xs">
            <h3 className="font-bold mb-2">All GPU Metrics:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-32">
              {JSON.stringify(discoveredMetrics, null, 2)}
            </pre>
          </div>
        )}

        {unassignedGPUsByModel && (
          <div className="mt-4 p-4 bg-cyan-100 rounded text-xs">
            <h3 className="font-bold mb-2">Unused GPUs by Model:</h3>
            <div className="mb-2">
              <strong>Total Unused: {unassignedGPUsByModel.totalUnassigned}</strong>
            </div>
            <div className="mb-2">
              <strong>By Model:</strong>
              {Object.entries(unassignedGPUsByModel.unassignedGPUs || {}).map(
                ([model, count]) => (
                  <div key={model} className="ml-4">
                    {model}: {count}
                  </div>
                )
              )}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold">GPU Details</summary>
              <pre className="whitespace-pre-wrap overflow-auto max-h-32 mt-2">
                {JSON.stringify(unassignedGPUsByModel, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {unschedulableNodes && (
          <div className="mt-4 p-4 bg-red-100 rounded text-xs">
            <h3 className="font-bold mb-2">Unschedulable Nodes:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-32">
              {JSON.stringify(unschedulableNodes, null, 2)}
            </pre>
          </div>
        )}

        {allocatableNodes && (
          <div className="mt-4 p-4 bg-green-100 rounded text-xs">
            <h3 className="font-bold mb-2">Allocatable Nodes:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-32">
              {JSON.stringify(allocatableNodes, null, 2)}
            </pre>
          </div>
        )}

        {nodeStatus && (
          <div className="mt-4 p-4 bg-blue-100 rounded text-xs">
            <h3 className="font-bold mb-2">Node Status Overview:</h3>

            {nodeStatus.error ? (
              <div className="text-red-600">{nodeStatus.error}</div>
            ) : (
              <>
                <div className="mb-4 flex gap-4">
                  <span>
                    <strong>Total Nodes:</strong> {nodeStatus.summary?.total || 0}
                  </span>
                  <span>
                    <strong>Allocatable:</strong> {nodeStatus.summary?.allocatable || 0}
                  </span>
                  <span>
                    <strong>Schedulable:</strong> {nodeStatus.summary?.schedulable || 0}
                  </span>
                  <span>
                    <strong>Jupyter Workload:</strong> {nodeStatus.summary?.jupyterWorkload || 0}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Node Details:</h4>
                  {nodeStatus.nodes?.map((node: any) => (
                    <div
                      key={node.name}
                      className="flex items-center gap-4 p-2 bg-white rounded"
                    >
                      <span className="font-mono text-sm flex-1">{node.name}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${node.allocatable ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}`}
                      >
                        {node.allocatable ? "✓ Allocatable" : "✗ Not Allocatable"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${node.schedulable ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                      >
                        {node.schedulable ? "✓ Schedulable" : "✗ Unschedulable"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${node.jupyterWorkload ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"}`}
                      >
                        {node.jupyterWorkload ? "✓ Jupyter Ready" : "✗ No Jupyter"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {freeGPUsByModel && (
          <div className="mt-4 p-4 bg-teal-100 rounded text-xs">
            <h3 className="font-bold mb-2">Free GPUs by Model:</h3>

            {freeGPUsByModel.error ? (
              <div className="text-red-600">{freeGPUsByModel.error}</div>
            ) : (
              <>
                <div className="mb-2">
                  <strong>Total Free: {freeGPUsByModel.totalFree}</strong>
                </div>

                <div className="mb-2">
                  <strong>Free by Model:</strong>
                  {Object.entries(freeGPUsByModel.freeGPUs || {}).map(
                    ([model, count]) => (
                      <div key={model} className="ml-4">
                        {model}: {count}
                      </div>
                    )
                  )}
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer font-semibold">GPU Details</summary>
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {freeGPUsByModel.gpuDetails?.map((gpu: any, index: number) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded">
                        <div className="font-mono text-xs">
                          <strong>{gpu.modelName}</strong> - {gpu.deviceId}
                        </div>
                        <div className="text-xs text-gray-600">
                          Node: {gpu.nodeName} | Memory: {gpu.freeMemoryMB}MB/
                          {gpu.totalMemoryMB}MB
                        </div>
                        <div className="text-xs text-gray-500">
                          UUID: {gpu.uuid} | Driver: {gpu.driverVersion}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </>
            )}
          </div>
        )}

        {nodeAllocatableResources && (
          <div className="mt-4 p-4 bg-indigo-100 rounded text-xs">
            <h3 className="font-bold mb-2">Node Allocatable Resources:</h3>

            {nodeAllocatableResources.error ? (
              <div className="text-red-600">{nodeAllocatableResources.error}</div>
            ) : (
              <>
                <div className="mb-4 flex gap-4">
                  <span>
                    <strong>Total Nodes:</strong>{" "}
                    {nodeAllocatableResources.summary?.totalNodes || 0}
                  </span>
                  <span>
                    <strong>Resource Types:</strong>{" "}
                    {nodeAllocatableResources.summary?.resourceTypes?.length || 0}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Available Resource Types:</h4>
                  <div className="flex flex-wrap gap-1">
                    {nodeAllocatableResources.summary?.resourceTypes?.map(
                      (resource: string) => (
                        <span
                          key={resource}
                          className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
                        >
                          {resource}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Node Resources:</h4>
                  <div className="max-h-64 overflow-y-auto">
                    {nodeAllocatableResources.nodes?.map((node: any) => (
                      <div key={node.name} className="p-2 bg-white rounded mb-2">
                        <div className="font-mono text-sm font-semibold mb-1">
                          {node.name}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(node.resources).map(([resource, value]) => (
                            <div key={resource} className="flex justify-between text-xs">
                              <span className="text-gray-600">{resource}:</span>
                              <span className="font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GpuMetricsTester;
