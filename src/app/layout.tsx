import type { Metadata, Viewport } from "next";
import "@/styles/rummy.css";

export const metadata: Metadata = {
  title: "500 Rummy MVP",
  applicationName: "500 Rummy",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png"
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "500 Rummy" }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#06150d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
