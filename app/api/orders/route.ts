import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().regex(/^(05|06|07)\d{8}$/),
  wilayaCode: z.string().min(1),
  wilayaName: z.string().min(1),
  commune: z.string().optional().default(""),
  deliveryType: z.enum(["home", "office"]),
  address: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  subtotal: z.number().positive(),
  discount: z.number().min(0).optional().default(0),
  deliveryFee: z.number().min(0),
  total: z.number().positive(),
  promoCode: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createOrderSchema.parse(body);

    // التحقق من وجود المنتجات فقط
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return NextResponse.json(
          { error: `المنتج غير موجود: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    // التحقق من كود البرومو إذا وُجد
    let promoId: string | null = null;
    if (data.promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode.trim().toUpperCase() },
      });
      if (promo && promo.isActive) {
        promoId = promo.id;
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          wilayaCode: data.wilayaCode,
          wilayaName: data.wilayaName,
          commune: data.commune,
          deliveryType: data.deliveryType,
          address: data.address,
          notes: data.notes,
          subtotal: data.subtotal,
          discount: data.discount ?? 0,
          deliveryFee: data.deliveryFee,
          total: data.total,
          promoCode: data.promoCode ?? null,
          status: "NEW",
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // زيادة عداد استخدام الكود
      if (promoId) {
        await tx.promoCode.update({
          where: { id: promoId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      { orderNumber: order.orderNumber, id: order.id },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الطلب" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 20;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: status ? { status } : {},
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: status ? { status } : {} }),
  ]);

  return NextResponse.json({ orders, total, page, pageSize });
}
