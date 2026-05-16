import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  style?: CSSProperties;
};

export function ActionButton({ children, style, ...props }: Props) {
  return (
    <button
      type="button"
      {...props}
      style={{
        padding: "8px 14px",
        background: "#fff",
        color: "#1a472a",
        border: "none",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        cursor: props.disabled ? "default" : "pointer",
        fontFamily: "Georgia, serif",
        opacity: props.disabled ? 0.45 : 1,
        ...style
      }}
    >
      {children}
    </button>
  );
}
