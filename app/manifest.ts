import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Deutsch Trainer",
    short_name: "Deutsch",
    description: "German drills with strict grading and mistake tracking.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
