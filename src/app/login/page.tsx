"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { authData } = useAuthStorage();
  const { isLoading, login, error } = useAuth();
  const [tokenInput, setTokenInput] = useState(authData.token || "");
  const [isOldHub, setIsOldHub] = useState(authData.isOldHub || false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      login(tokenInput.trim(), isOldHub);
    }
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="token">Access Token</Label>
              <Input
                disabled={isLoading}
                id="token"
                placeholder="Enter your access token"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={isOldHub}
                disabled={isLoading}
                id="isOldHub"
                onCheckedChange={setIsOldHub}
              />
              <Label htmlFor="isOldHub">Use Old Hub</Label>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error.message}</div>
            )}

            <Button
              className="w-full"
              disabled={isLoading || !tokenInput.trim()}
              type="submit"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
