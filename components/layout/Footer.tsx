import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Star } from "lucide-react";
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
  return (
    <footer className="bg-gray-900 text-white">
      {/* Top section */}
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
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {igUrl && (
                <a href={igUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-pink-500 rounded-xl flex items-center justify-center transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {ttUrl && (
                <a href={ttUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors" title="TikTok">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </a>
              )}
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors" title="WhatsApp">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-base mb-4 text-primary-300">
              تصنيف حسب العمر
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/category/0-18-months"
                  className="hover:text-white transition-colors"
                >
                  👶 من 0 إلى 18 شهر
                </Link>
              </li>
              <li>
                <Link
                  href="/category/18-36-months"
                  className="hover:text-white transition-colors"
                >
                  🧒 من 18 إلى 36 شهر
                </Link>
              </li>
              <li>
                <Link
                  href="/category/3-5-years"
                  className="hover:text-white transition-colors"
                >
                  🎨 من 3 إلى 5 سنوات
                </Link>
              </li>
              <li>
                <Link
                  href="/category/6-plus-years"
                  className="hover:text-white transition-colors"
                >
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
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-300 flex-shrink-0" />
                <span dir="ltr">+213 555 12 34 56</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-300 flex-shrink-0" />
                <span>contact@kids-world.dz</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-300 flex-shrink-0 mt-0.5" />
                <span>الجزائر — توصيل لجميع الولايات الـ 58</span>
              </li>
            </ul>

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
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© 2024 عالم الأطفال. جميع الحقوق محفوظة.</p>
          <p>صُنع بـ ❤️ للأطفال الجزائريين</p>
        </div>
      </div>
    </footer>
  );
}
