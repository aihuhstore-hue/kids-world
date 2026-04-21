import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActivePassword } from "@/lib/admin-auth";

// تغيير كلمة السر
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "كلمة السر الجديدة يجب أن تكون 4 أحرف على الأقل" },
        { status: 400 }
      );
    }

    // التحقق من كلمة السر الحالية
    const activePassword = await getActivePassword();

    if (currentPassword !== activePassword) {
      return NextResponse.json(
        { error: "كلمة السر الحالية غير صحيحة" },
        { status: 401 }
      );
    }

    // حفظ كلمة السر الجديدة في قاعدة البيانات
    await prisma.setting.upsert({
      where: { key: "admin_password" },
      update: { value: newPassword },
      create: { key: "admin_password", value: newPassword },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Password change error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تغيير كلمة السر، تأكد من تشغيل: npm run db:push" },
      { status: 500 }
    );
  }
}
