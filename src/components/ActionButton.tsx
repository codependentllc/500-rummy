import type { CSSProperties, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import "./ActionBar/ActionBar.css";

type Props = HTMLMotionProps<"button"> & {
  children: ReactNode;
  style?: CSSProperties;
};

export function ActionButton({ children, style, ...props }: Props) {
  const className = props.className ? `action-button ${props.className}` : "action-button";

  return (
    <motion.button
      type="button"
      {...props}
      className={className}
      whileHover={props.disabled ? undefined : { y: -1, scale: 1.025 }}
      whileTap={props.disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 520, damping: 32 }}
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
    </motion.button>
  );
}
