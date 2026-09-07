import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#f4f1ea",
        }}
      >
        <div
          style={{
            fontSize: 160,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            fontFamily: "sans-serif",
          }}
        >
          DRESDE
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#b99a63",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginTop: 12,
          }}
        >
          Más que un corte, una experiencia
        </div>
      </div>
    ),
    { ...size }
  );
}
