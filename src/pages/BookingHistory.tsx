import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  FilterIcon
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface Booking {
  id: string;
  type: 'deal' | 'service';
  title: string;
  description: string;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  bookingDate: string;
  serviceDate: string;
  location: string;
  bookingCode: string;
  image: string;
  category: string;
  rating?: number;
  review?: string;
}

const BookingHistory = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when component mounts
  useScrollToTop();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Load bookings from database
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call to get user bookings
        // const userBookings = await BookingsApiService.getUserBookings(user.id);
        // setBookings(userBookings);
        
        // For now, show empty state
        setBookings([]);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [user, navigate]);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <AlertCircleIcon className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getFilteredCount = (status: 'all' | 'upcoming' | 'completed' | 'cancelled') => {
    if (status === 'all') return bookings.length;
    return bookings.filter(booking => booking.status === status).length;
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your booking history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-6">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking History</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track all your bookings and reservations in one place
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <FilterIcon className="w-5 h-5 text-gray-500" />
              <Select value={filter} onValueChange={(value: 'all' | 'upcoming' | 'completed' | 'cancelled') => setFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings ({getFilteredCount('all')})</SelectItem>
                  <SelectItem value="upcoming">Upcoming ({getFilteredCount('upcoming')})</SelectItem>
                  <SelectItem value="completed">Completed ({getFilteredCount('completed')})</SelectItem>
                  <SelectItem value="cancelled">Cancelled ({getFilteredCount('cancelled')})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-6">
              Start exploring deals and services to make your first booking!
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/deals')} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                Browse Deals
              </Button>
              <Button onClick={() => navigate('/services')} variant="outline">
                Explore Services
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative">
                    {/* Booking Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-6xl">
                      {booking.image}
                    </div>
                    
                    {/* Status Badge */}
                    <Badge className={`absolute top-4 left-4 ${getStatusColor(booking.status)} text-white`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        {getStatusLabel(booking.status)}
                      </div>
                    </Badge>
                    
                    {/* Type Badge */}
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      {booking.type === 'deal' ? 'Deal' : 'Service'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Category */}
                  <Badge variant="outline" className="mb-3 text-xs">
                    {booking.category}
                  </Badge>
                  
                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {booking.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {booking.description}
                  </p>
                  
                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {booking.location}
                  </div>
                  
                  {/* Rating */}
                  {booking.rating && (
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(booking.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {booking.rating}
                      </span>
                    </div>
                  )}
                  
                  {/* Review */}
                  {booking.review && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{booking.review}"</p>
                    </div>
                  )}
                  
                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Booked: {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Service: {new Date(booking.serviceDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    ${booking.price}
                  </div>
                  
                  {/* Booking Code */}
                  <div className="text-sm text-gray-500 mb-4">
                    Booking Code: <span className="font-mono font-semibold">{booking.bookingCode}</span>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={() => navigate(`/${booking.type === 'deal' ? 'deals' : 'services'}/${booking.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
