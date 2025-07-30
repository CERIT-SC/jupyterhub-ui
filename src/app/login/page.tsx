"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Login() {
  const { authData } = useAuthStorage();
  const { isLoading, login, error } = useAuth();
  const [tokenInput, setTokenInput] = useState(authData.token || "");
  const [isOldHub, setIsOldHub] = useState(authData.isOldHub || false);
  const router = useRouter();

  const handleHubOauth = () => {
    // Redirect to the JupyterHub OAuth login page
    window.location.href =
      `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/api/oauth2/authorize` +
      `?client_id=${process.env.NEXT_PUBLIC_JUPYTERHUB_CLIENT_ID}` +
      `&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback` +
      `&response_type=code`;

    // TODO: Remove dependency on localStorage token
    login("dummy_token", isOldHub);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
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
          <div className={"flex flex-col gap-2"}>
            <Button onClick={handleHubOauth}>Login in using Oauth</Button>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error.message}
              </div>
            )}
          </div>
          <CardDescription className="text-center">
            Using official Jupyterhub instance at https://hub.cloud.e-infra.cz/
            in background
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
