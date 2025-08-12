import { ServerStatus, JupyterHubServerOptions } from "@/services/jupyterHub";

// Updated ServerStatus type that requires complete user_options
type MockServerStatus = Omit<ServerStatus, "user_options"> & {
  user_options: JupyterHubServerOptions;
};

export const mockUser = {
  name: "demo-user",
  admin: false,
  groups: ["users", "data-science"],
  server: "/user/demo-user/",
  pending: null,
  created: "2024-01-01T00:00:00Z",
  last_activity: "2024-01-16T10:30:00Z",
  servers: {
    "": {
      name: "",
      ready: true,
      pending: null,
      url: "/user/demo-user/",
      user_options: {
        container_image: "cerit.io/hubs/minimalnb-cs:31-10-2024",
        custom: false,
        ssh: false,
        phome: "remain",
        mountprojects: false,
        home: null,
        cpu: "1",
        mem: "2",
        gpu: "none",
        shmsize: "2",
      },
      started: "2024-01-16T08:00:00Z",
      last_activity: "2024-01-16T10:25:00Z",
    },
  },
};

export const mockServers: MockServerStatus[] = [
  {
    name: "Server",
    ready: true,
    stopped: false,
    pending: null,
    url: "/user/demo-user/",
    user_options: {
      container_image: "cerit.io/hubs/minimalnb-cs:31-10-2024",
      custom: false,
      ssh: false,
      phome: "remain",
      mountprojects: false,
      home: null,
      cpu: "1",
      mem: "2",
      gpu: "none",
      shmsize: "2",
    },
    started: "2024-01-16T08:00:00Z",
    last_activity: "2024-01-16T10:25:00Z",
  },
  {
    name: "gpu-server",
    ready: false,
    stopped: false,
    pending: "spawn",
    url: "/user/demo-user/gpu-server/",
    user_options: {
      container_image: "tensorflow/tensorflow:latest-gpu",
      custom: true,
      ssh: true,
      phome: "new-persistent-home",
      mountprojects: true,
      home: "/storage/brno2/home/demo-user",
      mounttostorage: true,
      cpu: "4",
      mem: "8",
      gpu: "1",
      shmsize: "8",
    },
    started: null,
  },
  {
    name: "gpu",
    ready: false,
    stopped: true,
    pending: null,
    url: "/user/demo-user/gpu-server/",
    user_options: {
      container_image: "tensorflow/tensorflow:latest-gpu",
      custom: true,
      ssh: false,
      phome: "remain",
      mountprojects: false,
      home: null,
      cpu: "4",
      mem: "8",
      gpu: "mig-1g.5gb",
      migamount: "2",
      shmsize: "8",
    },
    started: null,
  },
  {
    name: "data-processing",
    ready: false,
    stopped: false,
    pending: "stop",
    url: "/user/demo-user/data-processing/",
    user_options: {
      container_image: "jupyter/datascience-notebook",
      custom: true,
      ssh: false,
      phome: "existing-home-volume",
      mountprojects: true,
      home: "/storage/praha1/home/demo-user",
      mounttostorage: false,
      s3url: "https://s3.example.com",
      s3bucket: "my-data-bucket",
      s3accesskey: "AKIAIOSFODNN7EXAMPLE",
      s3secretkey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      cpu: "8",
      mem: "16",
      gpu: "none",
      shmsize: "16",
    },
    started: "2024-01-15T14:20:00Z",
    last_activity: "2024-01-16T09:45:00Z",
  },
  {
    name: "ml-experiment",
    ready: true,
    stopped: false,
    pending: null,
    url: "/user/demo-user/ml-experiment/",
    user_options: {
      container_image: "cerit.io/hubs/pytorch:24-10-2024",
      custom: false,
      ssh: true,
      phome: "delete",
      mountprojects: false,
      home: null,
      s3existing: "my-existing-s3-config",
      cpu: "2",
      mem: "4",
      gpu: "none",
      shmsize: "4",
    },
    started: "2024-01-15T14:20:00Z",
    last_activity: "2024-01-16T09:45:00Z",
  },
];
// Convert array to Record format for components that expect Record<string, ServerStatus>
export const mockServersRecords: Record<string, ServerStatus> =
  mockServers.reduce(
    (acc, server) => {
      acc[server.name] = server;

      return acc;
    },
    {} as Record<string, ServerStatus>,
  );
