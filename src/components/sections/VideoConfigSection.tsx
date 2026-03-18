"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OptionButton } from "@/components/ui/OptionButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function VideoConfigSection() {
  const [resolution, setResolution] = useState("1080p");
  const [aspectRatio, setAspectRatio] = useState("9:16 (TikTok/Reels)");
  const [duration, setDuration] = useState("30s");

  return (
    <Card className="p-6 md:p-7">
      <SectionHeading
        title="Cấu hình video"
        icon={<Settings2 className="size-5" />}
      />

      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-200">Resolution</p>
          <div className="grid gap-3 md:grid-cols-2">
            <OptionButton
              label="720p"
              subLabel="Fast render"
              active={resolution === "720p"}
              onClick={() => setResolution("720p")}
            />
            <OptionButton
              label="1080p"
              subLabel="High quality"
              active={resolution === "1080p"}
              onClick={() => setResolution("1080p")}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-200">AI Model</p>
          <div className="flex h-14 items-center rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/15 px-4 text-sm font-medium text-white">
            Veo 3.1 Fast
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-200">Aspect Ratio</p>
            <div className="grid gap-3">
              <OptionButton
                label="9:16 (TikTok/Reels)"
                active={aspectRatio === "9:16 (TikTok/Reels)"}
                onClick={() => setAspectRatio("9:16 (TikTok/Reels)")}
              />
              <OptionButton
                label="16:9 (YouTube)"
                active={aspectRatio === "16:9 (YouTube)"}
                onClick={() => setAspectRatio("16:9 (YouTube)")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-200">Duration</p>
            <div className="grid gap-3">
              <OptionButton
                label="15s"
                active={duration === "15s"}
                onClick={() => setDuration("15s")}
              />
              <OptionButton
                label="30s"
                active={duration === "30s"}
                onClick={() => setDuration("30s")}
              />
              <OptionButton
                label="60s"
                active={duration === "60s"}
                onClick={() => setDuration("60s")}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}