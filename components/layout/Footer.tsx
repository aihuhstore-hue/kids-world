import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getSocialLinks() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["fb_page_url", "instagram_url", "tiktok_page_url", "whatsapp_number"] } },
    });
    const s: Record<string, string> = {};
    for (const row of settings) s[row.key] = row.value;
    return s;
  } catch {
    return {};
  }
}

export default async function Footer() {
  const social = await getSocialLinks();
  const fbUrl = social.fb_page_url?.trim() || "";
  const igUrl = social.instagram_url?.trim() || "";
  const ttUrl = social.tiktok_page_url?.trim() || "";
  const waNum = social.whatsapp_number?.trim() || "";
  const waUrl = waNum ? `https://wa.me/${waNum}` : "";

  const hasSocial = fbUrl || igUrl || ttUrl || waUrl;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-300 rounded-2xl flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">ع</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">عالم الأطفال</h3>
                <p className="text-xs text-gray-400">كتب وألعاب تعليمية</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              ازرع فيه حب الاكتشاف من اليوم الأول. نوفر أفضل الكتب والألعاب
              التعليمية للأطفال مع توصيل لجميع ولايات الجزائر.
            </p>
            <div className="mt-4 p-3 bg-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">دفع عند الاستلام</span>
              </div>
              <p className="text-xs text-gray-500">
                لا تدفع شيئاً حتى يصلك طلبك
              </p>
            </div>
          </div>

          {/* Age Links */}
          <div>
            <h4 className="font-bold text-base mb-4 text-primary-300">
              تصنيف حسب العمر
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/category/0-18-months" className="hover:text-white transition-colors">
                  👶 من 0 إلى 18 شهر
                </Link>
              </li>
              <li>
                <Link href="/category/18-36-months" className="hover:text-white transition-colors">
                  🧒 من 18 إلى 36 شهر
                </Link>
              </li>
              <li>
                <Link href="/category/3-5-years" className="hover:text-white transition-colors">
                  🎨 من 3 إلى 5 سنوات
                </Link>
              </li>
              <li>
                <Link href="/category/6-plus-years" className="hover:text-white transition-colors">
                  📚 من 6 سنوات فما فوق
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-base mb-4 text-primary-300">
              تواصل معنا
            </h4>
            <ul className="space-y-3 text-sm text-gray-400 mb-5">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-300 flex-shrink-0 mt-0.5" />
                <span>الجزائر — توصيل لجميع الولايات الـ 58</span>
              </li>
            </ul>

            {hasSocial && (
              <div>
                <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">تابعنا على</p>
                <div className="flex flex-col gap-2">
                  {fbUrl && (
                    <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 group"
                      style={{ background: "rgba(24,119,242,0.15)", border: "1px solid rgba(24,119,242,0.25)" }}
                      onMouseEnter={undefined}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#1877F2" }}>
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#60a5fa" }}>Facebook</span>
                      <span className="mr-auto text-gray-600 text-xs">←</span>
                    </a>
                  )}
                  {igUrl && (
                    <a href={igUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200"
                      style={{ background: "rgba(225,48,108,0.15)", border: "1px solid rgba(225,48,108,0.25)" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#f472b6" }}>Instagram</span>
                      <span className="mr-auto text-gray-600 text-xs">←</span>
                    </a>
                  )}
                  {ttUrl && (
                    <a href={ttUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200"
                      style={{ background: "rgba(255,0,80,0.12)", border: "1px solid rgba(255,0,80,0.2)" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#010101" }}>
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#fb7185" }}>TikTok</span>
                      <span className="mr-auto text-gray-600 text-xs">←</span>
                    </a>
                  )}
                  {waUrl && (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200"
                      style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.25)" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#25D366" }}>
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>WhatsApp</span>
                      <span className="mr-auto text-gray-600 text-xs">←</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} عالم الأطفال. جميع الحقوق محفوظة.</p>
          <p>صُنع بـ ❤️ للأطفال الجزائريين</p>
        </div>
      </div>
    </footer>
  );
}
