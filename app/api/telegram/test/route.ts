import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["telegram_bot_token", "telegram_chat_id"] } },
  });

  const token = settings.find((s) => s.key === "telegram_bot_token")?.value?.trim();
  const chatId = settings.find((s) => s.key === "telegram_chat_id")?.value?.trim();

  if (!token || !chatId) {
    return NextResponse.json({ error: "no_config" }, { status: 400 });
  }

  const text = [
    `✅ *إشعار تجريبي — Kids World J*`,
    ``,
    `🛒 طلبية جديدة #TEST001`,
    `👤 محمد أحمد`,
    `📱 0551234567`,
    `📍 الجزائر العاصمة`,
    `🏠 منزل`,
    ``,
    `💰 *2500 دج*`,
    ``,
    `_نظام الإشعارات يعمل بشكل صحيح_ ✅`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    const data = await res.json();
    if (data.ok) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: data.description ?? "telegram_error" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
