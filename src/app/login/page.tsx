"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRuntimeConfig } from "@/hooks/useRuntimeConfig";

export default function Login() {
  const searchParams = useSearchParams();
  const { error } = useAuth();
  const cfg = useRuntimeConfig();

  const [showSessionExpiredMessage, setShowSessionExpiredMessage] =
    useState(false);

  // Check for session expired parameter
  useEffect(() => {
    const sessionExpired = searchParams.get("sessionExpired");

    if (sessionExpired === "jupyterhub") {
      setShowSessionExpiredMessage(true);

      // Clear the parameter from URL after showing the message
      // This prevents the message from showing again if user refreshes
      const url = new URL(window.location.href);

      url.searchParams.delete("sessionExpired");
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, [searchParams]);

  const handleHubOauth = () => {
    redirect("/api/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto p-6 space-y-6 max-w-7xl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login to JupyterHub
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-center">
            Currently in developement
          </CardDescription>
          {showSessionExpiredMessage && (
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertTitle>Session Expired</AlertTitle>
              <AlertDescription>
                Your JupyterHub session has expired. Please sign in again to
                continue.
              </AlertDescription>
            </Alert>
          )}
          <div className={"flex flex-col gap-2"}>
            <Button onClick={handleHubOauth}>Login in using Oauth</Button>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error.message}
              </div>
            )}
          </div>
          <CardDescription className="text-center">
            {`Using official JupyterHub instance at ${
              cfg?.jupyterhubUrl ?? "…"
            } in background`}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
