import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  longDescription: z.string().optional().nullable(),
  hookTitle: z.string().default(""),
  features: z.array(z.string()),
  price: z.number().min(0).default(0),
  oldPrice: z.number().optional().nullable(),
  images: z.array(z.string()),
  ageGroup: z.enum(["MONTHS_0_18", "MONTHS_18_36", "YEARS_3_5", "YEARS_6_PLUS"]),
  type: z.enum(["BOOK", "TOY"]),
  stock: z.number().int().min(0),
  showStock: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ageGroup = searchParams.get("ageGroup");
  const type = searchParams.get("type");
  const active = searchParams.get("active");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "newest";

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const }
    : sort === "price_desc" ? { price: "desc" as const }
    : sort === "stock_asc" ? { stock: "asc" as const }
    : sort === "oldest" ? { createdAt: "asc" as const }
    : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where: {
      ...(ageGroup ? { ageGroup } : {}),
      ...(type ? { type } : {}),
      ...(active !== null ? { isActive: active === "true" } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy,
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...data,
        features: JSON.stringify(data.features),
        images: JSON.stringify(data.images),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "بيانات غير صحيحة" }, { status: 400 });
    }
    const msg = (err as { message?: string }).message ?? "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "هذا الـ slug موجود مسبقاً" }, { status: 409 });
    }
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
