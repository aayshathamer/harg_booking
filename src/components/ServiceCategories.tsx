import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HotelIcon, CarIcon, TicketIcon, MapIcon, StarIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ServicesApiService } from "@/lib/servicesApi";

const ServiceCategories = () => {
  const navigate = useNavigate();
  const [serviceCounts, setServiceCounts] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const categories = [
    {
      icon: HotelIcon,
      title: "Hotels & Stays",
      description: "Comfortable accommodations from budget to luxury",
      color: "from-blue-500 to-blue-600",
      image: "🏨",
      path: "/services?category=Hotels%20%26%20Stays"
    },
    {
      icon: CarIcon,
      title: "Car Rentals",
      description: "Reliable vehicles for every journey",
      color: "from-orange-500 to-red-500",
      image: "🚗",
      path: "/services?category=Car%20Rentals"
    },
    {
      icon: TicketIcon,
      title: "Event Tickets",
      description: "Access to concerts, sports, and cultural events",
      color: "from-purple-500 to-pink-500",
      path: "/events"
    },
    {
      icon: MapIcon,
      title: "Activities",
      description: "Unforgettable experiences and adventures",
      color: "from-green-500 to-teal-500",
      image: "🎯",
      path: "/services?category=Activities"
    }
  ];

  // Fetch real service counts from database
  useEffect(() => {
    const fetchServiceCounts = async () => {
      try {
        setIsLoading(true);
        const counts = await ServicesApiService.getServiceCountsByCategory();
        setServiceCounts(counts);
      } catch (error) {
        console.error('Error fetching service counts:', error);
        // Fallback to default counts if API fails
        setServiceCounts({
          "Hotels & Stays": 5,
          "Car Rentals": 4,
          "Event Tickets": 4,
          "Activities": 6
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceCounts();
  }, []);

  // Helper function to get appropriate count labels
  const getCountLabel = (categoryTitle: string): string => {
    switch (categoryTitle) {
      case "Hotels & Stays":
        return "Properties";
      case "Car Rentals":
        return "Vehicles";
      case "Event Tickets":
        return "Events";
      case "Activities":
        return "Activities";
      default:
        return "Services";
    }
  };

  return (
    <section className="py-10 sm:py-20 px-2 sm:px-4 bg-gradient-to-br from-background/80 to-accent/10 dark:from-gray-900/80 dark:to-gray-800/10 relative overflow-hidden">
      {/* Animated Futuristic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-60 sm:w-96 h-60 sm:h-96 bg-gradient-to-tr from-green-400/30 via-blue-400/20 to-purple-400/10 dark:from-green-400/20 dark:via-blue-400/15 dark:to-purple-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-gradient-to-br from-yellow-400/20 to-orange-400/10 dark:from-yellow-400/15 dark:to-orange-400/10 rounded-full blur-2xl animate-float" />
      </div>
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-move drop-shadow-neon">
            <SparklesIcon className="inline w-8 sm:w-10 h-8 sm:h-10 text-blue-400 dark:text-blue-300 animate-spin-slow mr-2" />
            Explore Our Services! 🌟
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            <span className="bg-gradient-to-r from-green-500/20 to-blue-500/20 dark:from-green-500/15 dark:to-blue-500/15 px-2 sm:px-3 py-1 rounded-full animate-pulse">
              {isLoading ? "Loading real-time service counts..." : "From comfortable stays to thrilling adventures, we've got everything you need! ✨"}
            </span>
          </p>
          

        </div>
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={index}
                className={`group cursor-pointer border-0 shadow-xl hover:shadow-blue-500/70 dark:hover:shadow-blue-400/50 overflow-hidden bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl transition-transform duration-300 hover:scale-105 hover:-translate-y-2 relative animate-fade-in-float`} 
                style={{ animationDelay: `${index * 0.12}s` }}
                onClick={() => {
                  // Navigate using the path property if available, otherwise use the default services route
                  if (category.path) {
                    navigate(category.path);
                  } else {
                    navigate(`/services?category=${encodeURIComponent(category.title)}`);
                  }
                }}
              >
                {/* Futuristic Animated Border/Glow */}
                <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 dark:border-blue-400/20 group-hover:border-blue-400/80 dark:group-hover:border-blue-400/60 group-hover:shadow-neon pointer-events-none transition-all duration-300 animate-glow" />
                <CardContent className="p-0 relative z-10">
                  <div className="p-4 sm:p-8 relative flex flex-col items-center justify-center">
                    {/* Icon and Emoji */}
                    <div className="flex items-center justify-between w-full mb-4 sm:mb-6">
                      <div className="text-3xl sm:text-5xl drop-shadow-neon-faint animate-float">{category.image}</div>
                      <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-br ${category.color} shadow-primary animate-glow hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                      </div>
                    </div>
                    {/* Title */}
                    <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3 text-foreground dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-smooth tracking-wide futuristic-font">
                      {category.title}
                    </h3>
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mb-2 sm:mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    {/* Action Arrow */}
                    <div className="flex items-center justify-end w-full">
                      <ArrowRightIcon className="w-4 h-4 text-muted-foreground dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-smooth hover:scale-110" />
                    </div>
                    
                    {/* Click hint */}
                    <div className="text-xs text-muted-foreground dark:text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Click to view all {category.title.toLowerCase()} →
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* CTA Section */}
        <div className="text-center mt-8 sm:mt-16">
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => navigate("/services")}
          >
            Browse All Services
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
// Custom animations (add to your global CSS or tailwind.config.js):
// animate-glow, animate-fade-in-float, animate-pop, drop-shadow-neon, shadow-neon, futuristic-font