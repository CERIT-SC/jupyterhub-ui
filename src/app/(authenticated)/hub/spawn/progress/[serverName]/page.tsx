"use client";

import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useServerProgress } from "@/features/servers/api/get-server-progress";
import { useAuth } from "@/hooks/useAuth";
import { getUsernameOrDefault, ServerProgress } from "@/services/client/jupyterHub";
import axios from "axios";
import { jupyterHubClient } from "@/api/jupyterhub/jupyerhubApiClient";
import { env } from "next-runtime-env";
type PageState = "starting" | "progress" | "ready" | "failed" | "error";

export default function SpawnProgress() {
  const params = useParams();

  const serverName = typeof params.serverName === "string" ? params.serverName : "";

  const { user } = useAuth();

  const [running, setRunning] = useState<boolean>(true);
  const [pageState, setPageState] = useState<PageState>("starting");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { data, isError, error, isFetched, isStreaming, start, stop } = useServerProgress({
    serverName,
    username: user?.name,
    autoStart: true,
  });

  const JUPYTERHUB_URL = env("NEXT_PUBLIC_JUPYTERHUB_URL");
  // Reflect connection state: starting while connecting, progress when open
  useEffect(() => {
    if (!isStreaming) {
      setPageState("starting");
    } else {
      setPageState((prev) => (prev === "ready" || prev === "failed" ? prev : "progress"));
    }
  }, [isStreaming]);

  // Drive UI and history from stream data
  useEffect(() => {
    if (data) {
      // progress history
      if (data.progress !== prevProgressRef.current) {
        const progressChange = data.progress - prevProgressRef.current;
        if (progressChange > 0) {
          const timestamp = new Date().toLocaleTimeString();
          setMessageHistory((prev) => [
            ...prev,
            `[${timestamp}] Progress update: ${prevProgressRef.current}% → ${data.progress}% (+${progressChange}%)`,
          ]);
        }
        prevProgressRef.current = data.progress;
      }

      // append event message if present
      if (data.message && data.message.trim() !== "") {
        setMessageHistory((prev) => {
          if (prev.length > 0 && prev[prev.length - 1] === data.message) return prev;
          const timestamp = new Date().toLocaleTimeString();
          return [...prev, `[${timestamp}] ${data.message}`];
        });
      }

      // terminal states when stream stops at 100
      if (data.progress >= 100) {
        setRunning(false);
        if (data.ready) {
          setPageState("ready");
          if (countdown === null) setCountdown(4);
        } else if (data.failed) {
          setPageState("failed");
        } else {
          // 100 but not ready => treat as failed
          setPageState("failed");
        }
      }
    }

    if (isError) {
      setPageState("error");
      setRunning(false);
    }
  }, [data, isError, error, serverName]);

  // Store previous progress value to detect changes
  const prevProgressRef = useRef<number>(0);

  // Countdown timer effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && data?.url) {
      // Auto-redirect when countdown reaches 0
      handleOpenServer();
    }
  }, [countdown, data?.url]);

  // Handle manual redirect
  const handleOpenServer = () => {
    if (data?.url && JUPYTERHUB_URL) {
      window.location.href = JUPYTERHUB_URL + data.url;
    }
  };

  const getStateIcon = () => {
    switch (pageState) {
      case "ready":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
    }
  };

  const getStateBadge = () => {
    switch (pageState) {
      case "starting":
        return <Badge variant="secondary">Starting</Badge>;
      case "progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "ready":
        return (
          <Badge className="bg-green-500" variant="default">
            Ready
          </Badge>
        );
      case "failed":
        return <Badge variant="warning">Failed</Badge>;
      case "error":
        return <Badge variant="warning">Error</Badge>;
    }
  };

  const getStatusText = () => {
    switch (pageState) {
      case "starting":
        return "Starting server...";
      case "progress":
        return "Server spawn in progress...";
      case "ready":
        return `Server is ready at ${data?.url || ""}`;
      case "failed":
        return "Server spawn failed";
      case "error":
        return "Error fetching server status";
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Link href="/hub/spawn">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Spawn
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStateIcon()}
              Server Spawn Progress
            </CardTitle>
            {getStateBadge()}
          </div>
          <p className="text-muted-foreground text-sm">
            Server name: <span className="text-infra-primary">{serverName}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{getStatusText()}</span>
              <span className="text-muted-foreground text-sm">{data?.progress || 0}%</span>
            </div>
            <Progress className={`h-2 ${pageState === "failed" ? "bg-red-200" : ""}`} value={data?.progress || 0} />
          </div>

          {/*/!* Current Message *!/*/}
          {/*{data?.message && (*/}
          {/*  <div*/}
          {/*    className={`p-3 rounded-lg ${pageState === "failed" ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}*/}
          {/*  >*/}
          {/*    <p*/}
          {/*      className={`text-sm ${pageState === "failed" ? "text-red-800" : "text-blue-800"}`}*/}
          {/*    >*/}
          {/*      {data.message}*/}
          {/*    </p>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/* Error Message */}
          {pageState === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-red-800">Error</h3>
              </div>
              <p className="text-red-700">
                {(() => {
                  const errorObj = error as any;

                  if (errorObj?.response?.status === 404) {
                    return `Server '${serverName}' does not exist. Please check the server name and try again.`;
                  }

                  return errorObj?.message || "Failed to fetch server progress";
                })()}
              </p>

              {/* Show JSON response if available */}
              {(error as any)?.response?.data && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-red-800">Response Details</summary>
                  <pre className="mt-2 max-h-32 overflow-auto rounded border border-red-200 bg-white p-2 text-xs">
                    {JSON.stringify((error as any).response.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/*/!* HTML Message (if available) *!/*/}
          {/*{data?.html_message && (*/}
          {/*  <div*/}
          {/*    dangerouslySetInnerHTML={{ __html: data.html_message }}*/}
          {/*    className={`p-3 rounded-lg text-sm ${pageState === "failed" ? "bg-red-50 border border-red-200 text-red-800" : "bg-blue-50 border border-blue-200 text-blue-800"}`}*/}
          {/*  />*/}
          {/*)}*/}

          {/* Ready State - Show Open Server Button */}
          {pageState === "ready" && data?.url && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-green-800">Server Ready</h3>
              </div>
              <p className="mb-3 text-green-700">
                Your server has been successfully spawned and is ready to use.
                {countdown !== null && countdown > 0 && (
                  <span className="mt-2 block font-medium">
                    Redirecting automatically in {countdown} second
                    {countdown !== 1 ? "s" : ""}...
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleOpenServer}>
                  {countdown !== null && countdown > 0 ? `Open Server (${countdown}s)` : "Open Server"}
                </Button>
                {countdown !== null && countdown > 0 && (
                  <Button
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    variant="outline"
                    onClick={() => setCountdown(null)}
                  >
                    Cancel Auto-redirect
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Message History */}
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium">Message History</h3>
            <div
              ref={(el) => {
                // Auto-scroll to bottom when new messages are added
                if (el) {
                  el.scrollTop = el.scrollHeight;
                }
              }}
              className="max-h-48 overflow-y-auto rounded-lg border bg-gray-50 p-2"
            >
              {messageHistory.length > 0 ? (
                <div className="space-y-2">
                  {messageHistory.map((message, index) => (
                    <div key={index} className="rounded border border-gray-200 bg-white p-2 text-xs">
                      {(() => {
                        // Try to parse as JSON if message starts with { or [
                        if (
                          (message.startsWith("{") || message.startsWith("[")) &&
                          (message.endsWith("}") || message.endsWith("]"))
                        ) {
                          try {
                            const jsonObj = JSON.parse(message);

                            return (
                              <details>
                                <summary className="cursor-pointer font-medium">JSON Response</summary>
                                <pre className="mt-1 max-h-24 overflow-auto text-xs">
                                  {JSON.stringify(jsonObj, null, 2)}
                                </pre>
                              </details>
                            );
                          } catch {
                            // If parsing fails, just display as text
                            return message;
                          }
                        }

                        return message;
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-2 text-xs text-gray-500">No messages yet</p>
              )}
            </div>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-muted-foreground mt-4 text-xs">
              <details className="mt-2">
                <summary className="cursor-pointer">Debug Info</summary>
                <div className="mt-2 rounded bg-gray-100 p-2">
                  <p>State: {pageState}</p>
                  <p>Running: {running.toString()}</p>

                  <p>Fetched: {isFetched.toString()}</p>
                  <p>Server Name: {serverName}</p>
                  <p>Username: {user?.name}</p>

                  {isError && (
                    <div className="mt-2">
                      <h4 className="mb-1 font-medium">Error Details:</h4>
                      <div className="rounded bg-red-100 p-2">
                        <p>Status: {(error as any)?.response?.status || "Unknown"}</p>
                        <p>Message: {(error as Error)?.message || "Unknown error"}</p>
                        {(error as any)?.response?.data && (
                          <details>
                            <summary className="mt-1 cursor-pointer">Response Data</summary>
                            <pre className="mt-1 max-h-32 overflow-auto rounded bg-white p-2">
                              {JSON.stringify((error as any).response.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  )}

                  {data && (
                    <div className="mt-2">
                      <h4 className="mb-1 font-medium">Response Data:</h4>
                      <pre className="max-h-40 overflow-auto rounded bg-blue-50 p-2">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
