import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { z } from "zod";

const createPromoSchema = z.object({
  code: z
    .string()
    .min(3, "الكود يجب أن يكون 3 أحرف على الأقل")
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "الكود يجب أن يحتوي على أحرف إنجليزية وأرقام فقط"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().min(0).optional().default(0),
  maxUses: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  expiresAt: z.string().optional().nullable(),
});

// جلب كل الأكواد
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ promos });
}

// إنشاء كود جديد
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // تحويل الكود إلى أحرف كبيرة
    body.code = body.code?.trim().toUpperCase();
    const data = createPromoSchema.parse(body);

    const promo = await prisma.promoCode.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder ?? 0,
        maxUses: data.maxUses ?? null,
        isActive: data.isActive ?? true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const msg = (err as { message?: string }).message ?? "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "هذا الكود موجود مسبقاً" }, { status: 409 });
    }
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
