"use client";

import Link from "next/link";
import { ArrowLeft, Home, Search, Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-6xl font-bold text-muted-foreground mb-2">
              404
            </h1>
            <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground text-lg">
              The notebook server or page you're looking for doesn't exist or
              has been moved.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              What you can do next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Here are some helpful links to get you back on track:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/hub">
                <Button className="w-full justify-start" variant="default">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/hub/spawn">
                <Button className="w-full justify-start" variant="outline">
                  <Server className="h-4 w-4 mr-2" />
                  Start New Server
                </Button>
              </Link>
            </div>
            <div className="pt-2">
              <Button
                className="w-full justify-start"
                variant="ghost"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please check:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• The URL is spelled correctly</li>
                <li>• Your notebook server is still running</li>
                <li>• You have the necessary permissions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
