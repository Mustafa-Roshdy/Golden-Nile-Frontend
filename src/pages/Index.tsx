import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ReservationSection from "@/components/ReservationSection";
import AttractionsSection from "@/components/AttractionsSection";
import ExploreSection from "@/components/ExploreSection";
import CulturalSection from "@/components/CulturalSection";
import CommunitySection from "@/components/CommunitySection";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
const Index = () => {
  const { pathname } = useLocation();
  
  
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
  return (
    <>
    <div className="min-h-screen">
      <Navbar />
      {/* <Hero /> */}
      <ExploreSection />
      <ReservationSection />
      <AttractionsSection />
      <CulturalSection />
      <CommunitySection />
      <BlogSection />
      <CTASection />
      <Footer />

    </div>
    </>
  );
};

export default Index;
