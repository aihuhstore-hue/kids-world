import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// التحقق من صحة كود البرومو وحساب الخصم
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();
  const orderTotal = parseFloat(searchParams.get("total") ?? "0");

  if (!code) {
    return NextResponse.json(
      { valid: false, message: "أدخل كود الخصم" },
      { status: 400 }
    );
  }

  try {
    const promo = await prisma.promoCode.findUnique({ where: { code } });

    if (!promo) {
      return NextResponse.json({ valid: false, message: "كود الخصم غير صحيح" });
    }

    if (!promo.isActive) {
      return NextResponse.json({ valid: false, message: "كود الخصم غير مفعّل" });
    }

    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return NextResponse.json({ valid: false, message: "انتهت صلاحية كود الخصم" });
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, message: "تم استنفاد كود الخصم" });
    }

    if (orderTotal < promo.minOrder) {
      return NextResponse.json({
        valid: false,
        message: `الحد الأدنى للطلب هو ${promo.minOrder.toLocaleString("ar-DZ")} دج`,
      });
    }

    let discount = 0;
    if (promo.type === "PERCENT") {
      discount = Math.round((orderTotal * promo.value) / 100);
    } else {
      discount = promo.value;
    }

    // لا يتجاوز الخصم قيمة الطلب
    discount = Math.min(discount, orderTotal);

    return NextResponse.json({
      valid: true,
      discount,
      promoId: promo.id,
      message:
        promo.type === "PERCENT"
          ? `خصم ${promo.value}%`
          : `خصم ${promo.value.toLocaleString("ar-DZ")} دج`,
    });
  } catch {
    return NextResponse.json(
      { valid: false, message: "حدث خطأ أثناء التحقق" },
      { status: 500 }
    );
  }
}
