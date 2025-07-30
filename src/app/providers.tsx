"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

export interface ProvidersProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/hub");
      }
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // If user is null and we're not on login page, don't render children
  if (!user && pathname !== "/login") {
    return <LoadingIndicator />;
  }

  return children;
};

const LoadingIndicator = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
  </div>
);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10000, // 10 seconds
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <TooltipProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </TooltipProvider>
        </AuthGuard>
      </AuthProvider>
    </QueryClientProvider>
  );
}
