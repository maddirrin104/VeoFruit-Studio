import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TestRequest {
  provider: "gemini" | "fpt" | "runway" | "kling";
  googleApiKey?: string;
  fptApiKey?: string;
  fptTtsUrl?: string;
  runwayApiSecret?: string;
  runwayApiBaseUrl?: string;
  runwayApiVersion?: string;
  klingAccessKeyId?: string;
  klingAccessKeySecret?: string;
}

type TestResult = { ok: boolean; message: string };

const TIMEOUT_MS = 10_000;

async function testGemini(apiKey: string): Promise<TestResult> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${encodeURIComponent(apiKey)}`,
      { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (res.ok) {
      return { ok: true, message: "Google Gemini API key hợp lệ và hoạt động tốt." };
    }
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    const errMsg = body?.error?.message || `HTTP ${res.status}`;
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      return { ok: false, message: `API key không hợp lệ: ${errMsg}` };
    }
    return { ok: false, message: `Gemini lỗi ${res.status}: ${errMsg}` };
  } catch (err) {
    const msg = (err as Error).message || String(err);
    if (msg.includes("timeout") || msg.includes("abort") || msg.includes("AbortError")) {
      return { ok: false, message: "Hết thời gian kết nối Gemini (10s). Kiểm tra mạng." };
    }
    return { ok: false, message: `Không kết nối được Gemini: ${msg}` };
  }
}

async function testFpt(apiKey: string, ttsUrl: string): Promise<TestResult> {
  try {
    const res = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        speed: "0",
        voice: "banmai",
        "content-type": "text/plain; charset=utf-8",
      },
      body: "xin chào",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: `FPT API key không hợp lệ hoặc hết hạn (${res.status}).` };
    }
    if (res.status >= 500) {
      return { ok: false, message: `FPT server đang lỗi (${res.status}). Thử lại sau.` };
    }
    return { ok: true, message: "FPT AI API key hợp lệ và hoạt động tốt." };
  } catch (err) {
    const msg = (err as Error).message || String(err);
    if (msg.includes("timeout") || msg.includes("abort") || msg.includes("AbortError")) {
      return { ok: false, message: "Hết thời gian kết nối FPT (10s). Kiểm tra mạng." };
    }
    return { ok: false, message: `Không kết nối được FPT: ${msg}` };
  }
}

async function testRunway(apiSecret: string, baseUrl: string, version: string): Promise<TestResult> {
  try {
    const url = `${baseUrl.replace(/\/$/, "")}/v1/tasks`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiSecret}`,
        "Content-Type": "application/json",
        "X-Runway-Version": version,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) {
      return { ok: true, message: "RunwayML API key hợp lệ và hoạt động tốt." };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: `Runway API key không hợp lệ (${res.status}).` };
    }
    if (res.status === 404) {
      return { ok: true, message: "RunwayML API key hợp lệ (xác thực thành công)." };
    }
    return { ok: false, message: `Runway trả về lỗi ${res.status}.` };
  } catch (err) {
    const msg = (err as Error).message || String(err);
    if (msg.includes("timeout") || msg.includes("abort") || msg.includes("AbortError")) {
      return { ok: false, message: "Hết thời gian kết nối Runway (10s). Kiểm tra mạng." };
    }
    return { ok: false, message: `Không kết nối được Runway: ${msg}` };
  }
}

function generateKlingJWT(accessKeyId: string, secretKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iss: accessKeyId, exp: now + 1800, nbf: now - 5 })
  ).toString("base64url");
  const data = `${header}.${payload}`;
  const sig = crypto.createHmac("sha256", secretKey).update(data).digest("base64url");
  return `${data}.${sig}`;
}

async function testKling(accessKeyId: string, secretKey: string): Promise<TestResult> {
  try {
    const token = generateKlingJWT(accessKeyId, secretKey);
    const res = await fetch(
      "https://api-singapore.klingai.com/v1/videos/text2video?pageNum=1&pageSize=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    if (res.ok) {
      return { ok: true, message: "Kling AI credentials hợp lệ và hoạt động tốt." };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: `Kling credentials không hợp lệ (${res.status}).` };
    }
    return { ok: false, message: `Kling trả về lỗi ${res.status}.` };
  } catch (err) {
    const msg = (err as Error).message || String(err);
    if (msg.includes("timeout") || msg.includes("abort") || msg.includes("AbortError")) {
      return { ok: false, message: "Hết thời gian kết nối Kling (10s). Kiểm tra mạng." };
    }
    return { ok: false, message: `Không kết nối được Kling: ${msg}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TestRequest;
    let result: TestResult;

    switch (body.provider) {
      case "gemini":
        result = !body.googleApiKey?.trim()
          ? { ok: false, message: "Chưa nhập Google API Key." }
          : await testGemini(body.googleApiKey.trim());
        break;

      case "fpt":
        result = !body.fptApiKey?.trim()
          ? { ok: false, message: "Chưa nhập FPT API Key." }
          : await testFpt(
              body.fptApiKey.trim(),
              body.fptTtsUrl?.trim() || "https://api.fpt.ai/hmi/tts/v5"
            );
        break;

      case "runway":
        result = !body.runwayApiSecret?.trim()
          ? { ok: false, message: "Chưa nhập Runway API Secret." }
          : await testRunway(
              body.runwayApiSecret.trim(),
              body.runwayApiBaseUrl?.trim() || "https://api.dev.runwayml.com",
              body.runwayApiVersion?.trim() || "2024-11-06"
            );
        break;

      case "kling":
        result =
          !body.klingAccessKeyId?.trim() || !body.klingAccessKeySecret?.trim()
            ? { ok: false, message: "Chưa nhập đủ Kling Access Key ID và Secret Key." }
            : await testKling(body.klingAccessKeyId.trim(), body.klingAccessKeySecret.trim());
        break;

      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("POST /api/settings/test error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
