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
    <div className={`mb-5 flex items-center gap-2 ${className}`}>
      {icon && (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#d4f4df] text-[#0eaf5f]">
          {icon}
        </span>
      )}
      <h2 className="font-[family:var(--font-sora)] text-[24px] font-semibold tracking-tight text-[#0d9d56] md:text-[26px]">
        {title}
      </h2>
      <span className="ml-1 h-px flex-1 bg-gradient-to-r from-[#a5ddb9] to-transparent" />
    </div>
  );
}