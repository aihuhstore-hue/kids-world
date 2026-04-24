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
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "SHIPPED"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "SHIPPED"] }, createdAt: { gte: startOfWeek } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "SHIPPED"] }, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "SHIPPED"] }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { total: true },
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
    weekRevenue: weekRevenue._sum.total ?? 0,
    monthRevenue: monthRevenue._sum.total ?? 0,
    lastMonthRevenue: lastMonthRevenue._sum.total ?? 0,
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
