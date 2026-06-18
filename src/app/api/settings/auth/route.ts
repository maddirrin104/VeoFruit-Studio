import { NextRequest, NextResponse } from "next/server";
import {
  readStoredAuth,
  writeStoredAuth,
  hashNewPassword,
  checkPasswordAgainstHash,
  isSessionValid,
  persistSession,
  revokeSession,
} from "@/lib/settings-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await readStoredAuth();

    if (!auth) {
      return NextResponse.json({ data: { hasPassword: false, sessionValid: false } });
    }

    const sessionValid = await isSessionValid(auth.passwordHash);
    return NextResponse.json({ data: { hasPassword: true, sessionValid } });
  } catch (error) {
    console.error("[auth] GET error:", error);
    return NextResponse.json({ error: "Không thể kiểm tra xác thực" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { action?: string; password?: string };
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!password) {
      return NextResponse.json({ error: "Mật khẩu không được để trống" }, { status: 400 });
    }

    if (body.action === "setup") {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Mật khẩu phải có ít nhất 6 ký tự" },
          { status: 400 }
        );
      }

      const { hash, salt } = hashNewPassword(password);
      await writeStoredAuth({ passwordHash: hash, passwordSalt: salt });
      await persistSession(hash);
      return NextResponse.json({ data: { ok: true } });
    }

    if (body.action === "verify") {
      const auth = await readStoredAuth();

      if (!auth) {
        return NextResponse.json(
          { error: "Chưa thiết lập mật khẩu" },
          { status: 400 }
        );
      }

      const ok = checkPasswordAgainstHash(password, auth);
      if (!ok) {
        return NextResponse.json({
          data: { ok: false, message: "Mật khẩu không đúng. Vui lòng thử lại." },
        });
      }

      await persistSession(auth.passwordHash);
      return NextResponse.json({ data: { ok: true, message: "Xác thực thành công" } });
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("[auth] POST error:", error);
    return NextResponse.json({ error: "Lỗi xử lý xác thực" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await revokeSession();
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error("[auth] DELETE error:", error);
    return NextResponse.json({ error: "Lỗi xóa session" }, { status: 500 });
  }
}
