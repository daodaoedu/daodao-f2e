import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "島島阿學",
    short_name: "島島阿學",
    description: "島島阿學 — 學習資源平台",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16B2A5",
    icons: [
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
