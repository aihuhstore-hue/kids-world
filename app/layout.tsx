import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "عالم الأطفال | كتب وألعاب تعليمية",
    template: "%s | عالم الأطفال",
  },
  description:
    "متجر إلكتروني متخصص في الكتب والألعاب التعليمية للأطفال في الجزائر. توصيل لجميع الولايات الـ58. دفع عند الاستلام.",
  keywords: ["كتب أطفال", "ألعاب تعليمية", "الجزائر", "متجر أطفال"],
  openGraph: {
    title: "عالم الأطفال | كتب وألعاب تعليمية",
    description: "ازرع فيه حب الاكتشاف من اليوم الأول",
    locale: "ar_DZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable}`}
    >
      <body className={`${cairo.className} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "Cairo, sans-serif",
              direction: "rtl",
            },
            success: {
              style: { background: "#86EFAC", color: "#14532d" },
            },
            error: {
              style: { background: "#fecaca", color: "#7f1d1d" },
            },
          }}
        />
      </body>
    </html>
  );
}
