import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  longDescription: z.string().optional().nullable(),
  hookTitle: z.string().optional(),
  features: z.array(z.string()).optional(),
  price: z.number().positive().optional(),
  oldPrice: z.number().optional().nullable(),
  images: z.array(z.string()).optional(),
  ageGroup: z.string().optional(),
  type: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  showStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.features) updateData.features = JSON.stringify(data.features);
    if (data.images) updateData.images = JSON.stringify(data.images);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطأ في التحديث" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // حذف نهائي للمنتج
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "المنتج غير موجود أو مرتبط بطلبات" }, { status: 400 });
  }
}
