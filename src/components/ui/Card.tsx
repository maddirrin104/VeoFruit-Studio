import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-[#12182d]/85 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}