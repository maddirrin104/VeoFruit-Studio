import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OptionButton } from "@/components/ui/OptionButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  aspectRatioOptions,
  durationOptions,
  resolutionOptions,
} from "@/lib/studio-data";

export function VideoConfigSection() {
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
            {resolutionOptions.map((item) => (
              <OptionButton
                key={item.label}
                label={item.label}
                subLabel={item.subLabel}
                active={item.active}
              />
            ))}
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
              {aspectRatioOptions.map((item) => (
                <OptionButton
                  key={item.label}
                  label={item.label}
                  active={item.active}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-200">Duration</p>
            <div className="grid gap-3">
              {durationOptions.map((item) => (
                <OptionButton
                  key={item.label}
                  label={item.label}
                  active={item.active}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}