import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";
import webPush from "web-push";

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

    // Facebook Conversions API
    try {
      const fbSettings = await prisma.setting.findMany({
        where: { key: { in: ["fb_pixel_id", "fb_access_token"] } },
      });
      const fbPixelId = fbSettings.find((s) => s.key === "fb_pixel_id")?.value?.trim();
      const fbToken = fbSettings.find((s) => s.key === "fb_access_token")?.value?.trim();

      if (fbPixelId && fbToken) {
        const eventTime = Math.floor(Date.now() / 1000);
        await fetch(`https://graph.facebook.com/v18.0/${fbPixelId}/events?access_token=${fbToken}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: [{
              event_name: "Purchase",
              event_time: eventTime,
              action_source: "website",
              user_data: {
                ph: [data.phone],
              },
              custom_data: {
                currency: "DZD",
                value: data.total,
                order_id: order.orderNumber,
                num_items: data.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
              },
            }],
          }),
        }).catch(() => {});
      }
    } catch { /* لا نوقف الطلب إذا فشل الإرسال */ }

    // Push Notifications
    try {
      const pushSettings = await prisma.setting.findMany({
        where: { key: { in: ["vapid_public_key", "vapid_private_key", "push_subscriptions"] } },
      });
      const pubKey = pushSettings.find((s) => s.key === "vapid_public_key")?.value;
      const privKey = pushSettings.find((s) => s.key === "vapid_private_key")?.value;
      const subsJson = pushSettings.find((s) => s.key === "push_subscriptions")?.value;

      if (pubKey && privKey && subsJson) {
        const subs: PushSubscriptionJSON[] = JSON.parse(subsJson);
        if (subs.length > 0) {
          webPush.setVapidDetails("mailto:admin@kidsworldj.dz", pubKey, privKey);
          const payload = JSON.stringify({
            title: `🛒 طلبية جديدة #${order.orderNumber}`,
            body: `${data.firstName} ${data.lastName} — ${data.total.toLocaleString("ar-DZ")} دج`,
            url: "/admin/orders",
          });
          const validSubs: PushSubscriptionJSON[] = [];
          for (const sub of subs) {
            try {
              await webPush.sendNotification(sub as webPush.PushSubscription, payload);
              validSubs.push(sub);
            } catch { /* expired subscription */ }
          }
          if (validSubs.length !== subs.length) {
            await prisma.setting.update({
              where: { key: "push_subscriptions" },
              data: { value: JSON.stringify(validSubs) },
            });
          }
        }
      }
    } catch { /* لا نوقف الطلب */ }

    // Google Sheets Webhook
    try {
      const sheetsSetting = await prisma.setting.findUnique({
        where: { key: "google_sheets_webhook" },
      });
      const webhookUrl = sheetsSetting?.value?.trim();
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: order.orderNumber,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            wilayaName: data.wilayaName,
            commune: data.commune,
            deliveryType: data.deliveryType,
            address: data.address,
            total: data.total,
            subtotal: data.subtotal,
            deliveryFee: data.deliveryFee,
            discount: data.discount ?? 0,
            promoCode: data.promoCode ?? "",
            status: "NEW",
            createdAt: new Date().toISOString(),
          }),
        }).catch(() => {});
      }
    } catch { /* لا نوقف الطلب إذا فشل الإرسال لـ Sheets */ }

    // Telegram Notification
    try {
      const tgSettings = await prisma.setting.findMany({
        where: { key: { in: ["telegram_bot_token", "telegram_chat_id"] } },
      });
      const tgToken = tgSettings.find((s) => s.key === "telegram_bot_token")?.value?.trim();
      const tgChatId = tgSettings.find((s) => s.key === "telegram_chat_id")?.value?.trim();

      if (tgToken && tgChatId) {
        const orderFull = await prisma.order.findUnique({
          where: { id: order.id },
          include: { items: { include: { product: true } } },
        });

        const deliveryLabel = data.deliveryType === "home" ? "🏠 توصيل للمنزل" : "🏢 مكتب بريد";
        const itemLines = (orderFull?.items ?? []).map(
          (item) => `  • ${item.product.name} × ${item.quantity} — ${(item.price * item.quantity).toLocaleString("ar-DZ")} دج`
        );

        const lines = [
          `🛒 *طلبية جديدة #${order.orderNumber}*`,
          `━━━━━━━━━━━━━━━`,
          `👤 *${data.firstName} ${data.lastName}*`,
          `📱 ${data.phone}`,
          `📍 ${data.wilayaName}${data.commune ? " — " + data.commune : ""}`,
          `${deliveryLabel}`,
          `🏘️ العنوان: ${data.address}`,
          data.notes ? `📝 ملاحظة: ${data.notes}` : "",
          `━━━━━━━━━━━━━━━`,
          `🛍️ *المنتجات:*`,
          ...itemLines,
          `━━━━━━━━━━━━━━━`,
          `🧾 المجموع: ${data.subtotal.toLocaleString("ar-DZ")} دج`,
          `🚚 التوصيل: ${data.deliveryFee.toLocaleString("ar-DZ")} دج`,
          data.discount ? `🏷️ خصم: ${data.discount.toLocaleString("ar-DZ")} دج` : "",
          data.promoCode ? `🎟️ كود: ${data.promoCode}` : "",
          `💰 *الإجمالي: ${data.total.toLocaleString("ar-DZ")} دج*`,
        ].filter(Boolean).join("\n");

        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChatId, text: lines, parse_mode: "Markdown" }),
        }).catch(() => {});
      }
    } catch { /* لا نوقف الطلب */ }

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
