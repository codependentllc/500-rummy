import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "500 Rummy",
    short_name: "500 Rummy",
    description: "A polished mobile-first 500 Rummy card game.",
    start_url: "/",
    display: "standalone",
    background_color: "#06150d",
    theme_color: "#06150d",
    orientation: "any",
    icons: [
      { src: "/icons/icon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
