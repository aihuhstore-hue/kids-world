import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";

// تحديث حالة الطلب
export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { orderId, status } = await req.json();
  const validStatuses = ["NEW", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return NextResponse.json(order);
}

// إحصائيات لوحة التحكم
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [totalOrders, newOrders, totalProducts, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "SHIPPED"] } },
      _sum: { total: true },
    }),
  ]);

  return NextResponse.json({
    totalOrders,
    newOrders,
    totalProducts,
    revenue: revenue._sum.total ?? 0,
  });
}
