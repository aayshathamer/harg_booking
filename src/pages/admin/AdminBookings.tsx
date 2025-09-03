import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  MoreHorizontal,
  Download,
  RefreshCw,
  AlertCircle,
  Trash2,
  Users,
  TrendingUp,
  Clock,
  CheckSquare,
  XSquare,
  FileText,
  BarChart3,
  FilterX,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Star,
  Edit3,
  Send,
  MessageSquare,
  PhoneCall,
  Mail as MailIcon,
  Table as TableIcon,
  X,
  User as UserIcon
} from "lucide-react";

// Enhanced status options with colors and descriptions
const bookingStatuses = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Awaiting confirmation' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', description: 'Booking confirmed' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', description: 'Service completed' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', description: 'Booking cancelled' },
  'no-show': { label: 'No Show', color: 'bg-gray-100 text-gray-800 border-gray-200', description: 'Customer did not show up' }
};

const paymentStatuses = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Payment not yet received' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200', description: 'Payment confirmed' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 border-red-200', description: 'Payment failed' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800 border-purple-200', description: 'Payment refunded' },
  partial: { label: 'Partial', color: 'bg-orange-100 text-orange-800 border-orange-200', description: 'Partial payment received' }
};

// Enhanced Booking interface
interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceTitle: string;
  serviceId: string;
  serviceImage?: string;
  bookingDate: string;
  travelDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

import { BookingsApiService } from "@/lib/bookingsApi";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [quickActionBooking, setQuickActionBooking] = useState<Booking | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState<{
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    callback?: () => void;
    details?: any;
  } | null>(null);
  const navigate = useNavigate();

  // Load bookings from database
  useEffect(() => {
    loadBookings();
    loadStats();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const bookingsData = await BookingsApiService.getAllBookings();
      console.log('Loaded bookings:', bookingsData);
      
      // Debug: Log individual booking details
      bookingsData.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`, {
          id: booking.id,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          customerName: booking.customerName,
          serviceTitle: booking.serviceTitle
        });
      });
      
      setBookings(bookingsData);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error('Error loading bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await BookingsApiService.getBookingStatistics();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Enhanced filtering and sorting
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.serviceTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
    const matchesPaymentStatus = selectedPaymentStatus === "all" || booking.paymentStatus === selectedPaymentStatus;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
        break;
      case 'amount':
        comparison = b.totalAmount - a.totalAmount;
        break;
      case 'customer':
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  // Enhanced action handlers
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleQuickAction = (booking: Booking) => {
    setQuickActionBooking(booking);
    setIsQuickActionsOpen(true);
  };

  const handleEditNotes = (booking: Booking) => {
    setQuickActionBooking(booking);
    setEditingNotes(booking.notes || '');
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!quickActionBooking) return;
    
    try {
      // Update notes in the backend
      await BookingsApiService.updateBooking(quickActionBooking.id, { notes: editingNotes });
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === quickActionBooking.id 
          ? { ...booking, notes: editingNotes }
          : booking
      ));
      
      setIsNotesModalOpen(false);
      setQuickActionBooking(null);
      setEditingNotes("");
      
      showConfirmation('success', 'Notes Updated! ✨', 'Booking notes have been successfully updated.');
    } catch (error) {
      console.error('Error updating notes:', error);
      showConfirmation('error', 'Update Failed ❌', 'Failed to update notes. Please try again.');
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    showConfirmation('confirm', 'Confirm Payment 💳', 'Are you sure you want to confirm payment for this booking?', async () => {
      try {
        await BookingsApiService.updatePaymentStatus(bookingId, 'paid');
        await loadBookings();
        await loadStats();
        showConfirmation('success', 'Payment Confirmed! 💳', 'Payment has been successfully confirmed for this booking.');
      } catch (error) {
        console.error('Error confirming payment:', error);
        showConfirmation('error', 'Confirmation Failed ❌', 'Failed to confirm payment. Please try again.');
      }
    });
  };

  const handleProcessRefund = async (bookingId: string) => {
    showConfirmation('confirm', 'Process Refund 💰', 'Are you sure you want to process a refund for this booking?', async () => {
      try {
        await BookingsApiService.updatePaymentStatus(bookingId, 'refunded');
        await loadBookings();
        await loadStats();
        showConfirmation('success', 'Refund Processed! 💰', 'Refund has been successfully processed for this booking.');
      } catch (error) {
        console.error('Error processing refund:', error);
        showConfirmation('error', 'Refund Failed ❌', 'Failed to process refund. Please try again.');
      }
    });
  };

  const handleConfirmBooking = async (bookingId: string) => {
    showConfirmation('confirm', 'Confirm Booking ✅', 'Are you sure you want to confirm this booking?', async () => {
      try {
        await BookingsApiService.updateBookingStatus(bookingId, 'confirmed');
        await loadBookings();
        await loadStats();
        showConfirmation('success', 'Booking Confirmed! ✅', 'Booking has been successfully confirmed.');
      } catch (error) {
        console.error('Error confirming booking:', error);
        showConfirmation('error', 'Confirmation Failed ❌', 'Failed to confirm booking. Please try again.');
      }
    });
  };

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (reason !== null) {
      try {
        await BookingsApiService.updateBookingStatus(bookingId, 'cancelled', reason.trim() || undefined);
        await loadBookings();
        await loadStats();
        
        if (reason.trim()) {
          showConfirmation('success', 'Booking Cancelled! 🚫', `Booking has been successfully cancelled. Reason: ${reason}`);
        } else {
          showConfirmation('success', 'Booking Cancelled! 🚫', 'Booking has been successfully cancelled.');
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        showConfirmation('error', 'Cancellation Failed ❌', 'Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    showConfirmation('confirm', 'Delete Booking 🗑️', 'Are you sure you want to permanently delete this cancelled booking? This action cannot be undone.', async () => {
      try {
        await BookingsApiService.deleteBooking(bookingId);
        await loadBookings();
        await loadStats();
        showConfirmation('success', 'Booking Deleted! 🗑️', 'Booking has been permanently deleted.');
      } catch (error) {
        console.error('Error deleting booking:', error);
        showConfirmation('error', 'Deletion Failed ❌', 'Failed to delete booking. Please try again.');
      }
    });
  };

  const handleBulkCancelBookings = async () => {
    if (selectedBookings.length === 0) {
      showConfirmation('error', 'No Bookings Selected ❌', 'Please select bookings to cancel.');
      return;
    }

    const reason = prompt('Please provide a reason for bulk cancellation (optional):');
    if (reason !== null) {
      try {
        const promises = selectedBookings.map(bookingId => 
          BookingsApiService.updateBookingStatus(bookingId, 'cancelled', reason.trim() || undefined)
        );
        
        await Promise.all(promises);
        
        setSelectedBookings([]);
        setShowBulkActions(false);
        await loadBookings();
        await loadStats();
        
        if (reason.trim()) {
          showConfirmation('success', 'Bulk Cancellation Complete! 🚫', `${selectedBookings.length} bookings have been successfully cancelled. Reason: ${reason}`);
        } else {
          showConfirmation('success', 'Bulk Cancellation Complete! 🚫', `${selectedBookings.length} bookings have been successfully cancelled.`);
        }
      } catch (error) {
        console.error('Error cancelling bookings:', error);
        showConfirmation('error', 'Bulk Cancellation Failed ❌', 'Failed to cancel some bookings. Please try again.');
      }
    }
  };

  const handleSelectAllBookings = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.id));
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleUpdateStatus = (bookingId: string, newStatus: string) => {
    console.log("Update status for booking:", bookingId, "to:", newStatus);
  };

  // Enhanced utility functions
  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'mobile_money':
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'bank_transfer':
        return <Banknote className="w-4 h-4 text-purple-600" />;
      case 'cash':
        return <DollarSign className="w-4 h-4 text-gray-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return 'Credit Card';
      case 'mobile_money':
        return 'Mobile Money';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method || 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate additional stats
  const calculateStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    const pendingRevenue = bookings
      .filter(b => b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    const failedRevenue = bookings
      .filter(b => b.paymentStatus === 'failed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
      pendingRevenue,
      failedRevenue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0
    };
  };

  const calculatedStats = calculateStats();

  const showConfirmation = (type: 'success' | 'error' | 'confirm', title: string, message: string, callback?: () => void, details?: any) => {
    setConfirmationMessage({ type, title, message, callback, details });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 Bookings Management</h1>
            <p className="text-blue-100 text-lg">Monitor all bookings, manage payments, and track performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={loadBookings} className="bg-white text-blue-600 hover:bg-blue-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{calculatedStats.total}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="text-xs text-gray-500">100%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${calculatedStats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${calculatedStats.completionRate}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{calculatedStats.completionRate}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">From completed bookings</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">${calculatedStats.pendingRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${calculatedStats.pending > 0 ? Math.round((calculatedStats.pending / calculatedStats.total) * 100) : 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{calculatedStats.pending}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Payments</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${calculatedStats.failedRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${calculatedStats.cancellationRate}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{calculatedStats.cancelled}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Payment issues</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${calculatedStats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">All time</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Confirmed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Confirmed Bookings</p>
                <p className="text-2xl font-bold text-blue-800">{calculatedStats.confirmed}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed Services</p>
                <p className="text-2xl font-bold text-green-800">{calculatedStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Success Rate</p>
                <p className="text-2xl font-bold text-purple-800">{calculatedStats.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Advanced Filters & Search</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                  setSelectedPaymentStatus("all");
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <FilterX className="w-4 h-4 mr-2" />
                Clear All
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="text-xs"
                >
                  <TableIcon className="w-4 h-4 mr-1" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="text-xs"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Cards
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by booking ID, customer name, email, service title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Booking Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(bookingStatuses).map(([status, statusInfo]) => (
                      <SelectItem key={status} value={status} className="flex items-center space-x-2">
                        <Badge className={statusInfo.color + " text-xs"}>{statusInfo.label}</Badge>
                        <span className="text-xs text-gray-500">{statusInfo.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg">
                    <SelectValue placeholder="All Payment Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Statuses</SelectItem>
                    {Object.entries(paymentStatuses).map(([status, statusInfo]) => (
                      <SelectItem key={status} value={status} className="flex items-center space-x-2">
                        <Badge className={statusInfo.color + " text-xs"}>{statusInfo.label}</Badge>
                        <span className="text-xs text-gray-500">{statusInfo.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'customer' | 'status') => setSortBy(value)}>
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Booking Date</SelectItem>
                    <SelectItem value="amount">Total Amount</SelectItem>
                    <SelectItem value="customer">Customer Name</SelectItem>
                    <SelectItem value="status">Booking Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Sort Order</Label>
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg">
                    <SelectValue placeholder="Order..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedStatus !== "all" || selectedPaymentStatus !== "all" || searchTerm) && (
              <div className="flex items-center space-x-2 pt-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Status: {bookingStatuses[selectedStatus as keyof typeof bookingStatuses]?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStatus("all")}
                      className="ml-2 h-4 w-4 p-0 hover:bg-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {selectedPaymentStatus !== "all" && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Payment: {paymentStatuses[selectedPaymentStatus as keyof typeof paymentStatuses]?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPaymentStatus("all")}
                      className="ml-2 h-4 w-4 p-0 hover:bg-green-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Search: "{searchTerm}"
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="ml-2 h-4 w-4 p-0 hover:bg-purple-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{sortedBookings.length}</span> of <span className="font-semibold">{bookings.length}</span> bookings
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBookings.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                      {selectedBookings.length} selected
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkCancelBookings}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBookings([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <p className="text-sm text-blue-600">
                    Bulk actions will apply to all selected bookings
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Bookings Display */}
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Bookings Overview</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {sortedBookings.length} bookings
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>View:</span>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="text-xs"
              >
                <TableIcon className="w-4 h-4 mr-1" />
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="text-xs"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Cards
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Bookings</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={loadBookings} variant="outline">
                Try Again
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                        onChange={handleSelectAllBookings}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Booking ID</TableHead>
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Travel Date</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => handleSelectBooking(booking.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm bg-gray-50 px-3 py-2 rounded">
                        {booking.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {booking.serviceTitle?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{booking.serviceTitle}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{booking.numberOfPeople} people</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{booking.customerName}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{booking.customerEmail}</span>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{booking.customerPhone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(booking.travelDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Booked: {formatDate(booking.bookingDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="font-bold text-xl text-green-700">
                              ${booking.totalAmount?.toLocaleString() || '0'}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              {getPaymentMethodLabel(booking.paymentMethod)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={bookingStatuses[booking.status as keyof typeof bookingStatuses]?.color || 'bg-gray-100 text-gray-800'}>
                            {bookingStatuses[booking.status as keyof typeof bookingStatuses]?.label || booking.status || 'Unknown'}
                          </Badge>
                          {booking.status === 'cancelled' && booking.cancellationReason && (
                            <div className="text-xs text-red-600 max-w-xs truncate" title={booking.cancellationReason}>
                              Reason: {booking.cancellationReason}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={paymentStatuses[booking.paymentStatus as keyof typeof paymentStatuses]?.color || 'bg-gray-100 text-gray-800'}>
                            {paymentStatuses[booking.paymentStatus as keyof typeof paymentStatuses]?.label || booking.paymentStatus || 'Unknown'}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {getPaymentMethodIcon(booking.paymentMethod)}
                            <span>{getPaymentMethodLabel(booking.paymentMethod)}</span>
                          </div>
                          {booking.transactionId && (
                            <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                              {booking.transactionId.slice(-8)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBooking(booking)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditNotes(booking)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Notes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              
                              {booking.status === 'cancelled' ? (
                                <DropdownMenuItem onClick={() => handleDeleteBooking(booking.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Booking
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  {booking.paymentStatus === 'pending' && (
                                    <DropdownMenuItem onClick={() => handleConfirmPayment(booking.id)}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Confirm Payment
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {booking.paymentStatus === 'paid' && (
                                    <DropdownMenuItem onClick={() => handleProcessRefund(booking.id)}>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Process Refund
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {booking.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleConfirmBooking(booking.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Confirm Booking
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel Booking
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  
                                  {booking.status === 'confirmed' && (
                                    <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancel Booking
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sortedBookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setSelectedPaymentStatus("all");
                  }} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Card View
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {booking.serviceTitle?.charAt(0) || 'S'}
                          </div>
                          <Badge className={bookingStatuses[booking.status as keyof typeof bookingStatuses]?.color || 'bg-gray-100 text-gray-800'}>
                            {bookingStatuses[booking.status as keyof typeof bookingStatuses]?.label || booking.status || 'Unknown'}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditNotes(booking)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Notes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{booking.serviceTitle}</h4>
                        <p className="text-sm text-gray-600">{booking.customerName}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Travel Date:</span>
                        <span className="font-medium">{formatDate(booking.travelDate)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Guests:</span>
                        <span className="font-medium">{booking.numberOfPeople}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-bold text-lg text-green-600">${booking.totalAmount?.toLocaleString() || '0'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={paymentStatuses[booking.paymentStatus as keyof typeof paymentStatuses]?.color || 'bg-gray-100 text-gray-800'}>
                          {paymentStatuses[booking.paymentStatus as keyof typeof paymentStatuses]?.label || booking.paymentStatus || 'Unknown'}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          {getPaymentMethodIcon(booking.paymentMethod)}
                          <span>{getPaymentMethodLabel(booking.paymentMethod)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>ID: {booking.id.slice(-8)}</span>
                          <span>{formatDate(booking.bookingDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {sortedBookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setSelectedPaymentStatus("all");
                  }} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                {selectedBooking?.serviceTitle?.charAt(0) || 'B'}
              </div>
              <div>
                <div>Booking Details</div>
                <div className="text-sm font-normal text-gray-500">ID: {selectedBooking?.id}</div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about this booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Booking Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={bookingStatuses[selectedBooking.status as keyof typeof bookingStatuses]?.color || 'bg-gray-100 text-gray-800'}>
                            {bookingStatuses[selectedBooking.status as keyof typeof bookingStatuses]?.label || selectedBooking.status || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge className={paymentStatuses[selectedBooking.paymentStatus as keyof typeof paymentStatuses]?.color || 'bg-gray-100 text-gray-800'}>
                            {paymentStatuses[selectedBooking.paymentStatus as keyof typeof paymentStatuses]?.label || selectedBooking.paymentStatus || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Travel Date:</span>
                          <span className="font-medium">{formatDate(selectedBooking.travelDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Date:</span>
                          <span className="font-medium">{formatDate(selectedBooking.bookingDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of People:</span>
                          <span className="font-medium">{selectedBooking.numberOfPeople}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-bold text-lg text-green-600">${selectedBooking.totalAmount?.toLocaleString() || '0'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Payment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <div className="flex items-center space-x-2">
                            {getPaymentMethodIcon(selectedBooking.paymentMethod)}
                            <span className="font-medium">{getPaymentMethodLabel(selectedBooking.paymentMethod)}</span>
                          </div>
                        </div>
                        {selectedBooking.transactionId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{selectedBooking.transactionId}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{formatDateTime(selectedBooking.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{formatDateTime(selectedBooking.updatedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedBooking.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes & Special Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">
                          {selectedBooking.notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedBooking.status === 'cancelled' && selectedBooking.cancellationReason && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-lg text-red-700">Cancellation Reason</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-red-700 bg-red-100 p-4 rounded-lg border border-red-200">
                          {selectedBooking.cancellationReason}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{selectedBooking.customerName}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{selectedBooking.customerEmail}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{selectedBooking.customerPhone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" className="flex-1">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Customer
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send SMS
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="service" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Service Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                          {selectedBooking.serviceTitle?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedBooking.serviceTitle}</h3>
                          <p className="text-gray-600">Service ID: {selectedBooking.serviceId}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Travel Date</Label>
                          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{formatDate(selectedBooking.travelDate)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Number of Guests</Label>
                          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{selectedBooking.numberOfPeople} people</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedBooking.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleConfirmBooking(selectedBooking.id)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Booking
                            </Button>
                            <Button 
                              onClick={() => handleCancelBooking(selectedBooking.id)}
                              variant="destructive"
                              className="w-full"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Booking
                            </Button>
                          </>
                        )}
                        
                        {selectedBooking.paymentStatus === 'pending' && (
                          <Button 
                            onClick={() => handleConfirmPayment(selectedBooking.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Payment
                          </Button>
                        )}
                        
                        {selectedBooking.paymentStatus === 'paid' && (
                          <Button 
                            onClick={() => handleProcessRefund(selectedBooking.id)}
                            variant="outline"
                            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Process Refund
                          </Button>
                        )}
                        
                        {selectedBooking.status === 'cancelled' && (
                          <Button 
                            onClick={() => handleDeleteBooking(selectedBooking.id)}
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Booking
                          </Button>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Edit Notes</Label>
                        <div className="flex space-x-2">
                          <Textarea
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            placeholder="Add or edit notes for this booking..."
                            className="flex-1"
                            rows={3}
                          />
                          <Button 
                            onClick={() => {
                              setQuickActionBooking(selectedBooking);
                              setIsNotesModalOpen(true);
                            }}
                            variant="outline"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions Modal */}
      <Dialog open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
            <DialogDescription>
              What would you like to do with this booking?
            </DialogDescription>
          </DialogHeader>
          
          {quickActionBooking && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{quickActionBooking.serviceTitle}</p>
                <p className="text-xs text-gray-500">{quickActionBooking.customerName}</p>
              </div>
              
              <div className="space-y-2">
                {quickActionBooking.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleConfirmBooking(quickActionBooking.id);
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </Button>
                    <Button 
                      onClick={() => {
                        handleCancelBooking(quickActionBooking.id);
                        setIsQuickActionsOpen(false);
                      }}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </>
                )}
                
                {quickActionBooking.paymentStatus === 'pending' && (
                  <Button 
                    onClick={() => {
                      handleConfirmPayment(quickActionBooking.id);
                      setIsQuickActionsOpen(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </Button>
                )}
                
                <Button 
                  onClick={() => {
                    handleViewBooking(quickActionBooking);
                    setIsQuickActionsOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Editing Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking Notes</DialogTitle>
            <DialogDescription>
              Update notes and special requests for this booking
            </DialogDescription>
          </DialogHeader>
          
          {quickActionBooking && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{quickActionBooking.serviceTitle}</p>
                <p className="text-xs text-gray-500">{quickActionBooking.customerName}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes & Special Requests</Label>
                <Textarea
                  id="notes"
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add notes, special requests, or any additional information..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveNotes}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Notes
                </Button>
                <Button 
                  onClick={() => {
                    setIsNotesModalOpen(false);
                    setQuickActionBooking(null);
                    setEditingNotes("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Message Modal */}
      <Dialog open={!!confirmationMessage} onOpenChange={() => setConfirmationMessage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`text-2xl font-bold text-center ${
              confirmationMessage?.type === 'success' ? 'text-green-800' : 
              confirmationMessage?.type === 'error' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {confirmationMessage?.title}
            </DialogTitle>
            <DialogDescription className="text-center">
              {confirmationMessage?.message}
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              confirmationMessage?.type === 'success' ? 'bg-green-100' : 
              confirmationMessage?.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              {confirmationMessage?.type === 'success' ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : confirmationMessage?.type === 'error' ? (
                <XCircle className="w-12 h-12 text-red-600" />
              ) : (
                <AlertCircle className="w-12 h-12 text-blue-600" />
              )}
            </div>
            
            {confirmationMessage?.details && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                {Object.entries(confirmationMessage.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {confirmationMessage?.type === 'confirm' ? (
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    if (confirmationMessage.callback) {
                      confirmationMessage.callback();
                    }
                    setConfirmationMessage(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold"
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => setConfirmationMessage(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setConfirmationMessage(null)}
                className={`w-full ${
                  confirmationMessage?.type === 'success'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                } text-white rounded-lg font-semibold`}
              >
                Continue
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
