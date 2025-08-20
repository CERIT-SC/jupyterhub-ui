import { FC, useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/context/AuthContext";
import {
  createDefaultServer,
  deleteServer,
  getServerStatus,
  getUserInfo,
  ServerOptions,
  ServerStatus,
  startServer,
  stopServer,
  UserInfo,
} from "@/services/client/jupyterHub";
import { getDefaultImage } from "@/config/hub/imageOptions";

const JupyterHubTester: FC = () => {
  const authContext = useContext(AuthContext);
  const username = authContext?.user?.name;

  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [serverName, setServerName] = useState("test-server");
  const [serverOptions] = useState<ServerOptions>({
    name: "test-server",
    image: getDefaultImage(), // Use the image property instead of images
    cpuselection: "1",
    memselection: "4",
  });
  const [actionResult, setActionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleGetUserInfo = async () => {
    setLoading(true);
    setActionResult(null);
    try {
      const info = await getUserInfo(username);

      setUserInfo(info);
      setActionResult({
        success: true,
        message: "Successfully retrieved user info",
      });
    } catch (error) {
      console.error("Failed to get JupyterHub user info:", error);
      setActionResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get user info",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetServerStatus = async () => {
    if (!serverName) {
      setActionResult({ success: false, message: "Server name is required" });

      return;
    }

    setLoading(true);
    setActionResult(null);
    try {
      const status = await getServerStatus(serverName, username);

      setServerStatus(status);
      setActionResult({
        success: true,
        message: `Successfully retrieved status for ${serverName}`,
      });
    } catch (error) {
      console.error(`Failed to get server status for ${serverName}:`, error);
      setActionResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Failed to get status for ${serverName}`,
      });
      setServerStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartServer = async () => {
    if (!serverName) {
      setActionResult({ success: false, message: "Server name is required" });

      return;
    }

    setLoading(true);
    setActionResult(null);
    try {
      await startServer(serverName, serverOptions, username);
      setActionResult({
        success: true,
        message: `Successfully started server ${serverName}`,
      });
      // Get updated status
      await handleGetServerStatus();
    } catch (error) {
      console.error(`Failed to start server ${serverName}:`, error);
      setActionResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Failed to start server ${serverName}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStopServer = async () => {
    if (!serverName) {
      setActionResult({ success: false, message: "Server name is required" });

      return;
    }

    setLoading(true);
    setActionResult(null);
    try {
      await stopServer(serverName, username);
      setActionResult({
        success: true,
        message: `Successfully stopped server ${serverName}`,
      });
      // Get updated status
      setTimeout(handleGetServerStatus, 1000);
    } catch (error) {
      console.error(`Failed to stop server ${serverName}:`, error);
      setActionResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Failed to stop server ${serverName}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!serverName) {
      setActionResult({ success: false, message: "Server name is required" });

      return;
    }

    setLoading(true);
    setActionResult(null);
    try {
      await deleteServer(serverName, username);
      setActionResult({
        success: true,
        message: `Successfully deleted server ${serverName}`,
      });
      setServerStatus(null);
      // Refresh user info
      await handleGetUserInfo();
    } catch (error) {
      console.error(`Failed to delete server ${serverName}:`, error);
      setActionResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Failed to delete server ${serverName}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>JupyterHub API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="serverName">Server Name:</Label>
          <Input
            id="serverName"
            placeholder="Enter server name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button disabled={loading} onClick={handleGetUserInfo}>
            {loading ? "Loading..." : "Get User Info"}
          </Button>
          <Button disabled={loading} onClick={handleGetServerStatus}>
            {loading ? "Loading..." : "Get Server Status"}
          </Button>
          <Button disabled={loading} onClick={handleStartServer}>
            {loading ? "Loading..." : "Start Server"}
          </Button>
          <Button disabled={loading} onClick={handleStopServer}>
            {loading ? "Loading..." : "Stop Server"}
          </Button>
          <Button
            disabled={loading}
            variant="secondary"
            onClick={async () => {
              if (!serverName) {
                setActionResult({
                  success: false,
                  message: "Server name is required",
                });

                return;
              }

              setLoading(true);
              setActionResult(null);
              try {
                await createDefaultServer(serverName, username);
                setActionResult({
                  success: true,
                  message: `Successfully created default server ${serverName}`,
                });
                // Get updated status
                setTimeout(handleGetServerStatus, 1000);
              } catch (error) {
                console.error(
                  `Failed to create default server ${serverName}:`,
                  error,
                );
                setActionResult({
                  success: false,
                  message:
                    error instanceof Error
                      ? error.message
                      : `Failed to create default server ${serverName}`,
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Loading..." : "Quick Start"}
          </Button>
          <Button
            className="col-span-2"
            disabled={loading}
            variant="destructive"
            onClick={handleDeleteServer}
          >
            {loading ? "Loading..." : "Delete Server"}
          </Button>
        </div>

        {actionResult && (
          <div
            className={`mt-4 p-4 rounded text-xs ${actionResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            <h3 className="font-bold mb-2">Result:</h3>
            <p>{actionResult.message}</p>
          </div>
        )}

        {userInfo && (
          <div className="mt-4 p-4 bg-blue-100 rounded text-xs">
            <h3 className="font-bold mb-2">User Info:</h3>
            <div className="mb-2">
              <strong>Username:</strong> {userInfo.name}
            </div>
            <div className="mb-2">
              <strong>Admin:</strong> {userInfo.admin ? "Yes" : "No"}
            </div>
            <div className="mb-2">
              <strong>Groups:</strong> {userInfo.groups?.join(", ") || "None"}
            </div>
            <div className="mb-2">
              <strong>Servers:</strong>{" "}
              {Object.keys(userInfo.servers || {}).length}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold">
                Full User Info
              </summary>
              <pre className="whitespace-pre-wrap overflow-auto max-h-32 mt-2">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {serverStatus && (
          <div className="mt-4 p-4 bg-purple-100 rounded text-xs">
            <h3 className="font-bold mb-2">Server Status:</h3>
            <div className="mb-2">
              <strong>Name:</strong> {serverStatus.name}
            </div>
            <div className="mb-2">
              <strong>Status:</strong>{" "}
              {serverStatus.ready
                ? "Running"
                : serverStatus.pending === "spawn"
                  ? "Starting"
                  : serverStatus.pending === "stop"
                    ? "Stopping"
                    : "Stopped"}
            </div>
            {serverStatus.url && (
              <div className="mb-2">
                <strong>URL:</strong>{" "}
                <a
                  className="text-blue-600 hover:underline"
                  href={serverStatus.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {serverStatus.url}
                </a>
              </div>
            )}
            {serverStatus.progress && (
              <div className="mb-2">
                <strong>Progress:</strong> {serverStatus.progress.percent}% -{" "}
                {serverStatus.progress.message}
              </div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold">
                Full Server Status
              </summary>
              <pre className="whitespace-pre-wrap overflow-auto max-h-32 mt-2">
                {JSON.stringify(serverStatus, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JupyterHubTester;
