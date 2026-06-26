import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "hassancreates — Visual & Motion Designer Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0D0D",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple radial glow */}
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(107,33,217,0.45) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Grid lines overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(107,33,217,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(107,33,217,0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          {/* Tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(107,33,217,0.2)",
              border: "1px solid rgba(107,33,217,0.5)",
              borderRadius: 100,
              padding: "8px 20px",
              color: "#C084FC",
              fontSize: 14,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Visual &amp; Motion Designer · London
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            HassanCreates
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
              textAlign: "center",
              letterSpacing: "-0.01em",
              maxWidth: 700,
            }}
          >
            I turn ideas into visuals that stick.
          </div>
        </div>

        {/* Bottom domain badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,0.3)",
            fontSize: 16,
            letterSpacing: "0.05em",
          }}
        >
          hassancreates.design
        </div>
      </div>
    ),
    { ...size }
  );
}
