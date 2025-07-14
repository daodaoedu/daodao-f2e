import dynamic from "next/dynamic";

export const Speech = dynamic(() => import("./speech"), {
  ssr: false,
});
