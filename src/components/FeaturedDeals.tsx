import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartIcon, MapPinIcon, StarIcon, ClockIcon, ArrowRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DealsApiService } from "@/lib/dealsApi";
import { type Deal } from "@/lib/dealsApi";

const FeaturedDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeaturedDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get deals from database
        const allDeals = await DealsApiService.getAllDeals();
        const featuredDeals = allDeals
          .filter(deal => deal.isActive)
          .sort((a, b) => {
            // Prioritize hot deals and AI recommended deals
            if (a.isHot && !b.isHot) return -1;
            if (!a.isHot && b.isHot) return 1;
            if (a.isAiRecommended && !b.isAiRecommended) return -1;
            if (!a.isAiRecommended && b.isAiRecommended) return 1;
            return 0;
          })
          .slice(0, 4);
        
        setDeals(featuredDeals);
      } catch (error) {
        console.error('Error loading featured deals:', error);
        setError('Failed to load deals');
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedDeals();
  }, []);

  return (
    <section className="py-20 px-6 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Amazing Deals
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Don't miss out on these incredible offers
          </p>
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Loading Deals</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Deals Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Check back later for amazing offers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {deals.map((deal) => (
              <Card 
                key={deal.id}
                className="group border-0 shadow-lg hover:shadow-xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-0">
                  {/* Deal Header */}
                  <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        {deal.discountPercentage}% OFF
                      </Badge>
                      <HeartIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors cursor-pointer" />
                    </div>
                    
                    <div className="text-center">
                      <div className="text-6xl mb-3">{deal.image}</div>
                      <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-600 text-gray-700 dark:text-gray-300">
                        {deal.category}
                      </Badge>
                    </div>
                    
                    {/* Special Badges */}
                    {deal.isHot && (
                      <Badge className="absolute top-4 right-4 bg-red-500 text-white animate-pulse">
                        🔥 HOT
                      </Badge>
                    )}
                    
                    {deal.isAiRecommended && (
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        🤖 AI
                      </Badge>
                    )}
                  </div>

                  {/* Deal Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                      {deal.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {deal.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {deal.location}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {deal.rating}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({deal.reviewsCount})
                        </span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {deal.timeLeft}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ${deal.price}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                          ${deal.originalPrice}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      View Deal
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View All Button */}
        {deals.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/deals')}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300"
            >
              View All Deals
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedDeals;