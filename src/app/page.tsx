"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStorage } from "@/hooks/useAuthStorage";

export default function Home() {
  const router = useRouter();
  const { hasToken } = useAuthStorage();

  const handleGetStarted = () => {
    if (hasToken) {
      router.push("/hub");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Welcome to JupyterHub</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Access your JupyterHub environment with ease
          </p>
          <Button className="w-full" onClick={handleGetStarted}>
            {hasToken ? "Go to Hub" : "Get Started"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
