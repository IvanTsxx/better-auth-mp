import type { ReactNode } from "react";

export default function BlogPostTemplate({
  title,
  author,
  date,
  category,
  avatar,
}: {
  title: ReactNode;
  author: ReactNode;
  date: ReactNode;
  category: ReactNode;
  avatar?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(circle at 50% -10%, rgba(96, 148, 110, 0.35) 0%, transparent 50%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 50px 50px, 50px 50px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: 'Inter, "Material Icons", sans-serif',
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      }}
    >
      {/* Category */}
      <div style={{ alignItems: "flex-start", display: "flex" }}>
        <div
          style={{
            backgroundColor: "rgba(96, 148, 110, 0.2)",
            border: "1px solid rgba(96, 148, 110, 0.5)",
            borderRadius: "9999px",
            color: "#86efac",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.05em",
            padding: "8px 24px",
            textTransform: "uppercase",
          }}
        >
          {category}
        </div>
      </div>

      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <h1
          style={{
            background:
              "linear-gradient(to bottom right, #ffffff 30%, #a1a1aa)",
            backgroundClip: "text",
            color: "transparent",
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: 0,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Author */}
      <div style={{ alignItems: "center", display: "flex", gap: "24px" }}>
        <div
          style={{
            border: "2px solid #60946E",
            borderRadius: "50%",
            boxShadow: "0 0 20px rgba(96, 148, 110, 0.3)",
            display: "flex",
            height: 80,
            overflow: "hidden",
            width: 80,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            height="80"
            src={avatar}
            style={{
              height: "100%",
              objectFit: "cover",
              width: "100%",
            }}
            width="80"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "white", fontSize: 28, fontWeight: 600 }}>
            {author}
          </span>
          <span style={{ color: "#a1a1aa", fontSize: 20, marginTop: "4px" }}>
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}
