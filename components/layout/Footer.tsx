import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Star } from "lucide-react";

export default function Footer() {
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
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
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
