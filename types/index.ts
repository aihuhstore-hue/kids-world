import { z } from "zod";

// ─── Enums ──────────────────────────────────────────────────────────────────

export type AgeGroup =
  | "MONTHS_0_18"
  | "MONTHS_18_36"
  | "YEARS_3_5"
  | "YEARS_6_PLUS";

export type ProductType = "BOOK" | "TOY";

export type OrderStatus =
  | "NEW"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  MONTHS_0_18: "من 0 إلى 18 شهر",
  MONTHS_18_36: "من 18 إلى 36 شهر",
  YEARS_3_5: "من 3 إلى 5 سنوات",
  YEARS_6_PLUS: "من 6 سنوات فما فوق",
};

export const AGE_GROUP_EMOJI: Record<AgeGroup, string> = {
  MONTHS_0_18: "👶",
  MONTHS_18_36: "🧒",
  YEARS_3_5: "🎨",
  YEARS_6_PLUS: "📚",
};

export const AGE_GROUP_SLUG: Record<string, AgeGroup> = {
  "0-18-months": "MONTHS_0_18",
  "18-36-months": "MONTHS_18_36",
  "3-5-years": "YEARS_3_5",
  "6-plus-years": "YEARS_6_PLUS",
};

export const AGE_GROUP_TO_SLUG: Record<AgeGroup, string> = {
  MONTHS_0_18: "0-18-months",
  MONTHS_18_36: "18-36-months",
  YEARS_3_5: "3-5-years",
  YEARS_6_PLUS: "6-plus-years",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  BOOK: "كتاب",
  TOY: "لعبة",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "جديد",
  PREPARING: "قيد التحضير",
  SHIPPED: "تم الشحن",
  DELIVERED: "مُسلَّم",
  CANCELLED: "ملغى",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  PREPARING: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string | null;
  hookTitle: string;
  features: string; // JSON string
  price: number;
  oldPrice?: number | null;
  images: string; // JSON string
  ageGroup: string;
  type: string;
  stock: number;
  showStock: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedProduct extends Omit<Product, "features" | "images"> {
  features: string[];
  images: string[];
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  deliveryType: string;
  address: string;
  notes?: string | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface PromoCode {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
}

export interface PromoValidation {
  valid: boolean;
  discount: number;
  message?: string;
  promoId?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// ─── Order Form ──────────────────────────────────────────────────────────────

export const orderFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(50, "الاسم طويل جداً"),
  lastName: z
    .string()
    .min(2, "اللقب يجب أن يكون حرفين على الأقل")
    .max(50, "اللقب طويل جداً"),
  phone: z
    .string()
    .regex(
      /^(05|06|07)\d{8}$/,
      "رقم الهاتف غير صحيح — يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام"
    ),
  wilayaCode: z.string().min(1, "يرجى اختيار الولاية"),
  commune: z.string().optional().default(""),
  deliveryType: z.enum(["home", "office"], {
    required_error: "يرجى اختيار نوع التوصيل",
  }),
  address: z.string().min(5, "يرجى إدخال العنوان التفصيلي"),
  notes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

// ─── Wilaya ──────────────────────────────────────────────────────────────────

export interface Wilaya {
  code: string;
  name: string;
  nameFr: string;
  homeDelivery: number;
  officeDelivery: number;
  communes: string[];
}
