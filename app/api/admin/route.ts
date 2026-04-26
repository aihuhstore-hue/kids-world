import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalOrders,
    newOrders,
    preparingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalProducts,
    todayOrders,
    yesterdayOrders,
    weekOrders,
    monthOrders,
    revenue,
    weekRevenue,
    monthRevenue,
    lastMonthRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { status: "PREPARING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfYesterday, lt: startOfToday } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    // الإيرادات تشمل كل الطلبات ما عدا الملغاة
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true, deliveryFee: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfWeek } },
      _sum: { total: true, deliveryFee: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
      _sum: { total: true, deliveryFee: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { total: true, deliveryFee: true },
    }),
    // آخر 8 طلبيات
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        wilayaName: true,
        deliveryType: true,
        total: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    totalOrders,
    newOrders,
    preparingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalProducts,
    todayOrders,
    yesterdayOrders,
    weekOrders,
    monthOrders,
    revenue: revenue._sum.total ?? 0,
    revenueNoDelivery: (revenue._sum.total ?? 0) - (revenue._sum.deliveryFee ?? 0),
    weekRevenue: weekRevenue._sum.total ?? 0,
    weekRevenueNoDelivery: (weekRevenue._sum.total ?? 0) - (weekRevenue._sum.deliveryFee ?? 0),
    monthRevenue: monthRevenue._sum.total ?? 0,
    monthRevenueNoDelivery: (monthRevenue._sum.total ?? 0) - (monthRevenue._sum.deliveryFee ?? 0),
    lastMonthRevenue: lastMonthRevenue._sum.total ?? 0,
    recentOrders,
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { orderId, status } = await req.json();
  const validStatuses = ["NEW", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
  }
  const order = await prisma.order.update({ where: { id: orderId }, data: { status } });
  return NextResponse.json(order);
}
