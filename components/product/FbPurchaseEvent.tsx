"use client";

import { useEffect } from "react";

interface Props {
  value: number;
  eventId: string;
  currency?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function FbPurchaseEvent({ value, eventId, currency = "DZD" }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Purchase", { value, currency }, { eventID: eventId });
    }
  }, [value, currency, eventId]);

  return null;
}
