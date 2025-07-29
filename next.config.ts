import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "hub-dev-react.cloud.e-infra.cz",
    "hub-dev-python.cloud.e-infra.cz",
  ],
  async rewrites() {
    return [
      {
        source: "/api/hub/:path*",
        destination: `https://hub.cloud.e-infra.cz/hub/api/:path*`,
      },

      {
        source: "/api/prometheus/:path*",
        destination:
          "http://prometheus-operated.cattle-monitoring-system.svc.cluster.local:9090/:path*",
      },
    ];
  },
};

export default nextConfig;
