"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OptionButton } from "@/components/ui/OptionButton";
import { SelectField } from "@/components/ui/FormControls";
import { SectionHeading } from "@/components/ui/SectionHeading";

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="relative pl-2 text-[13px] font-semibold uppercase tracking-wide text-[#2f7056] before:absolute before:left-0 before:top-1 before:h-4 before:w-0.75 before:rounded-full before:bg-[#10b862]">
      {children}
    </p>
  );
}

export function VideoConfigSection() {
  const [resolution, setResolution] = useState("720p");

  return (
    <Card className="p-6 md:p-7">
      <SectionHeading
        title="Cấu hình video"
        icon={<Settings2 className="size-5" />}
      />

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <FieldLabel>Độ phân giải</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton
                label="720p"
                active={resolution === "720p"}
                onClick={() => setResolution("720p")}
              />
              <OptionButton
                label="1080p"
                active={resolution === "1080p"}
                onClick={() => setResolution("1080p")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>AI Model</FieldLabel>
            <div className="rounded-xl border border-[#a8dfbf] bg-[#eaf8f0] px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#12995a]">
                <span className="h-2 w-2 rounded-full bg-[#10b862]" />
                Veo 3.1 Fast
              </p>
              <p className="mt-1 text-xs text-[#6d9984]">
                Google DeepMind - Ultra-quality food video
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <FieldLabel>Tỷ lệ khung hình</FieldLabel>
            <SelectField
              defaultValue="9:16"
              options={[
                "9:16",
                "1:1",
                "16:9",
                "4:5",
              ]}
            />
          </div>

          <div className="space-y-3">
            <FieldLabel>Thời lượng</FieldLabel>
            <SelectField
              defaultValue="15 giây"
              options={["10 giây", "15 giây", "30 giây", "60 giây"]}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}