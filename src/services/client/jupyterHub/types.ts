// Types for JupyterHub client
export interface ServerProgress {
  progress: number;
  failed: boolean | undefined;
  ready: boolean | undefined;
  message: string;
  html_message: string;
  url: string;
}

export interface ServerStatus {
  name: string;
  full_name?: string;
  ready: boolean;
  stopped: boolean;
  pending: "spawn" | "stop" | null;
  user_options?: JupyterHubServerOptions;
  url?: string;
  progress?: {
    message: string;
    percent: number;
  };
  last_activity?: string;
  started?: string | null;
  state?: {
    pod_name?: string;
  };
  progress_url?: string | null;
  full_url?: string | null;
  full_progress_url?: string | null;
}

export interface UserInfo {
  name: string;
  admin: boolean;
  servers: Record<string, ServerStatus>;
  groups: string[];
}

export interface ServerOptions {
  name?: string;
  image?: string;
  [key: string]: any;
}

export interface JupyterHubServerOptions {
  container_image: string;
  custom?: boolean;
  ssh: boolean;
  phome: string | "delete" | "remain";
  mountprojects: boolean;
  home: string | null;
  mounttostorage?: boolean;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  s3existing?: string;
  cpu: string;
  mem: string;
  gpu: string;
  migamount?: string;
  shmsize: string;
}
