"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function Login() {
  const { login, error } = useAuth();

  const handleHubOauth = () => {
    // TODO: Remove dependency on localStorage token
    login("dummy_token", true);
    redirect("/api/auth/login");
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
