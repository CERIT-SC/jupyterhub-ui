"use client";

import { FC, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useOidc } from "@/hooks/useOidc";

const OAuthCallbackPage: FC = () => {
  const { user, userManager } = useOidc();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCallback = async () => {
    try {
      // This handles code exchange and state verification automatically
      await userManager?.signinCallback();
      router.push("/");
    } catch (error) {
      console.error("Sign-in callback error:", error);
      router.push("/");
    }
  };

  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const auth = useContext(AuthContext);
  //
  // useEffect(() => {
  //   const token = searchParams.get("token");
  //
  //   if (!token) {
  //     console.error("No token received in OAuth callback");
  //     router.push("/");
  //     return;
  //   }
  //
  //   try {
  //     auth?.login(token);
  //     router.push("/hub/dashboard");
  //   } catch (error) {
  //     console.error("Error during OAuth callback:", error);
  //     router.push("/");
  //   }
  // }, [searchParams, router, auth]);

  const tryPost = () => {};

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="card-soft p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <div className="text-center text-infra-text-secondary">
          Please wait while we complete your authentication
        </div>
        <Button disabled={!user} onClick={() => console.log(user)}>
          Print user
        </Button>
        <Button onClick={() => handleCallback()}>Callback handle</Button>
        <Button onClick={() => tryPost()}>Try post</Button>
      </div>
    </main>
  );
};

export default OAuthCallbackPage;
