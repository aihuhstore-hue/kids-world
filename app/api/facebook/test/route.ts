import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["fb_pixel_id", "fb_access_token", "fb_test_code"] } },
  });

  const pixelId = settings.find((s) => s.key === "fb_pixel_id")?.value?.trim();
  const token   = settings.find((s) => s.key === "fb_access_token")?.value?.trim();
  const testCode = settings.find((s) => s.key === "fb_test_code")?.value?.trim();

  if (!pixelId || !token) {
    return NextResponse.json({ error: "no_config" }, { status: 400 });
  }

  const hashedPhone = await sha256("0555000099");

  const payload: Record<string, unknown> = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      user_data: { ph: [hashedPhone] },
      custom_data: {
        currency: "DZD",
        value: 1350,
        order_id: "TEST-CAPI-001",
        num_items: 1,
      },
    }],
  };
  if (testCode) payload.test_event_code = testCode;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  return NextResponse.json({ status: res.status, fb_response: data, pixelId, testCode: testCode || null });
}
