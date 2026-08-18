import { ImageResponse } from "@vercel/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 32, height: 32,
        background: "#E85D2A",
        borderRadius: 2,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, fontWeight: 800, color: "#FFFDF8",
      }}>
        ?
      </div>
    ),
    { ...size }
  );
}
