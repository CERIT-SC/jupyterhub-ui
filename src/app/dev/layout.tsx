import React from "react";

import { DevNavbar } from "@/components/layout/dev-navbar";

export default function DevLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <DevNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
