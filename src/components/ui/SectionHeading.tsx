import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  icon?: ReactNode;
  className?: string;
};

export function SectionHeading({
  title,
  icon,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mb-6 flex items-center gap-2 ${className}`}>
      <h2 className="text-[22px] font-semibold tracking-tight text-white md:text-[24px]">
        {title}
      </h2>
      {icon && <span className="text-fuchsia-400">{icon}</span>}
    </div>
  );
}