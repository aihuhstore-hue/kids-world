import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AGE_GROUP_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type AgeGroup,
  type OrderStatus,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price)) return "0 دج";
  return `${price.toLocaleString("ar-DZ")} دج`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `ORD-${timestamp}-${random}`;
}

export function getAgeGroupLabel(ageGroup: string): string {
  return AGE_GROUP_LABELS[ageGroup as AgeGroup] ?? ageGroup;
}

export function getStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export function getStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status as OrderStatus] ?? "bg-gray-100 text-gray-800";
}

export function validateAlgerianPhone(phone: string): boolean {
  return /^(05|06|07)\d{8}$/.test(phone);
}

export function parseProduct<T extends { features: string; images: string }>(
  product: T
): Omit<T, "features" | "images"> & { features: string[]; images: string[] } {
  return {
    ...product,
    features: JSON.parse(product.features) as string[],
    images: JSON.parse(product.images) as string[],
  };
}
