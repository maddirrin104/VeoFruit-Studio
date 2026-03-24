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
  "Bán hàng nhẹ nhàng",
  "Livestream",
  "Khuyến mãi",
  "Chia sẻ mẹo chọn trái cây",
  "Phong cách đời thường",
  "Cảm hứng tích cực",
];

type ContentEditorSectionProps = {
  storyTopic: string;
  characterDescription: string;
  characterType: string;
  sceneLocation: string;
  script: string;
  contentTone: string;
  videoGenre: string;
  numberOfScenes: number;
  isGeneratingScript: boolean;
  onStoryTopicChange: (value: string) => void;
  onCharacterDescriptionChange: (value: string) => void;
  onCharacterTypeChange: (value: string) => void;
  onSceneLocationChange: (value: string) => void;
  onScriptChange: (value: string) => void;
  onContentToneChange: (value: string) => void;
  onVideoGenreChange: (value: string) => void;
  onNumberOfScenesChange: (value: number) => void;
  onGenerateScript: () => void;
  onRandomizeScript: () => void;
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
  characterType,
  sceneLocation,
  script,
  contentTone,
  videoGenre,
  numberOfScenes,
  isGeneratingScript,
  onStoryTopicChange,
  onCharacterDescriptionChange,
  onCharacterTypeChange,
  onSceneLocationChange,
  onScriptChange,
  onContentToneChange,
  onVideoGenreChange,
  onNumberOfScenesChange,
  onGenerateScript,
  onRandomizeScript,
}: ContentEditorSectionProps) {
  return (
    <Card className="p-6 md:p-7">
      <SectionHeading title="Nội dung" icon={<Sparkles className="size-5" />} />

      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel>Chọn trái cây</FieldLabel>
          <TextInput
            placeholder="VD: Quả dâu tây tươi ngon, mọng nước..."
            value={storyTopic}
            onChange={(event) => onStoryTopicChange(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Nhân vật</FieldLabel>
            <SelectField
              value={characterType}
              onChange={onCharacterTypeChange}
              options={[
                "Nữ bán trái cây xinh tươi",
                "Nam bán trái cây dễ thương",
                "Nhân vật 3D hoạt hình",
                "Bé giới thiệu trái cây",
              ]}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Bối cảnh</FieldLabel>
            <SelectField
              value={sceneLocation}
              onChange={onSceneLocationChange}
              options={[
                "Cửa hàng trái cây",
                "Quầy trái cây trong trung tâm thương mại",
                "Sạp trái cây ngoài chợ",
                "Nông trại trái cây",
                "Bếp gia đình",
              ]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Mô tả nhân vật chính</FieldLabel>
          <TextInput
            placeholder="VD: Chị bán trái cây xinh tươi, giọng nói ngọt ngào..."
            value={characterDescription}
            onChange={(event) => onCharacterDescriptionChange(event.target.value)}
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
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  contentTone === item
                    ? "border-[#75c89f] bg-[#dff6ea] text-[#16633f]"
                    : "border-[#c9e5d5] bg-[#f0f7f3] text-[#3f6f5a] hover:border-[#9fdab9]"
                }`}
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
                "Giới thiệu trong cửa hàng",
                "Kể chuyện thương hiệu",
                "Quảng cáo theo mùa",
                "Review sản phẩm",
                "So sánh và tư vấn chọn mua",
                "Talkshow bán hàng",
                "Minigame tương tác",
                "Livestream demo",
                "Nấu ăn cùng trái cây",
                "Bí quyết bảo quản trái cây",
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

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FieldLabel>Kịch bản chi tiết</FieldLabel>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRandomizeScript}
                disabled={isGeneratingScript}
                className="rounded-full border border-[#9fdab9] bg-[#f1fbf5] px-4 py-2 text-xs font-semibold text-[#1d734e] transition hover:border-[#7fcea5]"
              >
                Random kịch bản
              </button>

              <button
                type="button"
                onClick={onGenerateScript}
                disabled={isGeneratingScript}
                className="rounded-full bg-[#0eb35f] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(14,179,95,0.3)] transition hover:bg-[#0ba455]"
              >
                {isGeneratingScript ? "Đang tạo..." : "AI tạo kịch bản"}
              </button>
            </div>
          </div>

          <TextArea
            rows={6}
            placeholder="Mô tả từng cảnh quay về trái cây..."
            value={script}
            onChange={(event) => onScriptChange(event.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}