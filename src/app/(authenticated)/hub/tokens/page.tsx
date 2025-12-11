"use client";

import { Clipboard, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { useOptimistic, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTokens } from "@/features/tokens/api/get-tokens";
import { useAuth } from "@/hooks/useAuth";
import { createUserToken, deleteUserToken } from "@/services/client/jupyterHub";
import { useServerOptions } from "@/features/options/api/get-options";

export default function TokensPage1() {
  const [tokenNote, setTokenNote] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const { user } = useAuth();
  const { data: tokens, isLoading, refetch } = useTokens();

  const { data: options } = useServerOptions({
    serverName: "czcz",
  });

  console.log("Server Options:", options);

  const handleCreateToken = async () => {
    try {
      const result = await createUserToken(
        {
          note: tokenNote || "API Token",
        },
        user?.name,
      );

      // The token field contains the actual token value
      if (result.token) {
        setNewToken(result.token);
      }
      setTokenNote("");
      await refetch();
    } catch (error) {
      console.error("Failed to create token:", error);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    try {
      await deleteUserToken(tokenId, user?.name);
      await refetch();
    } catch (error) {
      console.error("Failed to revoke token:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tokens...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">API Tokens</h1>
        <p className="text-muted-foreground">Manage your JupyterHub API tokens</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Token</CardTitle>
          <CardDescription>
            API tokens can be used to access the JupyterHub API. Be careful with these tokens as they provide access to
            your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {newToken && (
              <div className="flex items-center justify-between rounded-md border bg-yellow-50 p-4">
                <div className="flex-1">
                  <p className="mb-1 font-medium">Your new token:</p>
                  <div className="flex items-center">
                    <code className="rounded bg-yellow-100 p-2 text-sm">
                      {showToken ? newToken : "•".repeat(Math.min(20, newToken.length))}
                    </code>
                    <Button className="ml-2" size="icon" variant="ghost" onClick={() => setShowToken(!showToken)}>
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button className="ml-2" size="icon" variant="ghost" onClick={() => copyToClipboard(newToken)}>
                      <Clipboard size={16} />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-yellow-700">
                    Save this token somewhere safe. You won&#39;t be able to see it again!
                  </p>
                </div>
                <Button variant="outline" onClick={() => setNewToken(null)}>
                  Close
                </Button>
              </div>
            )}

            <div className="flex space-x-2">
              <Input
                className="flex-1"
                placeholder="Token description"
                value={tokenNote}
                onChange={(e) => setTokenNote(e.target.value)}
              />
              <Button onClick={handleCreateToken}>
                <Plus className="mr-2 h-4 w-4" />
                Create Token
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tokens</CardTitle>
          <CardDescription>List of your active API tokens. Revoke any tokens that you no longer need.</CardDescription>
        </CardHeader>
        <CardContent>
          {tokens && tokens.length > 0 ? (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 p-4 shadow-sm"
                >
                  <div>
                    <div className="font-medium">{token.note || "API Token"}</div>
                    <div className="text-muted-foreground text-sm">
                      Created: {new Date(token.created).toLocaleString()}
                    </div>
                    {token.last_activity && (
                      <div className="text-muted-foreground text-sm">
                        Last used: {new Date(token.last_activity).toLocaleString()}
                      </div>
                    )}
                    {token.expires_at && (
                      <Badge className="mt-1" variant="outline">
                        Expires: {new Date(token.expires_at).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleRevokeToken(token.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">You don&#39;t have any API tokens yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
