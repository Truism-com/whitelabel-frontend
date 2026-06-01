import { Navbar }          from "@/components/home/navbar";
import { HeroSection }     from "@/components/home/hero-section";
import { StatsBar }        from "@/components/home/stats-bar";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorks }      from "@/components/home/how-it-works";
import { RolesSection }    from "@/components/home/roles-section";
import { ProductsBar }     from "@/components/home/products-bar";
import { CTASection }      from "@/components/home/cta-section";
import { Footer }          from "@/components/home/footer";

export default function LandingPage() {
  return (
    // Applied a unified light gray background to the entire page to soften transitions
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <HeroSection />
      {/* Grouping Stats and Features together without harsh background breaks */}
      <div className="relative z-10 -mt-10 md:-mt-20">
        <StatsBar />
      </div>
      <FeaturesSection />
      <HowItWorks />
      <ProductsBar />
      <RolesSection />
      <CTASection />
      <Footer />
    </div>
  );
}