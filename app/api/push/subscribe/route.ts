import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const subscription = await req.json();

  const setting = await prisma.setting.findUnique({
    where: { key: "push_subscriptions" },
  });
  const subs: PushSubscriptionJSON[] = setting ? JSON.parse(setting.value) : [];

  const exists = subs.some((s) => s.endpoint === subscription.endpoint);
  if (!exists) {
    subs.push(subscription);
    await prisma.setting.upsert({
      where: { key: "push_subscriptions" },
      update: { value: JSON.stringify(subs) },
      create: { key: "push_subscriptions", value: JSON.stringify(subs) },
    });
  }

  return NextResponse.json({ ok: true });
}
