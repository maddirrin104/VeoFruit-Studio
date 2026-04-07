"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Sparkles, X } from "lucide-react";
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

const CHARACTER_DESCRIPTION_MAX_LENGTH = 220;

const characterTypeOptions = [
  "Nữ tư vấn viên cửa hàng trái cây",
  "Nam tư vấn viên cửa hàng trái cây",
  "Chủ nông trại trái cây",
  "Chủ shop trái cây thân thiện",
  "Nhân viên siêu thị quầy trái cây",
  "Đầu bếp chia sẻ công thức trái cây",
  "Food reviewer trải nghiệm trái cây",
  "Mẹ bỉm chia sẻ bữa phụ cho bé",
  "MC giới thiệu sản phẩm tại quầy",
  "Nhân vật 3D hoạt hình",
  "Sinh viên làm vlog ẩm thực",
] as const;

const sceneLocationOptions = [
  "Cửa hàng trái cây",
  "Quầy trái cây trong trung tâm thương mại",
  "Sạp trái cây ngoài chợ",
  "Nông trại trái cây",
  "Bếp gia đình",
] as const;

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
  const [isScriptReaderOpen, setIsScriptReaderOpen] = useState(false);
  const [characterEntryMode, setCharacterEntryMode] = useState<"preset" | "custom">(
    characterTypeOptions.includes(characterType as (typeof characterTypeOptions)[number])
      ? "preset"
      : "custom"
  );
  const [sceneEntryMode, setSceneEntryMode] = useState<"preset" | "custom">(
    sceneLocationOptions.includes(sceneLocation as (typeof sceneLocationOptions)[number])
      ? "preset"
      : "custom"
  );
  const characterTypePresetValue = characterTypeOptions.includes(
    characterType as (typeof characterTypeOptions)[number]
  )
    ? characterType
    : characterTypeOptions[0];

  const sceneLocationPresetValue = sceneLocationOptions.includes(
    sceneLocation as (typeof sceneLocationOptions)[number]
  )
    ? sceneLocation
    : sceneLocationOptions[0];

  const scriptMeta = useMemo(() => {
    const lines = script
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean).length;
    const words = script
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean).length;

    return { lines, words };
  }, [script]);

  return (
    <>
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
            <div className="space-y-3 rounded-2xl border border-[#d0eadc] bg-[#f3faf6] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel>Nhân vật</FieldLabel>
                <div className="inline-flex rounded-full border border-[#c5e5d3] bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCharacterEntryMode("preset")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      characterEntryMode === "preset"
                        ? "bg-[#10b862] text-white shadow-[0_6px_14px_rgba(16,184,98,0.22)]"
                        : "text-[#2f7056] hover:bg-[#eff8f2]"
                    }`}
                  >
                    Mẫu có sẵn
                  </button>
                  <button
                    type="button"
                    onClick={() => setCharacterEntryMode("custom")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      characterEntryMode === "custom"
                        ? "bg-[#10b862] text-white shadow-[0_6px_14px_rgba(16,184,98,0.22)]"
                        : "text-[#2f7056] hover:bg-[#eff8f2]"
                    }`}
                  >
                    Tự nhập
                  </button>
                </div>
              </div>

              {characterEntryMode === "preset" ? (
                <SelectField
                  value={characterTypePresetValue}
                  onChange={onCharacterTypeChange}
                  options={[...characterTypeOptions]}
                />
              ) : (
                <TextInput
                  placeholder="VD: Chủ quầy trái cây thân thiện, nói gần gũi..."
                  value={characterType}
                  onChange={(event) => onCharacterTypeChange(event.target.value)}
                />
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-[#d0eadc] bg-[#f3faf6] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel>Bối cảnh</FieldLabel>
                <div className="inline-flex rounded-full border border-[#c5e5d3] bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setSceneEntryMode("preset")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      sceneEntryMode === "preset"
                        ? "bg-[#10b862] text-white shadow-[0_6px_14px_rgba(16,184,98,0.22)]"
                        : "text-[#2f7056] hover:bg-[#eff8f2]"
                    }`}
                  >
                    Mẫu có sẵn
                  </button>
                  <button
                    type="button"
                    onClick={() => setSceneEntryMode("custom")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      sceneEntryMode === "custom"
                        ? "bg-[#10b862] text-white shadow-[0_6px_14px_rgba(16,184,98,0.22)]"
                        : "text-[#2f7056] hover:bg-[#eff8f2]"
                    }`}
                  >
                    Tự nhập
                  </button>
                </div>
              </div>

              {sceneEntryMode === "preset" ? (
                <SelectField
                  value={sceneLocationPresetValue}
                  onChange={onSceneLocationChange}
                  options={[...sceneLocationOptions]}
                />
              ) : (
                <TextInput
                  placeholder="VD: Cửa hàng hoa quả sạch Minh Lâm..."
                  value={sceneLocation}
                  onChange={(event) => onSceneLocationChange(event.target.value)}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Mô tả nhân vật chính</FieldLabel>
            <TextArea
              rows={3}
              maxLength={CHARACTER_DESCRIPTION_MAX_LENGTH}
              className="min-h-[96px] resize-y"
              placeholder="VD: Tư vấn viên chuyên nghiệp, nói rõ ràng, thân thiện và gần gũi..."
              value={characterDescription}
              onChange={(event) =>
                onCharacterDescriptionChange(
                  event.target.value.slice(0, CHARACTER_DESCRIPTION_MAX_LENGTH)
                )
              }
            />
            <p className="text-right text-xs text-[#5f8f79]">
              {characterDescription.length}/{CHARACTER_DESCRIPTION_MAX_LENGTH} ký tự
            </p>
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
                  onClick={() => setIsScriptReaderOpen(true)}
                  disabled={!script.trim()}
                  className="inline-flex items-center gap-1 rounded-full border border-[#9fdab9] bg-[#f1fbf5] px-4 py-2 text-xs font-semibold text-[#1d734e] transition enabled:hover:border-[#7fcea5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <BookOpenText className="size-3.5" />
                  Chế độ đọc
                </button>

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

            <div className="flex items-center justify-between gap-2 text-xs text-[#5f8f79]">
              <span>{scriptMeta.lines} dòng</span>
              <span>{scriptMeta.words} từ</span>
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

      {isScriptReaderOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#113528]/45 backdrop-blur-[2px]"
            aria-label="Đóng chế độ đọc"
            onClick={() => setIsScriptReaderOpen(false)}
          />

          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#a8dfbf] bg-[#ecf6f0] shadow-[0_26px_50px_rgba(18,72,49,0.28)]">
            <div className="flex items-center justify-between border-b border-[#bfe7ce] bg-[#e1f4e9] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#156345]">Đọc kịch bản</p>
                <p className="text-xs text-[#5f8f79]">
                  {scriptMeta.lines} dòng • {scriptMeta.words} từ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsScriptReaderOpen(false)}
                className="inline-flex items-center rounded-lg border border-[#9edfb9] bg-white/85 p-2 text-[#25664a] transition hover:border-[#74cca1]"
                aria-label="Đóng"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <div className="space-y-3 rounded-xl border border-[#b8e2c8] bg-[#f5fbf7] p-4">
                <div className="flex items-center justify-between text-xs text-[#5f8f79]">
                  <p>Bạn có thể chỉnh sửa trực tiếp kịch bản tại đây.</p>
                  <p>{script.length} ký tự</p>
                </div>

                <TextArea
                  rows={14}
                  autoFocus
                  className="min-h-[320px] resize-y border-[#a8dfbf] bg-white/95 font-[family:var(--font-manrope)] text-[14px] leading-7 text-[#1f513d]"
                  placeholder="Nhập hoặc chỉnh sửa kịch bản..."
                  value={script}
                  onChange={(event) => onScriptChange(event.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsScriptReaderOpen(false)}
                    className="rounded-full border border-[#8ed0ad] bg-white px-4 py-2 text-xs font-semibold text-[#1b6e48] transition hover:border-[#67c193]"
                  >
                    Xong
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}