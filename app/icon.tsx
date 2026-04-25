import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -1,
            fontFamily: "sans-serif",
          }}
        >
          KJ
        </span>
      </div>
    ),
    { ...size }
  );
}
