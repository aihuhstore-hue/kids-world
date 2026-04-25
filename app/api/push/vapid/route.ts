import { NextResponse } from "next/server";
import webPush from "web-push";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["vapid_public_key", "vapid_private_key"] } },
  });

  let publicKey = settings.find((s) => s.key === "vapid_public_key")?.value;
  let privateKey = settings.find((s) => s.key === "vapid_private_key")?.value;

  if (!publicKey || !privateKey) {
    const keys = webPush.generateVAPIDKeys();
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    await Promise.all([
      prisma.setting.upsert({
        where: { key: "vapid_public_key" },
        update: { value: publicKey },
        create: { key: "vapid_public_key", value: publicKey },
      }),
      prisma.setting.upsert({
        where: { key: "vapid_private_key" },
        update: { value: privateKey },
        create: { key: "vapid_private_key", value: privateKey },
      }),
    ]);
  }

  return NextResponse.json({ publicKey });
}
