"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  SelectField,
  TextArea,
  TextInput,
} from "@/components/ui/FormControls";

const topicTypes = [
  "Giới thiệu",
  "Hướng dẫn",
  "So sánh",
  "Lợi ích sức khỏe",
  "Viral",
  "Review",
  "Giáo dục",
  "Kể chuyện",
  "Hài hước",
];

type ContentEditorSectionProps = {
  storyTopic: string;
  characterDescription: string;
  script: string;
  contentTone: string;
  videoGenre: string;
  numberOfScenes: number;
  isGeneratingScript: boolean;
  onStoryTopicChange: (value: string) => void;
  onCharacterDescriptionChange: (value: string) => void;
  onScriptChange: (value: string) => void;
  onContentToneChange: (value: string) => void;
  onVideoGenreChange: (value: string) => void;
  onNumberOfScenesChange: (value: number) => void;
  onGenerateScript: () => void;
};

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="relative block pl-2 text-[13px] font-semibold uppercase tracking-wide text-[#2f7056] before:absolute before:left-0 before:top-1 before:h-4 before:w-0.75 before:rounded-full before:bg-[#10b862]">
      {children}
    </label>
  );
}

export function ContentEditorSection({
  storyTopic,
  characterDescription,
  script,
  contentTone,
  videoGenre,
  numberOfScenes,
  isGeneratingScript,
  onStoryTopicChange,
  onCharacterDescriptionChange,
  onScriptChange,
  onContentToneChange,
  onVideoGenreChange,
  onNumberOfScenesChange,
  onGenerateScript,
}: ContentEditorSectionProps) {
  return (
    <Card className="p-6 md:p-7">
      <SectionHeading title="Nội dung" icon={<Sparkles className="size-5" />} />

      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel>Chủ đề trái cây</FieldLabel>
          <TextInput
            placeholder="VD: Quả dâu tây tươi ngon, mọng nước..."
            value={storyTopic}
            onChange={(event) => onStoryTopicChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Mô tả nhân vật chính</FieldLabel>
          <TextInput
            placeholder="VD: Chú gấu trúc đội mũ rơm đang cầm trái cây..."
            value={characterDescription}
            onChange={(event) => onCharacterDescriptionChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Kịch bản chi tiết</FieldLabel>

            <button
              type="button"
              onClick={onGenerateScript}
              disabled={isGeneratingScript}
              className="rounded-full bg-[#0eb35f] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(14,179,95,0.3)] transition hover:bg-[#0ba455]"
            >
              {isGeneratingScript ? "Đang tạo..." : "AI tạo kịch bản"}
            </button>
          </div>

          <TextArea
            rows={5}
            placeholder="Mô tả từng cảnh quay về trái cây..."
            value={script}
            onChange={(event) => onScriptChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Tông nội dung</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {topicTypes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onContentToneChange(item)}
                className="rounded-full border border-[#c9e5d5] bg-[#f0f7f3] px-4 py-2 text-sm text-[#3f6f5a] transition hover:border-[#9fdab9]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Thể loại</FieldLabel>
            <SelectField
              value={videoGenre}
              onChange={onVideoGenreChange}
              options={[
                "Giới thiệu trái cây",
                "Kể chuyện thương hiệu",
                "Quảng cáo theo mùa",
                "Review sản phẩm",
              ]}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Số cảnh</FieldLabel>
            <SelectField
              value={`${numberOfScenes} cảnh`}
              onChange={(value) => onNumberOfScenesChange(Number(value.split(" ")[0]))}
              options={["3 cảnh", "4 cảnh", "5 cảnh", "6 cảnh"]}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}