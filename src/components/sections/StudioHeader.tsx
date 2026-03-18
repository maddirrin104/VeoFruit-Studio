import { Video } from "lucide-react";

export function StudioHeader() {
  return (
    <header className="mb-8 flex flex-col items-center text-center md:mb-10">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] border border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300 shadow-[0_0_60px_rgba(217,70,239,0.18)]">
        <Video className="size-8" />
      </div>

      <h1 className="bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
        VeoFruit Studio
      </h1>

      <p className="mt-3 text-base text-slate-300 md:text-xl">
        Create marketing videos automatically with AI
      </p>
    </header>
  );
}