import { AiOptimizationSection } from "@/components/sections/AiOptimizationSection";
import { ContentEditorSection } from "@/components/sections/ContentEditorSection";
import { PreviewPanel } from "@/components/sections/PreviewPanel";
import { StudioHeader } from "@/components/sections/StudioHeader";
import { VideoConfigSection } from "@/components/sections/VideoConfigSection";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <StudioHeader />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <ContentEditorSection />
            <VideoConfigSection />
            <AiOptimizationSection />
          </div>

          <PreviewPanel />
        </div>
      </div>
    </main>
  );
}