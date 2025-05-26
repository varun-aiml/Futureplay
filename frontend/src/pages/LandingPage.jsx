import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import ScrollToTop from "../components/ScrollToTop";
import TestimonialsSection from "../components/TestinomialsSection";
import UpcomingTournaments from "../components/UpcomingTournaments";

function LandingPage() {
  return (
    <div className="font-sans">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <UpcomingTournaments />
      <TestimonialsSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default LandingPage;