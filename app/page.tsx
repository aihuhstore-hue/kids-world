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
      where: { isActive: true, stock: { gt: 0 } },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    return products.map(parseProduct);
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
