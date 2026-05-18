"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProductTilesSection from "../components/landing/ProductTilesSection";
import AppPreviewSection from "../components/landing/AppPreviewSection";
import FeaturedLessons from "../components/FeaturedLessons";
import FeaturesSection from "../components/FeaturesSection";
import PricingSection from "../components/PricingSection";
import Footer from "../components/Footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      <HeroSection />
      <ProductTilesSection />
      <AppPreviewSection />
      <FeaturedLessons />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
