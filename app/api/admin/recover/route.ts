import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { method } = body;

  // ── 1. مفتاح الاسترجاع الثابت ──
  if (method === "key") {
    const { recoveryKey, newPassword } = body as { recoveryKey: string; newPassword: string };

    const envKey = process.env.ADMIN_RECOVERY_KEY ?? "";
    if (!envKey) {
      return NextResponse.json({ error: "مفتاح الاسترجاع غير مضبوط في الخادم" }, { status: 400 });
    }
    if (!recoveryKey || recoveryKey !== envKey) {
      return NextResponse.json({ error: "المفتاح غير صحيح" }, { status: 401 });
    }
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "كلمة السر قصيرة جداً (4 أحرف على الأقل)" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: "admin_password" },
      update: { value: newPassword },
      create: { key: "admin_password", value: newPassword },
    });

    return NextResponse.json({ ok: true });
  }

  // ── 2. إرسال كود تلغرام ──
  if (method === "telegram_send") {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["telegram_bot_token", "telegram_chat_id"] } },
    });
    const tgToken = settings.find((s) => s.key === "telegram_bot_token")?.value ?? "";
    const tgChatId = settings.find((s) => s.key === "telegram_chat_id")?.value ?? "";

    if (!tgToken || !tgChatId) {
      return NextResponse.json({ error: "تلغرام غير مضبوط — أضف التوكن والـ Chat ID من الإعدادات" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 دقائق

    await prisma.setting.upsert({
      where: { key: "recovery_otp" },
      update: { value: JSON.stringify({ code, expires }) },
      create: { key: "recovery_otp", value: JSON.stringify({ code, expires }) },
    });

    const message = [
      `🔐 <b>كود استرجاع كلمة السر</b>`,
      `───────────────`,
      `<code>${code}</code>`,
      ``,
      `⏱ صالح لمدة <b>10 دقائق</b> فقط`,
      `⚠️ لا تشاركه مع أحد`,
    ].join("\n");

    const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tgChatId, text: message, parse_mode: "HTML" }),
    });

    if (!tgRes.ok) {
      const err = await tgRes.json();
      return NextResponse.json({ error: "فشل إرسال الكود: " + (err.description ?? "") }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // ── 3. التحقق من كود تلغرام وتغيير كلمة السر ──
  if (method === "telegram_verify") {
    const { code, newPassword } = body as { code: string; newPassword: string };

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "كلمة السر قصيرة جداً (4 أحرف على الأقل)" }, { status: 400 });
    }

    const otpSetting = await prisma.setting.findUnique({ where: { key: "recovery_otp" } });
    if (!otpSetting) {
      return NextResponse.json({ error: "لم يُرسل كود بعد — اضغط إرسال أولاً" }, { status: 400 });
    }

    const { code: savedCode, expires } = JSON.parse(otpSetting.value) as { code: string; expires: number };

    if (Date.now() > expires) {
      await prisma.setting.delete({ where: { key: "recovery_otp" } });
      return NextResponse.json({ error: "انتهت صلاحية الكود — أرسل كوداً جديداً" }, { status: 400 });
    }

    if (code !== savedCode) {
      return NextResponse.json({ error: "الكود غير صحيح" }, { status: 401 });
    }

    await prisma.setting.upsert({
      where: { key: "admin_password" },
      update: { value: newPassword },
      create: { key: "admin_password", value: newPassword },
    });

    await prisma.setting.delete({ where: { key: "recovery_otp" } });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "طريقة غير معروفة" }, { status: 400 });
}
