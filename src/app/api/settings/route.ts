import { NextRequest, NextResponse } from "next/server";
import {
  getRuntimeSettings,
  getRuntimeSettingsFilePath,
  saveRuntimeSettings,
  type RuntimeSettingsInput,
} from "@/lib/runtime-settings";

function normalizeBody(payload: unknown): RuntimeSettingsInput {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const body = payload as { settings?: RuntimeSettingsInput } & RuntimeSettingsInput;
  return body.settings && typeof body.settings === "object" ? body.settings : body;
}

export async function GET() {
  try {
    const settings = await getRuntimeSettings();
    return NextResponse.json({
      data: {
        settings,
        storagePath: getRuntimeSettingsFilePath(),
      },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await request.json();
    const changes = normalizeBody(payload);
    const settings = await saveRuntimeSettings(changes);

    return NextResponse.json({
      data: {
        settings,
        storagePath: getRuntimeSettingsFilePath(),
      },
      message: "Settings saved successfully.",
    });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
