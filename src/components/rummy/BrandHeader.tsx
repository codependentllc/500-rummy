"use client";

import { useState } from "react";
import { InfoModal } from "./InfoModal";

type Props = {
  compact?: boolean;
};

export function BrandHeader({ compact = false }: Props) {
  const [modal, setModal] = useState<"trailer" | "instructions" | null>(null);

  return (
    <>
      <div className={`brand-header ${compact ? "compact" : ""}`}>
        <img className="brand-logo" src="/art/500-rummy-logo-raccoon-new.png" alt="500 Rummy" />
        <nav className="brand-menu" aria-label="Game menu">
          <button type="button" onClick={() => setModal("trailer")}>Trailer</button>
          <button type="button" onClick={() => setModal("instructions")}>Instructions</button>
        </nav>
      </div>
      <InfoModal type={modal} onClose={() => setModal(null)} />
    </>
  );
}
