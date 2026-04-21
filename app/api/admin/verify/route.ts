import { NextRequest, NextResponse } from "next/server";
import { getActivePassword } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const activePassword = await getActivePassword();

    if (password === activePassword) {
      return NextResponse.json({ ok: true });
    }
  } catch {
    // تجاهل الأخطاء
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
