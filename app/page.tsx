import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { CombinedOverview } from "@/components/combined-overview";
import { VideoTestimonials } from "@/components/video-testimonials";
import { SocialProof } from "@/components/social-proof";
import { FAQ } from "@/components/faq";
import { ApplyCTA } from "@/components/apply-cta";
import { Footer } from "@/components/footer";
import { WorldMapSection } from "@/components/world-map-section";
import { PrefetchBelowFold } from "@/components/prefetch-below-fold";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <PrefetchBelowFold />
      <VideoTestimonials />
      <CombinedOverview />
      <WorldMapSection />
      <SocialProof />
      <FAQ />
      <ApplyCTA />
      <Footer />
      </main>
  );
}
