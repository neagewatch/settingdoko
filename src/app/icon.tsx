import { ImageResponse } from "@vercel/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 32, height: 32,
        background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        ⚙️
      </div>
    ),
    { ...size }
  );
}
