"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { LoadingPage } from "@/components/ui/loading";

// const LoadingIndicator = () => (
//   <div className="flex items-center justify-center h-screen w-screen">
//     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
//   </div>
// );

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, error, loadUser, isLoadingUser } = useAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Wait for auth context to finish any loading
    if (isLoadingUser) return;

    // If there's an authentication error, redirect to login
    if (error) {
      router.push("/login");

      return;
    }

    // If user is already loaded, we're ready
    if (user) {
      setIsInitializing(false);

      return;
    }

    loadUser().then((success) => {
      console.log("User loaded:", success);
    });
  }, [user, error, loadUser, isLoadingUser, router]);

  if (isInitializing) {
    return <LoadingPage />;
  }

  return children;
}
