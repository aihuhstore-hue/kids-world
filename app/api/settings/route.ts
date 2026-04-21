import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) result[s.key] = s.value;
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  return NextResponse.json({ ok: true });
}
