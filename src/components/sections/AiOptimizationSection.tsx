"use client";

import { useState } from "react";
import {
  Mic,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OptionButton } from "@/components/ui/OptionButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { RangeField, SelectField } from "@/components/ui/FormControls";

function InnerPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-fuchsia-200">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

export function AiOptimizationSection() {
  const [characterConsistency, setCharacterConsistency] = useState(true);
  const [autoEnhanceScript, setAutoEnhanceScript] = useState(false);
  const [voiceGender, setVoiceGender] = useState("Female");
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("Dreamy");
  const [transitionEffects, setTransitionEffects] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(true);

  const toneOptions = ["Emotional", "Sales", "Viral", "Educational"];
  const styleOptions = [
    "Cinematic",
    "Anime",
    "Digital Art",
    "Realistic",
    "Fantasy",
    "Dreamy",
  ];

  return (
    <Card className="p-6 md:p-7">
      <SectionHeading
        title="Tối ưu video AI"
        icon={<Wand2 className="size-5" />}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <InnerPanel
          title="Subject Settings"
          icon={<Sparkles className="size-4" />}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-300">
                Character consistency
              </span>
              <ToggleSwitch
                checked={characterConsistency}
                onClick={() => setCharacterConsistency((prev) => !prev)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-300">Motion intensity</p>
              <RangeField defaultValue={48} minLabel="Subtle" maxLabel="Dynamic" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-300">Emotion style</p>
              <SelectField
                defaultValue="Happy"
                options={["Happy", "Energetic", "Calm", "Luxury"]}
              />
            </div>
          </div>
        </InnerPanel>

        <InnerPanel
          title="Script Optimization"
          icon={<Wand2 className="size-4" />}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-300">Auto-enhance script</span>
              <ToggleSwitch
                checked={autoEnhanceScript}
                onClick={() => setAutoEnhanceScript((prev) => !prev)}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-300">Tone selector</p>
              <div className="grid grid-cols-2 gap-3">
                {toneOptions.map((item) => (
                  <OptionButton
                    key={item}
                    label={item}
                    active={selectedTone === item}
                    compact
                    onClick={() => setSelectedTone(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </InnerPanel>

        <InnerPanel title="Voice Settings" icon={<Mic className="size-4" />}>
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm text-slate-300">Voice gender</p>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "AI Neutral"].map((item) => (
                  <OptionButton
                    key={item}
                    label={item}
                    active={voiceGender === item}
                    compact
                    onClick={() => setVoiceGender(item)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-300">Language</p>
              <SelectField
                defaultValue="English"
                options={["English", "Vietnamese", "Japanese", "Korean"]}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-300">Speed</p>
              <RangeField defaultValue={50} minLabel="Slow" maxLabel="Fast" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-300">Emotion</p>
              <SelectField
                defaultValue="Energetic"
                options={["Energetic", "Warm", "Soft", "Luxury"]}
              />
            </div>
          </div>
        </InnerPanel>

        <InnerPanel
          title="Effects & Visuals"
          icon={<Palette className="size-4" />}
        >
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm text-slate-300">Style selection</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {styleOptions.map((item) => (
                  <OptionButton
                    key={item}
                    label={item}
                    active={selectedStyle === item}
                    compact
                    onClick={() => setSelectedStyle(item)}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-300">Transition effects</span>
              <ToggleSwitch
                checked={transitionEffects}
                onClick={() => setTransitionEffects((prev) => !prev)}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-300">Background music</span>
              <ToggleSwitch
                checked={backgroundMusic}
                onClick={() => setBackgroundMusic((prev) => !prev)}
              />
            </div>
          </div>
        </InnerPanel>
      </div>
    </Card>
  );
}