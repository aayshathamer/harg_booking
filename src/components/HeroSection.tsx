import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, MapPinIcon, CalendarIcon, UsersIcon, StarIcon, ArrowRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    serviceType: "",
    location: "",
    date: "",
    guests: ""
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.serviceType) params.append("category", searchData.serviceType);
    if (searchData.location) params.append("location", searchData.location);
    if (searchData.date) params.append("date", searchData.date);
    if (searchData.guests) params.append("guests", searchData.guests);
    
    navigate(`/services?${params.toString()}`);
  };

  const serviceTypes = [
    { value: "Hotels & Stays", label: "🏨 Hotels & Stays" },
    { value: "Car Rentals", label: "🚗 Car Rentals" },
    { value: "Event Tickets", label: "🎫 Event Tickets" },
    { value: "Activities", label: "🎯 Activities" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Clean Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 py-16 text-center max-w-5xl">
        {/* Welcome Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium border border-white/20">
            <StarIcon className="w-4 h-4" />
            Welcome to Hargeisa Vibes
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight text-white">
          Discover & Book
          <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
            Amazing Experiences
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          From luxury hotels to thrilling adventures, find and book the best services in Hargeisa.
        </p>

        {/* Main Search Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left block">Service Type</label>
              <Select value={searchData.serviceType} onValueChange={(value) => setSearchData(prev => ({ ...prev, serviceType: value }))}>
                <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
                  <SelectValue placeholder="Choose service..." />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left block">Location</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <Input 
                  placeholder="Where to go?"
                  value={searchData.location}
                  onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  className="h-12 pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left block">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <Input 
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData(prev => ({ ...prev, date: e.target.value }))}
                  className="h-12 pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left block">Guests</label>
              <div className="relative">
                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <Input 
                  placeholder="How many?"
                  value={searchData.guests}
                  onChange={(e) => setSearchData(prev => ({ ...prev, guests: e.target.value }))}
                  className="h-12 pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8">
            <Button 
              onClick={handleSearch}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <SearchIcon className="w-5 h-5 mr-2" />
              Search & Book Now
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {serviceTypes.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              onClick={() => navigate(`/services?category=${encodeURIComponent(type.value)}`)}
              className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white hover:bg-white/20 dark:hover:bg-gray-700/20 hover:border-white/30 dark:hover:border-gray-500/30 px-6 py-3 rounded-xl transition-all duration-300"
            >
              <span className="text-lg mr-2">{type.label.split(' ')[0]}</span>
              <span className="font-medium">{type.label.split(' ').slice(1).join(' ')}</span>
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Instant Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Best Prices</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;