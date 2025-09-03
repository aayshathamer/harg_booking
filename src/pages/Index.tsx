import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceCategories from "@/components/ServiceCategories";
import FeaturedDeals from "@/components/FeaturedDeals";
import FeaturedEvents from "@/components/FeaturedEvents";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import Testimonials from "@/components/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <ServiceCategories />
      <FeaturedDestinations />
      <FeaturedEvents />
      <FeaturedDeals />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
