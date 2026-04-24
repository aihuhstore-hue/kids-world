import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import AgeCategories from "@/components/home/AgeCategories";
import WhyUs from "@/components/home/WhyUs";
import BestSellers from "@/components/home/BestSellers";
import Testimonials from "@/components/home/Testimonials";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/utils";

export const revalidate = 60;

async function getBestSellers() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { orderItems: { _count: "desc" } },
      include: { _count: { select: { orderItems: true } } },
    });
    return products.map((p) => ({
      ...parseProduct(p),
      salesCount: p._count.orderItems,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const bestSellers = await getBestSellers();

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AgeCategories />
        <BestSellers products={bestSellers} />
        <WhyUs />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
