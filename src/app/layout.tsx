import type { Metadata } from "next";

import "@/styles/globals.css";

import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { fontSans } from "@/config/fonts";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    // TODO(meta): Set better favicon
    icon: "/favicon.ico",
  },
  // TODO(meta): Share link setting
  // openGraph: {
  //   title: siteConfig.name,
  //   description: siteConfig.description,
  //   url: "https://yourdomain.com",
  //   siteName: siteConfig.name,
  //   images: [
  //     {
  //       url: "/og-image.png",
  //       width: 1200,
  //       height: 630,
  //       alt: siteConfig.name,
  //     },
  //   ],
  //   type: "website",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen g bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
