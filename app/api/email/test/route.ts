import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["resend_api_key", "notification_email"] } },
  });

  const resendKey = settings.find((s) => s.key === "resend_api_key")?.value?.trim();
  const notifEmail = settings.find((s) => s.key === "notification_email")?.value?.trim();

  if (!resendKey) return NextResponse.json({ error: "no_api_key" }, { status: 400 });
  if (!notifEmail) return NextResponse.json({ error: "no_email" }, { status: 400 });

  try {
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({
      from: "Kids World J <onboarding@resend.dev>",
      to: notifEmail,
      subject: "✅ اختبار إشعارات البريد الإلكتروني",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:20px;">
        <h2>✅ نظام الإيميل يعمل بشكل صحيح!</h2>
        <p>ستصلك رسالة مثل هذه عند كل طلبية جديدة.</p>
      </div>`,
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
