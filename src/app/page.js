import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import WhyThisSystem from "@/components/WhyThisSystem";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <WhyThisSystem />

      <Footer />
    </div>
  );
}
