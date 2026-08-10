import { ImageResponse } from "next/og";
import { OgTemplate } from "@/lib/og/OgTemplate";
import { baseInfo } from "@/seo-configs/baseInfo";

export const alt = baseInfo.fullTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function Image() {
  return new ImageResponse(
    <OgTemplate
      title={baseInfo.fullTitle}
      description={baseInfo.description}
      variant="default"
    />,
    {
      ...size,
    },
  );
}
