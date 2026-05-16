import { useState } from "react";

type Props = {
  src?: string;
  alt: string;
  fallback?: string;
  size?: number;
};

export function AvatarPhoto({ src, alt, fallback = "🧑", size = 42 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed || !String(src).startsWith("/")) {
    return (
      <div
        title={alt}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#e8e8e8",
          color: "#1a472a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.floor(size * 0.52),
          border: "2px solid rgba(255,255,255,0.75)",
          overflow: "hidden",
          flexShrink: 0
        }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      title={alt}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid rgba(255,255,255,0.75)",
        display: "block",
        flexShrink: 0,
        background: "#e8e8e8"
      }}
    />
  );
}
