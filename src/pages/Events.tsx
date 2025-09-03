import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  SearchIcon, 
  FilterIcon, 
  StarIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon, 
  TicketIcon,
  HeartIcon, 
  SparklesIcon, 
  ArrowLeftIcon,
  MusicIcon,
  GamepadIcon,
  PaletteIcon,
  UtensilsIcon
} from "lucide-react";
import { categories, type Service } from "@/data/services";
import { ServicesApiService } from "@/lib/servicesApi";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm, { type BookingFormData } from "@/components/BookingForm";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [sortBy, setSortBy] = useState("date");
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Service | null>(null);
  const [events, setEvents] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Event categories specific to events
  const eventCategories = [
    "All Events",
    "Music & Concerts",
    "Sports & Games", 
    "Arts & Culture",
    "Food & Dining",
    "Technology & Innovation",
    "Business & Networking",
    "Family & Kids"
  ];

  // Scroll to top when component mounts
  useScrollToTop();

  // Handle URL parameters for category filtering
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && eventCategories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Load events from database
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all services and filter for events
      const allServices = await ServicesApiService.getAllServices();
      const eventServices = allServices.filter(service => 
        service.category === "Event Tickets"
      );
      
      setEvents(eventServices);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again.');
      
      // Fallback to mock data
      const mockEvents = [
        {
          id: "event-1",
          title: "Cultural Music Festival",
          description: "Annual celebration of local music, dance, and cultural heritage",
          category: "Event Tickets",
          price: "$30",
          rating: 4.9,
          image: "🎵",
          location: "Cultural Center, Hargeisa",
          features: ["Live Music", "Traditional Dance", "Food Stalls", "Art Exhibits", "Family Friendly"],
          isPopular: true
        },
        {
          id: "event-2",
          title: "Sports Championship",
          description: "Exciting sports competition featuring local and regional teams",
          category: "Event Tickets",
          price: "$20",
          rating: 4.6,
          image: "⚽",
          location: "Sports Stadium, Hargeisa",
          features: ["Live Sports", "Food & Drinks", "Merchandise", "Parking", "Family Sections"]
        },
        {
          id: "event-3",
          title: "Art Exhibition",
          description: "Showcase of local artists and contemporary art installations",
          category: "Event Tickets",
          price: "$15",
          rating: 4.4,
          image: "🎨",
          location: "Art Gallery, Hargeisa",
          features: ["Art Exhibits", "Artist Talks", "Workshops", "Refreshments", "Guided Tours"]
        },
        {
          id: "event-4",
          title: "Food Festival",
          description: "Culinary celebration featuring local and international cuisine",
          category: "Event Tickets",
          price: "$25",
          rating: 4.7,
          image: "🍽️",
          location: "City Square, Hargeisa",
          features: ["Food Tasting", "Cooking Demos", "Live Music", "Family Activities", "Local Vendors"]
        }
      ];
      setEvents(mockEvents);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All Events" || 
                             event.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                             event.features.some(feature => 
                               feature.toLowerCase().includes(selectedCategory.toLowerCase())
                             );
      
      return matchesSearch && matchesCategory;
    });

    // Sort events
    switch (sortBy) {
      case "price":
        filtered.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "date":
        // For now, sort by popularity/rating as a proxy for date
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [events, searchTerm, selectedCategory, sortBy]);

  const handleBookEvent = (event: Service) => {
    setSelectedEvent(event);
    setIsBookingFormOpen(true);
  };

  const handleBookingSubmit = async (bookingData: BookingFormData) => {
    try {
      console.log('Booking event:', selectedEvent?.title, bookingData);
      
      if (!selectedEvent) {
              // Show error message (you can implement a toast or modal here)
      console.log('No event selected. Please try again.');
      return;
      }

      // Send booking to backend
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedEvent.id,
          serviceType: 'event',
          customerName: bookingData.name,
          customerEmail: bookingData.email,
          customerPhone: bookingData.phone,
          bookingDate: new Date().toISOString(),
          travelDate: bookingData.date ? new Date(bookingData.date).toISOString() : new Date().toISOString(),
          numberOfPeople: parseInt(bookingData.guests),
          totalAmount: parseFloat(bookingData.calculatedTotal || "0"), // Use calculated total from form
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: bookingData.paymentMethod,
          transactionId: bookingData.transactionId || null,
          notes: `Event: ${selectedEvent.title}\nSpecial Requests: ${bookingData.specialRequests || 'None'}\nPayment Method: ${bookingData.paymentMethod}${bookingData.transactionId ? `\nTransaction ID: ${bookingData.transactionId}` : ''}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Backend success response:', result);
      
      setIsBookingFormOpen(false);
      setSelectedEvent(null);
      
      // Show success message (you can implement a toast or modal here)
      console.log('Event booking submitted successfully! Your booking has been created and is now pending confirmation.');
    } catch (error) {
      console.error('Error booking event:', error);
      // Show error message (you can implement a toast or modal here)
      console.log(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getEventIcon = (eventTitle: string) => {
    if (eventTitle.toLowerCase().includes('music') || eventTitle.toLowerCase().includes('concert')) {
      return <MusicIcon className="w-6 h-6" />;
    } else if (eventTitle.toLowerCase().includes('sport') || eventTitle.toLowerCase().includes('game')) {
      return <GamepadIcon className="w-6 h-6" />;
    } else if (eventTitle.toLowerCase().includes('art') || eventTitle.toLowerCase().includes('exhibition')) {
      return <PaletteIcon className="w-6 h-6" />;
    } else if (eventTitle.toLowerCase().includes('food') || eventTitle.toLowerCase().includes('dining')) {
      return <UtensilsIcon className="w-6 h-6" />;
    }
    return <TicketIcon className="w-6 h-6" />;
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
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">Loading amazing events...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <TicketIcon className="w-12 h-12 text-purple-600 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Amazing Events
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and book the most exciting events in Hargeisa. From music festivals to sports championships, 
              there's something for everyone!
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="text-center mb-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={loadEvents} variant="outline" className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find more events.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Events");
              }} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Found
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/services')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  View All Services
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-3xl">{event.image}</div>
                          <div>
                            <Badge variant="secondary" className="text-xs">
                              {getEventCategory(event)}
                            </Badge>
                            {event.isPopular && (
                              <Badge variant="default" className="ml-2 text-xs">
                                <SparklesIcon className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <HeartIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                          <span>{event.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-primary">{event.price}</div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <UsersIcon className="w-4 h-4" />
                          <span>Family Friendly</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {event.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleBookEvent(event)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <TicketIcon className="w-4 h-4 mr-2" />
                        Book Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Booking Form Modal */}
      {isBookingFormOpen && selectedEvent && (
        <BookingForm
          isOpen={isBookingFormOpen}
          onClose={() => setIsBookingFormOpen(false)}
          onSubmit={handleBookingSubmit}
          service={selectedEvent}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Events;
