import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  SearchIcon, 
  FilterIcon, 
  Flame, 
  SparklesIcon, 
  MapPinIcon, 
  StarIcon, 
  ClockIcon, 
  HeartIcon, 
  ArrowRightIcon,
  TrendingUpIcon,
  ZapIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  CheckCircleIcon
} from "lucide-react";
import { DealsApiService } from "@/lib/dealsApi";
import { toast } from "sonner";
import { type Deal } from "@/lib/dealsApi";
import { useScrollToTop } from "@/hooks/useScrollToTop";

// Local Booking interface for deals
interface DealBooking {
  dealId: string;
  dealTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredDate: string;
  numberOfGuests: number;
  specialRequests: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Deals");
  const [sortBy, setSortBy] = useState("discount");
  const [showHotOnly, setShowHotOnly] = useState(false);
  const [showAIOnly, setShowAIOnly] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: "1",
    specialRequests: "",
    paymentMethod: "mobile_money",
    transactionId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    mobileMoneyNumber: "",
    bankAccountNumber: "",
    bankName: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<DealBooking | null>(null);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useScrollToTop();

  const categories = [
    "All Deals",
    "Hotels",
    "Cars",
    "Activities",
    "Events",
    "Food",
    "Shopping"
  ];

  const loadDeals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let dealsData: Deal[] = [];
      
        if (selectedCategory === "All Deals") {
          dealsData = await DealsApiService.getAllDeals();
        } else {
          dealsData = await DealsApiService.getDealsByCategory(selectedCategory);
      }
      
      console.log('Setting deals:', dealsData);
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading deals:', err);
        setError('Failed to load deals. Please try again.');
        setDeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load deals when component mounts
  useEffect(() => {
    loadDeals();
  }, []);

  // Reload deals when category changes
  useEffect(() => {
    if (!isLoading) {
      loadDeals();
    }
  }, [selectedCategory]);

  const filteredDeals = useMemo(() => {
    if (!deals || deals.length === 0) return [];
    
    let filtered = deals;
    
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showHotOnly) {
      filtered = filtered.filter(deal => deal.isHot);
    }

    if (showAIOnly) {
      filtered = filtered.filter(deal => deal.isAiRecommended);
    }

    // Sort deals
    switch (sortBy) {
      case "discount":
        filtered = [...filtered].sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "expiring":
        filtered = [...filtered].sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime());
        break;
      default:
        break;
    }

    return filtered;
  }, [deals, searchTerm, showHotOnly, showAIOnly, sortBy]);

  const getDiscountColor = (discount: number) => {
    if (discount >= 50) return "bg-gradient-to-r from-red-500 to-red-600";
    if (discount >= 30) return "bg-gradient-to-r from-orange-500 to-orange-600";
    if (discount >= 20) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-green-500 to-green-600";
  };

  const handleBookDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;

    // Validate payment method requirements
    let paymentValidationError = "";
    
    if (bookingForm.paymentMethod === "mobile_money") {
      if (!bookingForm.mobileMoneyNumber.trim()) {
        paymentValidationError = "Mobile Money Number is required";
      }
      if (!bookingForm.transactionId.trim()) {
        paymentValidationError = "Transaction ID is required for Mobile Money payments";
      }
    } else if (bookingForm.paymentMethod === "credit_card") {
      if (!bookingForm.cardNumber.trim()) {
        paymentValidationError = "Card Number is required";
      }
      if (!bookingForm.cardExpiry.trim()) {
        paymentValidationError = "Card Expiry is required";
      }
      if (!bookingForm.cardCvv.trim()) {
        paymentValidationError = "CVV is required";
      }
    } else if (bookingForm.paymentMethod === "bank_transfer") {
      if (!bookingForm.bankAccountNumber.trim()) {
        paymentValidationError = "Bank Account Number is required";
      }
      if (!bookingForm.bankName.trim()) {
        paymentValidationError = "Bank Name is required";
      }
    }

    if (paymentValidationError) {
              // Show error message (you can implement a toast or modal here)
        console.log(paymentValidationError);
        return;
    }

    setIsSubmitting(true);
    try {
      // Ensure serviceId has the correct format for deals
      const serviceId = selectedDeal.id.startsWith('deal-') ? selectedDeal.id : `deal-${selectedDeal.id}`;
      
      console.log('Submitting booking with data:', {
        serviceId,
        selectedDeal: selectedDeal,
        bookingForm: bookingForm
      });

      // Create the booking data
      const bookingData: DealBooking = {
        dealId: selectedDeal.id,
        dealTitle: selectedDeal.title,
        customerName: bookingForm.name,
        customerEmail: bookingForm.email,
        customerPhone: bookingForm.phone,
        preferredDate: bookingForm.date,
        numberOfGuests: parseInt(bookingForm.guests),
        specialRequests: bookingForm.specialRequests,
        totalAmount: selectedDeal.price,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      // Send booking to backend
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: serviceId,
          serviceType: 'deal',
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          customerPhone: bookingForm.phone,
          bookingDate: new Date().toISOString(),
          travelDate: bookingForm.date,
          numberOfPeople: parseInt(bookingForm.guests),
          totalAmount: selectedDeal.price,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: bookingForm.paymentMethod,
          transactionId: bookingForm.transactionId || null,
          notes: `Deal: ${selectedDeal.title}\nSpecial Requests: ${bookingForm.specialRequests || 'None'}\nPayment Method: ${bookingForm.paymentMethod}${bookingForm.transactionId ? `\nTransaction ID: ${bookingForm.transactionId}` : ''}`
        }),
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Backend success response:', result);
      
      // Set the created booking for success modal
      setCreatedBooking(bookingData);
      
      // Close booking modal and show success modal
      setIsBookingModalOpen(false);
      setIsSuccessModalOpen(true);
      
      // Success toast
      toast.success("Booking completed!", {
        description: `${selectedDeal.title} on ${bookingForm.date} for ${bookingForm.guests} guest(s). A confirmation was sent to ${bookingForm.email}.`,
        duration: 6000
      });
      
      // Reset form
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        guests: "1",
        specialRequests: "",
        paymentMethod: "mobile_money",
        transactionId: "",
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        mobileMoneyNumber: "",
        bankAccountNumber: "",
        bankName: ""
      });
      setSelectedDeal(null);
      
    } catch (error) {
      console.error('Booking error:', error);
              // Show error message (you can implement a toast or modal here)
        console.log(`Failed to submit booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear payment fields when payment method changes
    if (field === "paymentMethod") {
      setBookingForm(prev => ({
        ...prev,
        transactionId: "",
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        mobileMoneyNumber: "",
        bankAccountNumber: "",
        bankName: ""
      }));
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setCreatedBooking(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Discovering Amazing Deals</h2>
            <p className="text-lg text-gray-600">Searching through our exclusive offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <ZapIcon className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">Limited Time Offers</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Amazing Deals
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Discover incredible offers on hotels, activities, and experiences in Hargeisa
            </p>
            <div className="flex items-center justify-center gap-4 mt-8 text-blue-100">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-300" />
                <span>Hot Deals</span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-yellow-300" />
                <span>AI Recommended</span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-green-300" />
                <span>Best Prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Enhanced Search */}
            <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <Input
                placeholder="Search amazing deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
            />
          </div>

            {/* Enhanced Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl">
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

            {/* Enhanced Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl">
                <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="discount">🔥 Highest Discount</SelectItem>
                <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                <SelectItem value="price-high">💰 Price: High to Low</SelectItem>
                <SelectItem value="rating">⭐ Highest Rating</SelectItem>
                <SelectItem value="expiring">⏰ Expiring Soon</SelectItem>
                </SelectContent>
              </Select>

            {/* Enhanced Quick Filters */}
            <div className="flex gap-3">
            <Button
              variant={showHotOnly ? "default" : "outline"}
                size="lg"
              onClick={() => setShowHotOnly(!showHotOnly)}
                className={`h-12 px-6 rounded-xl font-semibold transition-all ${
                  showHotOnly 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200' 
                    : 'border-2 border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <Flame className={`w-5 h-5 mr-2 ${showHotOnly ? 'text-white' : 'text-red-500'}`} />
                Hot
            </Button>
            <Button
              variant={showAIOnly ? "default" : "outline"}
                size="lg"
              onClick={() => setShowAIOnly(!showAIOnly)}
                className={`h-12 px-6 rounded-xl font-semibold transition-all ${
                  showAIOnly 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-200' 
                    : 'border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <SparklesIcon className={`w-5 h-5 mr-2 ${showAIOnly ? 'text-white' : 'text-purple-500'}`} />
                AI
            </Button>
            </div>
          </div>

          {/* Enhanced Active Filters Display */}
          {(showHotOnly || showAIOnly || searchTerm) && (
            <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              {showHotOnly && (
                <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200 px-4 py-2 rounded-full font-semibold">
                  🔥 Hot Deals Only
                </Badge>
              )}
              {showAIOnly && (
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200 px-4 py-2 rounded-full font-semibold">
                  ✨ AI Recommended
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 px-4 py-2 rounded-full font-semibold">
                  🔍 "{searchTerm}"
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Results Count and Clear Filters */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-100">
              <p className="text-gray-700 font-semibold">
                <span className="text-blue-600 font-bold text-xl">{filteredDeals.length}</span> 
                {filteredDeals.length === 1 ? ' deal' : ' deals'} found
              </p>
            </div>
            {(searchTerm || selectedCategory !== "All Deals" || showHotOnly || showAIOnly) && (
            <Button
              variant="outline"
              onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Deals");
                  setSortBy("discount");
                setShowHotOnly(false);
                setShowAIOnly(false);
              }}
                className="h-11 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium"
            >
                Clear All Filters
            </Button>
          )}
        </div>
        </div>

        {/* Enhanced Error State */}
        {error && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-red-100">
            <div className="text-8xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Deals</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">{error}</p>
            <Button onClick={loadDeals} variant="outline" size="lg" className="px-8 py-3 rounded-xl">
              Try Again
            </Button>
          </div>
        )}

        {/* Enhanced No Results */}
        {!error && filteredDeals.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-8xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Deals Found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {searchTerm || selectedCategory !== "All Deals" || showHotOnly || showAIOnly
                ? "Try adjusting your filters or search terms to find amazing offers"
                : "Check back later for incredible deals and exclusive offers!"
              }
            </p>
            {(searchTerm || selectedCategory !== "All Deals" || showHotOnly || showAIOnly) && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Deals");
                  setSortBy("discount");
                  setShowHotOnly(false);
                  setShowAIOnly(false);
                }}
                variant="outline"
                size="lg"
                className="px-8 py-3 rounded-xl"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Enhanced Deals Grid */}
        {!error && filteredDeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDeals.map((deal) => (
              <Card
                key={deal.id}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:scale-105 rounded-2xl"
              >
                <CardHeader className="p-0">
                  <div className="relative">
                    {/* Enhanced Deal Image */}
                    <div className="h-56 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500">
                      {deal.image}
                    </div>
                    
                    {/* Enhanced Discount Badge */}
                    <div className={`absolute top-4 left-4 ${getDiscountColor(deal.discountPercentage)} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm`}>
                      {deal.discountPercentage}% OFF
                </div>

                    {/* Enhanced Special Badges */}
                    {deal.isHot && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                        🔥 HOT
                  </div>
                )}
                    
                    {deal.isAiRecommended && (
                      <div className="absolute top-16 right-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ✨ AI
                  </div>
                )}

                    {/* Enhanced Time Left */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2">
                        <ClockIcon className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium">{deal.timeLeft}</span>
                      </div>
                  </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Enhanced Category */}
                  <Badge variant="outline" className="mb-4 text-xs px-3 py-1 rounded-full border-2 border-blue-200 text-blue-700 bg-blue-50 font-medium">
                    {deal.category}
                  </Badge>
                   
                  {/* Enhanced Title */}
                  <h3 className="font-bold text-xl mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                    {deal.title}
                  </h3>
                   
                  {/* Enhanced Location */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPinIcon className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">{deal.location}</span>
                  </div>
                   
                  {/* Enhanced Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(deal.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-3 font-medium">
                      {deal.rating} ({deal.reviewsCount})
                    </span>
                  </div>

                  {/* Enhanced Features */}
                  {deal.features && deal.features.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {deal.features.slice(0, 2).map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                          {feature}
                        </Badge>
                      ))}
                        {deal.features.length > 2 && (
                          <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-2 border-gray-200">
                            +{deal.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  )}
                   
                  {/* Enhanced Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-blue-600">${deal.price}</span>
                        <span className="text-lg text-gray-400 line-through font-medium">
                          ${deal.originalPrice}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Save ${deal.originalPrice - deal.price}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => handleBookDeal(deal)}
                    >
                      Book Now
                      <CalendarIcon className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Book Your Deal
            </DialogTitle>
            <DialogDescription>
              Please fill out the form to book this amazing deal.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeal && (
            <div className="space-y-6">
              {/* Deal Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-3xl">
                    {selectedDeal.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedDeal.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {selectedDeal.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        {selectedDeal.rating} ({selectedDeal.reviewsCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-2xl font-bold text-blue-600">${selectedDeal.price}</span>
                      <span className="text-lg text-gray-400 line-through">${selectedDeal.originalPrice}</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Save ${selectedDeal.originalPrice - selectedDeal.price}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      <UserIcon className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={bookingForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      <MailIcon className="w-4 h-4 inline mr-2" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      <PhoneIcon className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                      <CalendarIcon className="w-4 h-4 inline mr-2" />
                      Preferred Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests" className="text-sm font-medium text-gray-700">
                      Number of Guests
                    </Label>
                    <Select value={bookingForm.guests} onValueChange={(value) => handleInputChange("guests", value)}>
                      <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg">
                        <SelectValue placeholder="Select guests" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                      Payment Method *
                    </Label>
                    <Select value={bookingForm.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                      <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_money" className="flex items-center gap-2">
                          <span className="text-lg">📱</span>
                          <span>Mobile Money</span>
                        </SelectItem>
                        <SelectItem value="cash" className="flex items-center gap-2">
                          <span className="text-lg">💵</span>
                          <span>Cash</span>
                        </SelectItem>
                        <SelectItem value="credit_card" className="flex items-center gap-2">
                          <span className="text-lg">💳</span>
                          <span>Credit Card</span>
                        </SelectItem>
                        <SelectItem value="bank_transfer" className="flex items-center gap-2">
                          <span className="text-lg">🏦</span>
                          <span>Bank Transfer</span>
                        </SelectItem>
                        <SelectItem value="paypal" className="flex items-center gap-2">
                          <span className="text-lg">💙</span>
                          <span>PayPal</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conditional Payment Fields */}
                {bookingForm.paymentMethod === "mobile_money" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobileMoneyNumber" className="text-sm font-medium text-gray-700">
                        Mobile Money Number *
                      </Label>
                      <Input
                        id="mobileMoneyNumber"
                        type="tel"
                        required
                        value={bookingForm.mobileMoneyNumber}
                        onChange={(e) => handleInputChange("mobileMoneyNumber", e.target.value)}
                        placeholder="Enter your mobile money number"
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700">
                        Transaction ID *
                      </Label>
                      <Input
                        id="transactionId"
                        type="text"
                        required
                        value={bookingForm.transactionId}
                        onChange={(e) => handleInputChange("transactionId", e.target.value)}
                        placeholder="Enter your transaction ID"
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {bookingForm.paymentMethod === "credit_card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                        Card Number *
                      </Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        required
                        value={bookingForm.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                        placeholder="Enter your card number"
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry" className="text-sm font-medium text-gray-700">
                        Card Expiry *
                      </Label>
                      <Input
                        id="cardExpiry"
                        type="text"
                        required
                        value={bookingForm.cardExpiry}
                        onChange={(e) => handleInputChange("cardExpiry", e.target.value)}
                        placeholder="MM/YY"
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv" className="text-sm font-medium text-gray-700">
                        CVV *
                      </Label>
                      <Input
                        id="cardCvv"
                        type="text"
                        required
                        value={bookingForm.cardCvv}
                        onChange={(e) => handleInputChange("cardCvv", e.target.value)}
                        placeholder="Enter CVV"
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                      />
                    </div>
                  </div>
                )}
                {bookingForm.paymentMethod === "bank_transfer" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber" className="text-sm font-medium text-gray-700">
                        Bank Account Number *
                      </Label>
                      <Input
                        id="bankAccountNumber"
                        type="text"
                        required
                        value={bookingForm.bankAccountNumber}
                        onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                        placeholder="Enter your bank account number"
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                        Bank Name *
                      </Label>
                      <Input
                        id="bankName"
                        type="text"
                        required
                        value={bookingForm.bankName}
                        onChange={(e) => handleInputChange("bankName", e.target.value)}
                        placeholder="Enter your bank name"
                        className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💡</span>
                    <h4 className="font-semibold text-gray-800">Payment Requirements</h4>
                  </div>
                  {bookingForm.paymentMethod === "mobile_money" && (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>• <strong>Mobile Money Number:</strong> Your phone number registered with mobile money service</p>
                      <p>• <strong>Transaction ID:</strong> Reference number from your payment (required for confirmation)</p>
                    </div>
                  )}
                  {bookingForm.paymentMethod === "cash" && (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>• <strong>Cash Payment:</strong> Pay in person when you arrive</p>
                      <p>• <strong>No additional details required</strong></p>
                    </div>
                  )}
                  {bookingForm.paymentMethod === "credit_card" && (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>• <strong>Card Number:</strong> Your credit/debit card number</p>
                      <p>• <strong>Expiry Date:</strong> Card expiration date (MM/YY format)</p>
                      <p>• <strong>CVV:</strong> 3-digit security code on the back of your card</p>
                    </div>
                  )}
                  {bookingForm.paymentMethod === "bank_transfer" && (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>• <strong>Bank Account Number:</strong> Your bank account number</p>
                      <p>• <strong>Bank Name:</strong> Name of your bank</p>
                      <p>• <strong>Transfer Reference:</strong> Use your booking ID as reference</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests" className="text-sm font-medium text-gray-700">
                    Special Requests
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={bookingForm.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    placeholder="Any special requests or requirements..."
                    className="min-h-[100px] border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg resize-none"
                  />
                </div>

                {/* Total Price */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Price:</span>
                    <span className="text-2xl text-blue-600">${selectedDeal.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    * Final price may vary based on selected options and availability
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
            <Button
                    type="button"
              variant="outline"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 h-12 border-2 border-gray-200 hover:border-gray-300 rounded-lg font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Confirm Booking
                      </>
                    )}
            </Button>
                </div>
              </form>
          </div>
        )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
              Booking Confirmed! 🎉
            </DialogTitle>
            <DialogDescription>
              Your booking has been successfully submitted and is now pending confirmation.
            </DialogDescription>
          </DialogHeader>
          
          {createdBooking && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  {createdBooking.dealTitle}
                </h3>
                <p className="text-gray-600">
                  Your booking has been successfully submitted and is now pending confirmation.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium">{createdBooking.dealId.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(createdBooking.preferredDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{createdBooking.numberOfGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-green-600">${createdBooking.totalAmount}</span>
                </div>
          </div>
                
                <p className="text-sm text-gray-500">
                  We'll send you a confirmation email shortly. You can also check your booking status in your account.
                </p>
      </div>
      
              <Button
                onClick={closeSuccessModal}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold"
              >
                Continue Browsing
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deals;
