import type { ReactNode } from "react";
import { BrandHeader } from "./BrandHeader";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function SetupFrame({ title, subtitle, children }: Props) {
  return (
    <section className="screen active setup-flow-screen">
      <BrandHeader />
      <div><h1>{title}</h1><p className="sub">{subtitle}</p></div>
      {children}
    </section>
  );
}
