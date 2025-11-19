import { ImageResponse } from "next/og";

export const alt = "Organize suas escalas com facilidade";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#00786f",
          color: "white",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            marginBottom: 20,
            lineHeight: 1.1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
            gap: "16px",
          }}
        >
          <span>Organize suas escalas</span>
          <span> com facilidade</span>
        </div>

        <p
          style={{
            fontSize: 32,
            opacity: 0.75,
          }}
        >
          Gerencie bandas, equipes e cultos sem complicação.
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
