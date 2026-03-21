import { AiOptimizationSection } from "@/components/sections/AiOptimizationSection";
import { ContentEditorSection } from "@/components/sections/ContentEditorSection";
import { PreviewPanel } from "@/components/sections/PreviewPanel";
import { StudioHeader } from "@/components/sections/StudioHeader";
import { VideoConfigSection } from "@/components/sections/VideoConfigSection";
import { DraftSection } from "@/components/sections/DraftSection";

export default function HomePage() {
  return (
    <main className="studio-bg relative isolate min-h-screen overflow-x-clip px-3 py-7 md:px-5 lg:px-6">
      <div className="pointer-events-none absolute left-[18%] top-8 h-28 w-28 rounded-full bg-[#c9ecd8]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[28%] h-36 w-36 rounded-full bg-[#bde9d0]/60 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="reveal-up [animation-delay:80ms]">
          <StudioHeader />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="reveal-up [animation-delay:140ms]">
              <ContentEditorSection />
            </div>
            <div className="reveal-up [animation-delay:190ms]">
              <VideoConfigSection />
            </div>
            <div className="reveal-up [animation-delay:240ms]">
              <AiOptimizationSection />
            </div>
              <div className="reveal-up [animation-delay:280ms]">
                <DraftSection />
              </div>
          </div>

          <div className="reveal-up [animation-delay:170ms]">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </main>
  );
}