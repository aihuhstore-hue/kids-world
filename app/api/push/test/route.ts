import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import webPush from "web-push";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["vapid_public_key", "vapid_private_key", "push_subscriptions"] } },
  });

  const pubKey = settings.find((s) => s.key === "vapid_public_key")?.value;
  const privKey = settings.find((s) => s.key === "vapid_private_key")?.value;
  const subsJson = settings.find((s) => s.key === "push_subscriptions")?.value;

  if (!pubKey || !privKey) return NextResponse.json({ error: "VAPID keys missing" }, { status: 400 });
  if (!subsJson) return NextResponse.json({ error: "no_subscriptions" }, { status: 400 });

  const subs: PushSubscriptionJSON[] = JSON.parse(subsJson);
  if (subs.length === 0) return NextResponse.json({ error: "no_subscriptions" }, { status: 400 });

  webPush.setVapidDetails("mailto:admin@kidsworldj.dz", pubKey, privKey);

  const payload = JSON.stringify({
    title: "✅ اختبار الإشعارات",
    body: "نظام الإشعارات يعمل بشكل صحيح!",
    url: "/admin",
  });

  let sent = 0;
  const validSubs: PushSubscriptionJSON[] = [];
  for (const sub of subs) {
    try {
      await webPush.sendNotification(sub as webPush.PushSubscription, payload);
      validSubs.push(sub);
      sent++;
    } catch { /* expired */ }
  }

  if (validSubs.length !== subs.length) {
    await prisma.setting.update({
      where: { key: "push_subscriptions" },
      data: { value: JSON.stringify(validSubs) },
    });
  }

  return NextResponse.json({ ok: true, sent });
}
