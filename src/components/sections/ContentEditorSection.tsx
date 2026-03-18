import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  SelectField,
  TextArea,
  TextInput,
} from "@/components/ui/FormControls";

export function ContentEditorSection() {
  return (
    <Card className="p-6 md:p-7">
      <SectionHeading title="Nội dung" icon={<Sparkles className="size-5" />} />

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Story Topic
          </label>
          <TextInput placeholder="Enter your story topic..." />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Main Character Description
          </label>
          <TextInput placeholder="Describe your main character..." />
          <p className="text-xs text-slate-500">
            Character should remain consistent across scenes
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-slate-200">
              Script Input
            </label>

            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-white/20"
            >
              Auto-generate
            </button>
          </div>

          <TextArea
            rows={5}
            placeholder="Write your script here..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Video Genre
            </label>
            <SelectField
              defaultValue="Select genre..."
              options={[
                "Select genre...",
                "Fruit promotion",
                "Brand story",
                "Seasonal campaign",
                "Lifestyle commercial",
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Number of Scenes
            </label>
            <SelectField
              defaultValue="3 scenes"
              options={["3 scenes", "4 scenes", "5 scenes", "6 scenes"]}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}