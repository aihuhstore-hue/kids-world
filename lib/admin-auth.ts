import { NextRequest } from "next/server";
import { prisma } from "./prisma";

/**
 * التحقق من صلاحية المشرف — يفحص قاعدة البيانات أولاً ثم .env
 */
export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  const pass = req.headers.get("x-admin-password") ?? "";
  if (!pass) return false;

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "admin_password" },
    });
    if (setting && pass === setting.value) return true;
  } catch {
    // تجاهل خطأ قاعدة البيانات والتحقق من .env
  }

  return pass === (process.env.ADMIN_PASSWORD ?? "");
}

/**
 * جلب كلمة السر النشطة (من DB أو .env)
 */
export async function getActivePassword(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "admin_password" },
    });
    if (setting?.value) return setting.value;
  } catch {
    // تجاهل
  }
  return process.env.ADMIN_PASSWORD ?? "admin123";
}
