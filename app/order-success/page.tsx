import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Package, Phone, Home } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderNumber = "ORD-XXXXX" } = await searchParams;

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["success_title", "success_message", "success_image", "success_show_steps", "success_step1", "success_step2", "success_step3"] } }
  });
  const s: Record<string, string> = {};
  for (const row of settings) s[row.key] = row.value;

  const title = s.success_title || "تم تأكيد طلبك! 🎉";
  const message = s.success_message || "شكراً لك! سيتصل بك فريقنا خلال 24 ساعة لتأكيد الطلب";
  const image = s.success_image || "";
  const showSteps = s.success_show_steps !== "false";
  const step1 = s.success_step1 || "سيتصل بك مستشارنا لتأكيد الطلب";
  const step2 = s.success_step2 || "يتم تحضير وشحن طلبك خلال 24-48 ساعة";
  const step3 = s.success_step3 || "يصلك طلبك خلال 2-5 أيام عمل";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-[3rem] shadow-lg p-8">
            {image ? (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6">
                <Image src={image} alt="success" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            )}

            <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500 mb-6">{message}</p>

            {showSteps && (
              <div className="space-y-3 mb-8 text-right">
                <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">خطوة 1: التأكيد</p>
                    <p className="text-xs text-gray-500">{step1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-yellow-50 rounded-2xl p-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">خطوة 2: الشحن</p>
                    <p className="text-xs text-gray-500">{step2}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-2xl p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">خطوة 3: التوصيل</p>
                    <p className="text-xs text-gray-500">{step3}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1 btn-outline text-center py-3">
                <Home className="w-4 h-4 inline me-2" />
                الصفحة الرئيسية
              </Link>
              <Link href="/category/3-5-years" className="flex-1 btn-primary text-center py-3">
                تصفح المزيد
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
