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
  address: z.string().optional().default(""),
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

type OrderData = z.infer<typeof createOrderSchema>;

// ── إرسال تلغرام ──
async function sendTelegram(
  token: string,
  chatId: string,
  orderNumber: string,
  data: OrderData,
  productMap: Record<string, string>
) {
  if (!token || !chatId) return;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const deliveryLabel = data.deliveryType === "home" ? "🏠 توصيل للمنزل" : "🏢 مكتب بريد";
  const itemLines = data.items.map(
    (item) => `  • ${esc(productMap[item.productId] ?? "منتج")} × ${item.quantity} — ${(item.price * item.quantity).toLocaleString("ar-DZ")} دج`
  );
  const lines = [
    `🛒 <b>طلبية جديدة #${esc(orderNumber)}</b>`,
    `───────────────`,
    `👤 <b>${esc(data.firstName)} ${esc(data.lastName)}</b>`,
    `📱 ${esc(data.phone)}`,
    `📍 ${esc(data.wilayaName)}${data.commune ? " — " + esc(data.commune) : ""}`,
    deliveryLabel,
    data.notes ? `📝 ${esc(data.notes)}` : "",
    `───────────────`,
    `🛍️ <b>المنتجات:</b>`,
    ...itemLines,
    `───────────────`,
    `🧾 المجموع: ${data.subtotal} دج`,
    `🚚 التوصيل: ${data.deliveryFee} دج`,
    data.discount ? `🏷️ خصم: ${data.discount} دج` : "",
    data.promoCode ? `🎟️ كود: ${esc(data.promoCode)}` : "",
    `💰 <b>الإجمالي: ${data.total} دج</b>`,
  ].filter(Boolean).join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "HTML" }),
  });
}

// ── إرسال Google Sheets ──
async function sendSheets(webhookUrl: string, orderNumber: string, data: OrderData) {
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      wilayaName: data.wilayaName,
      commune: data.commune,
      deliveryType: data.deliveryType,
      total: data.total,
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      discount: data.discount ?? 0,
      promoCode: data.promoCode ?? "",
      status: "NEW",
      createdAt: new Date().toISOString(),
    }),
  });
}

// ── إرسال Facebook Conversions ──
async function sendFacebook(pixelId: string, token: string, orderNumber: string, data: OrderData) {
  if (!pixelId || !token) return;
  await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        user_data: { ph: [data.phone] },
        custom_data: {
          currency: "DZD",
          value: data.total,
          order_id: orderNumber,
          num_items: data.items.reduce((s, i) => s + i.quantity, 0),
        },
      }],
    }),
  });
}

// ── إرسال Push Notifications ──
async function sendPush(
  pubKey: string,
  privKey: string,
  subsJson: string,
  orderNumber: string,
  data: OrderData
) {
  if (!pubKey || !privKey || !subsJson) return;
  const subs: webPush.PushSubscription[] = JSON.parse(subsJson);
  if (!subs.length) return;
  webPush.setVapidDetails("mailto:admin@kidsworldj.dz", pubKey, privKey);
  const payload = JSON.stringify({
    title: `🛒 طلبية جديدة #${orderNumber}`,
    body: `${data.firstName} ${data.lastName} — ${data.total.toLocaleString("ar-DZ")} دج`,
    url: "/admin/orders",
  });
  const validSubs: webPush.PushSubscription[] = [];
  for (const sub of subs) {
    try {
      await webPush.sendNotification(sub, payload);
      validSubs.push(sub);
    } catch { /* اشتراك منتهي الصلاحية */ }
  }
  // حذف الاشتراكات المنتهية من DB
  if (validSubs.length !== subs.length) {
    await prisma.setting.update({
      where: { key: "push_subscriptions" },
      data: { value: JSON.stringify(validSubs) },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createOrderSchema.parse(body);

    // ── 1. جلب كل البيانات دفعة واحدة بشكل متوازٍ ──
    const [products, promoResult, allSettings] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: data.items.map((i) => i.productId) } },
        select: { id: true, name: true },
      }),
      data.promoCode
        ? prisma.promoCode.findUnique({ where: { code: data.promoCode.trim().toUpperCase() } })
        : Promise.resolve(null),
      prisma.setting.findMany({
        where: {
          key: {
            in: [
              "telegram_bot_token", "telegram_chat_id",
              "google_sheets_webhook",
              "fb_pixel_id", "fb_access_token",
              "vapid_public_key", "vapid_private_key", "push_subscriptions",
            ],
          },
        },
      }),
    ]);

    // ── 2. التحقق من المنتجات ──
    if (products.length !== data.items.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = data.items.find((i) => !foundIds.has(i.productId));
      return NextResponse.json({ error: `المنتج غير موجود: ${missing?.productId}` }, { status: 400 });
    }

    const promo = promoResult?.isActive ? promoResult : null;
    const orderNumber = generateOrderNumber();

    // ── 3. إنشاء الطلبية ──
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
      if (promo) {
        await tx.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });
      }
      return newOrder;
    });

    // ── 4. الرد الفوري على الزبون ──
    const response = NextResponse.json(
      { orderNumber: order.orderNumber, id: order.id },
      { status: 201 }
    );

    // ── 5. إرسال الإشعارات في الخلفية (لا تؤثر على سرعة الرد) ──
    const s = (key: string) => allSettings.find((x) => x.key === key)?.value?.trim() ?? "";
    const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

    Promise.allSettled([
      sendTelegram(s("telegram_bot_token"), s("telegram_chat_id"), orderNumber, data, productMap),
      sendSheets(s("google_sheets_webhook"), orderNumber, data),
      sendFacebook(s("fb_pixel_id"), s("fb_access_token"), orderNumber, data),
      sendPush(s("vapid_public_key"), s("vapid_private_key"), s("push_subscriptions"), orderNumber, data),
    ]).catch(() => {});

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 });
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
