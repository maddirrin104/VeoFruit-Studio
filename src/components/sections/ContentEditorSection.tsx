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
            Chủ đề
          </label>
          <TextInput placeholder="Nhập chủ đề câu chuyện của bạn..." />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Mô tả nhân vật chính
          </label>
          <TextInput placeholder="Nhập mô tả nhân vật chính của bạn..." />
          <p className="text-xs text-slate-500">
            Nhân vật nên giữ được sự nhất quán trong các cảnh
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-slate-200">
              Kịch bản
            </label>

            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-white/20"
            >
              Tự động tạo
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
              Thể loại video
            </label>
            <SelectField
              defaultValue="Chọn thể loại..."
              options={[
                "Chọn thể loại...",
                "Quảng cáo trái cây",
                "Câu chuyện thương hiệu",
                "Chiến dịch theo mùa",
                "Quảng cáo phong cách sống",
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Số lượng cảnh
            </label>
            <SelectField
              defaultValue="3 cảnh"
              options={["3 cảnh", "4 cảnh", "5 cảnh", "6 cảnh"]}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}