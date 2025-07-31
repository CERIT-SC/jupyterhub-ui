import { FC, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  callPrometheusServer,
  getPrometheusHealth,
  getPrometheusMetrics,
} from "@/api/prometheus/prometheus-api";

const PrometheusApiTester: FC = () => {
  const [loading, setLoading] = useState(false);
  const [prometheusResponse, setPrometheusResponse] = useState<any>(null);
  const [prometheusMetrics, setPrometheusMetrics] = useState<any>(null);
  const [prometheusHealth, setPrometheusHealth] = useState<any>(null);

  const handleCallPrometheus = async () => {
    setLoading(true);
    try {
      const response = await callPrometheusServer();

      setPrometheusResponse(response);
    } catch (error) {
      console.error("Failed to call Prometheus server:", error);
      setPrometheusResponse({ error: "Failed to call Prometheus server" });
    } finally {
      setLoading(false);
    }
  };

  const handleGetPrometheusMetrics = async () => {
    setLoading(true);
    try {
      const metrics = await getPrometheusMetrics();

      setPrometheusMetrics(metrics);
    } catch (error) {
      console.error("Failed to get Prometheus metrics:", error);
      setPrometheusMetrics({ error: "Failed to get Prometheus metrics" });
    } finally {
      setLoading(false);
    }
  };

  const handleGetPrometheusHealth = async () => {
    setLoading(true);
    try {
      const health = await getPrometheusHealth();

      setPrometheusHealth(health);
    } catch (error) {
      console.error("Failed to get Prometheus health:", error);
      setPrometheusHealth({ error: "Failed to get Prometheus health" });
    } finally {
      setLoading(false);
    }
  };

  const handleQueryPrometheusMetrics = async () => {
    setLoading(true);
    try {
      const metrics = await getPrometheusMetrics("up");

      setPrometheusMetrics(metrics);
    } catch (error) {
      console.error("Failed to query Prometheus metrics:", error);
      setPrometheusMetrics({ error: "Failed to query Prometheus metrics" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Prometheus</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Button disabled={loading} onClick={handleCallPrometheus}>
            {loading ? "Loading..." : "Call Prometheus Server"}
          </Button>
          <Button disabled={loading} onClick={handleGetPrometheusHealth}>
            {loading ? "Loading..." : "Get Health Status"}
          </Button>
          <Button disabled={loading} onClick={handleGetPrometheusMetrics}>
            {loading ? "Loading..." : "Get All Metrics"}
          </Button>
          <Button disabled={loading} onClick={handleQueryPrometheusMetrics}>
            {loading ? "Loading..." : "Query 'up' Metrics"}
          </Button>
        </div>

        {prometheusResponse && (
          <div className="mt-4 p-4 bg-purple-100 rounded text-xs">
            <h3 className="font-bold mb-2">Prometheus Server Response:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-32">
              {JSON.stringify(prometheusResponse, null, 2)}
            </pre>
          </div>
        )}

        {prometheusHealth && (
          <div className="mt-4 p-4 bg-green-100 rounded text-xs">
            <h3 className="font-bold mb-2">Prometheus Health:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-32">
              {JSON.stringify(prometheusHealth, null, 2)}
            </pre>
          </div>
        )}

        {prometheusMetrics && (
          <div className="mt-4 p-4 bg-yellow-100 rounded text-xs">
            <h3 className="font-bold mb-2">Prometheus Metrics:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-32">
              {JSON.stringify(prometheusMetrics, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrometheusApiTester;
