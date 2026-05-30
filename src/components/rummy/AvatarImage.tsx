"use client";

import { useState } from "react";

type Props = {
  src: string;
  name: string;
  className?: string;
};

export function AvatarImage({ src, name, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={`${className} avatar-fallback`}>{name.slice(0, 1)}</span>;
  return <img className={className} src={src} alt={name} onError={() => setFailed(true)} />;
}
