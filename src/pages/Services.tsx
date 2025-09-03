import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, FilterIcon, StarIcon, MapPinIcon, SparklesIcon, ArrowLeftIcon } from "lucide-react";
import { type Service } from "@/lib/servicesApi";

// Define categories for filtering
const categories = [
  "All Services",
  "Accommodation",
  "Transportation", 
  "Food & Dining",
  "Activities & Tours",
  "Shopping",
  "Entertainment",
  "Wellness & Spa",
  "Business Services",
  "Event Tickets"
];
import { ServicesApiService } from "@/lib/servicesApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm, { type BookingFormData } from "@/components/BookingForm";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [sortBy, setSortBy] = useState("name");
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Scroll to top when component mounts
  useScrollToTop();

  // Handle URL parameters for category filtering
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    console.log('🔍 URL category parameter:', categoryParam);
    console.log('🔍 Available categories:', categories);
    
    if (categoryParam && categories.includes(categoryParam)) {
      console.log('✅ Setting selected category to:', categoryParam);
      setSelectedCategory(categoryParam);
    } else {
      // If no category parameter, set to "All Services"
      console.log('📋 No category parameter, setting to All Services');
      setSelectedCategory("All Services");
    }
  }, [searchParams, categories]);

  // Load services from database
  const loadServices = useCallback(async () => {
    try {
      console.log('🚀 loadServices called with category:', selectedCategory);
      setIsLoading(true);
      setError(null);
      
      let servicesData: Service[];
      if (selectedCategory === "All Services") {
        console.log('📋 Loading all services');
        servicesData = await ServicesApiService.getAllServices();
      } else {
        console.log('🎯 Loading services for category:', selectedCategory);
        servicesData = await ServicesApiService.getServicesByCategory(selectedCategory);
      }
      
      console.log('✅ Loaded services:', servicesData.length);
      console.log('📊 Services data:', servicesData);
      setServices(servicesData);
    } catch (err) {
      console.error('❌ Error loading services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  // Load services when component mounts or category changes
  useEffect(() => {
    console.log('🔄 useEffect triggered - selectedCategory:', selectedCategory);
    if (selectedCategory) {
      loadServices();
    }
  }, [selectedCategory, loadServices]);

  const filteredServices = useMemo(() => {
    let filtered = services;
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort services
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "name":
      default:
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, services]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const handleBookNow = (service: Service) => {
    setSelectedService(service);
    setIsBookingFormOpen(true);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      console.log('Booking submitted:', bookingData);
      console.log('Selected service:', selectedService);
      
      if (!selectedService) {
              // Show error message (you can implement a toast or modal here)
      console.log('No service selected. Please try again.');
      return;
      }

      // Send booking to backend
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceType: 'service',
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
          notes: `Service: ${selectedService.title}\nSpecial Requests: ${bookingData.specialRequests || 'None'}\nPayment Method: ${bookingData.paymentMethod}${bookingData.transactionId ? `\nTransaction ID: ${bookingData.transactionId}` : ''}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Backend success response:', result);
      
      // Close the booking form
      setIsBookingFormOpen(false);
      setSelectedService(null);
      
      // Show success message
              // Show success message (you can implement a toast or modal here)
        console.log('Booking submitted successfully! Your booking has been created and is now pending confirmation.');
      } catch (error) {
        console.error('Error creating booking:', error);
        // Show error message (you can implement a toast or modal here)
        console.log(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/80 to-accent/10">
      <Header />
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-center flex-1">
              <SparklesIcon className="inline w-6 h-6 text-blue-500 mr-2" />
              Browse All Services
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search services, locations, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5 text-gray-600" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center text-gray-600">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Loading services...
              </div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              `Showing ${filteredServices.length} of ${services.length} services`
            )}
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing services...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Services</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={loadServices} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{service.image}</div>
                    <div className="flex items-center gap-1">
                      {renderStars(service.rating)}
                      <span className="text-sm text-gray-600 ml-1">({service.rating})</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    {service.location}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  
                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {service.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                      {service.price}
                    </div>
                                         <Button
                       size="sm"
                       className="bg-blue-600 hover:bg-blue-700 text-white"
                       onClick={() => handleBookNow(service)}
                     >
                       Book Now
                     </Button>
                  </div>

                  {/* Popular/New Badges */}
                  <div className="flex gap-2 mt-3">
                    {service.isPopular && (
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                        Popular
                      </Badge>
                    )}
                    {service.isNew && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        New
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Services");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Booking Form */}
      {selectedService && (
        <BookingForm
          serviceTitle={selectedService.title}
          servicePrice={String(selectedService.price)}
          serviceImage={selectedService.image}
          isOpen={isBookingFormOpen}
          onClose={() => {
            setIsBookingFormOpen(false);
            setSelectedService(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Services;
