import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TicketIcon, 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  MusicIcon,
  GamepadIcon,
  PaletteIcon,
  UtensilsIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ServicesApiService } from "@/lib/servicesApi";
import { type Service } from "@/lib/servicesApi";

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get events from database
      const allServices = await ServicesApiService.getAllServices();
      const eventServices = allServices.filter(service => 
        service.category === "Event Tickets"
      ).slice(0, 4); // Show only 4 featured events
      
      setEvents(eventServices);
    } catch (error) {
      console.error('Error loading featured events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (eventTitle: string) => {
    if (eventTitle.toLowerCase().includes('music') || eventTitle.toLowerCase().includes('concert')) {
      return <MusicIcon className="w-5 h-5" />;
    } else if (eventTitle.toLowerCase().includes('sport') || eventTitle.toLowerCase().includes('game')) {
      return <GamepadIcon className="w-5 h-5" />;
    } else if (eventTitle.toLowerCase().includes('art') || eventTitle.toLowerCase().includes('exhibition')) {
      return <PaletteIcon className="w-5 h-5" />;
    } else if (eventTitle.toLowerCase().includes('food') || eventTitle.toLowerCase().includes('dining')) {
      return <UtensilsIcon className="w-5 h-5" />;
    }
    return <TicketIcon className="w-5 h-5" />;
  };

  const getEventCategory = (event: Service) => {
    if (event.title.toLowerCase().includes('music') || event.title.toLowerCase().includes('concert')) {
      return "Music & Concerts";
    } else if (event.title.toLowerCase().includes('sport') || event.title.toLowerCase().includes('game')) {
      return "Sports & Games";
    } else if (event.title.toLowerCase().includes('art') || event.title.toLowerCase().includes('exhibition')) {
      return "Arts & Culture";
    } else if (event.title.toLowerCase().includes('food') || event.title.toLowerCase().includes('dining')) {
      return "Food & Dining";
    }
    return "Other Events";
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading amazing events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-lg text-muted-foreground">No events available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Events</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most exciting events happening in Hargeisa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {events.map((event) => (
            <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {getEventCategory(event)}
                  </Badge>
                  <div className="flex items-center text-yellow-500">
                    <StarIcon className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">{event.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                  {event.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-3xl text-center mb-4">{event.image}</div>
                
                <p className="text-gray-600 text-sm line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {event.location}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-600">
                    {event.price}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/services/${event.id}`)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Book Now
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            onClick={() => navigate('/events')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
          >
            View All Events
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
