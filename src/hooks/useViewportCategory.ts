import { useEffect, useState } from "react";

export type ViewportCategory = "mobile" | "tablet" | "desktop";

function getViewportCategory(width = window.innerWidth): ViewportCategory {
  if (width < 768) return "mobile";
  if (width < 1200) return "tablet";
  return "desktop";
}

export function useViewportCategory(): ViewportCategory {
  const [category, setCategory] = useState<ViewportCategory>(() => getViewportCategory());

  useEffect(() => {
    function handleResize() {
      setCategory(getViewportCategory());
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return category;
}
