import { ImageResponse } from "next/og";

export const alt = "Shadesology — Premium Custom Shade Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #123b2c, #2d6a4f)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ color: "#d4a853", fontSize: 26, letterSpacing: 8 }}>SHADESOLOGY</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 34, fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
          Custom shade solutions,
          <br />
          made for your space.
        </div>
        <div style={{ marginTop: 28, color: "#dce8df", fontSize: 28 }}>
          Awnings · Pergolas · Screens · Shade sails
        </div>
      </div>
    ),
    size,
  );
}
