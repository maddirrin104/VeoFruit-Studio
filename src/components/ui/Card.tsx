import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`reveal-up rounded-2xl border border-[#b5e5c9] bg-[#ecf6f0]/95 shadow-[0_14px_34px_rgba(54,129,95,0.1)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(50,124,90,0.14)] ${className}`}
    >
      {children}
    </div>
  );
}