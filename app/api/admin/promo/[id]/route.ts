import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";

// تعديل كود (تفعيل/إيقاف)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const promo = await prisma.promoCode.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        value: body.value !== undefined ? body.value : undefined,
        maxUses: body.maxUses !== undefined ? body.maxUses : undefined,
      },
    });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: "الكود غير موجود" }, { status: 404 });
  }
}

// حذف كود
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "الكود غير موجود" }, { status: 404 });
  }
}
