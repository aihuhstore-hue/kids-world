"use client";

import { useEffect } from "react";

interface Props {
  value: number;
  currency?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function FbPurchaseEvent({ value, currency = "DZD" }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Purchase", { value, currency });
    }
  }, [value, currency]);

  return null;
}
