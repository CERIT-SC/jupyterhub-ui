import { Inter, Montserrat, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontDisplay = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
// export const fontSans = Montserrat({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });
//
// export const fontMono = Inter({
//   subsets: ["latin"],
//   variable: "--font-mono",
// });
