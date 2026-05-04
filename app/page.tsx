"use client";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProductTilesSection from "../components/landing/ProductTilesSection";
import FeaturedLessons from "../components/FeaturedLessons";
import FeaturesSection from "../components/FeaturesSection";
import PricingSection from "../components/PricingSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      <HeroSection />
      <ProductTilesSection />
      <FeaturedLessons />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
