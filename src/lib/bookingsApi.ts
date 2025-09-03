// Define interfaces locally since @/data/bookings was deleted
export interface Booking {
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

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';

// API service for bookings management
export class BookingsApiService {
  
  // Get all bookings
  static async getAllBookings(): Promise<Booking[]> {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const result = await response.json();
      return result; // Backend already returns properly formatted data
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  // Get bookings by status
  static async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    try {
      const response = await fetch(`/api/bookings?status=${status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings by status');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      throw new Error('Failed to fetch bookings by status');
    }
  }

  // Get bookings by payment status
  static async getBookingsByPaymentStatus(paymentStatus: PaymentStatus): Promise<Booking[]> {
    try {
      const response = await fetch(`/api/bookings?paymentStatus=${paymentStatus}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings by payment status');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching bookings by payment status:', error);
      throw new Error('Failed to fetch bookings by payment status');
    }
  }

  // Get bookings by customer
  static async getBookingsByCustomer(customerEmail: string): Promise<Booking[]> {
    try {
      const response = await fetch(`/api/bookings?customerEmail=${encodeURIComponent(customerEmail)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer bookings');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw new Error('Failed to fetch customer bookings');
    }
  }

  // Search bookings
  static async searchBookings(searchTerm: string): Promise<Booking[]> {
    try {
      const response = await fetch(`/api/bookings?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search bookings');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error searching bookings:', error);
      throw new Error('Failed to search bookings');
    }
  }

  // Get booking by ID
  static async getBookingById(id: string): Promise<Booking | null> {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch booking');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw new Error('Failed to fetch booking');
    }
  }

  // Create new booking
  static async createBooking(bookingData: Partial<Booking>): Promise<string> {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: bookingData.serviceId,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          bookingDate: new Date().toISOString(),
          travelDate: typeof bookingData.travelDate === 'string' ? bookingData.travelDate : new Date().toISOString(),
          numberOfPeople: bookingData.numberOfPeople || 1,
          totalAmount: bookingData.totalAmount || 0,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: bookingData.paymentMethod || 'Credit Card',
          notes: bookingData.notes || ''
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      const result = await response.json();
      return result.bookingId;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  // Update booking status
  static async updateBookingStatus(id: string, status: BookingStatus, cancellationReason?: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, cancellationReason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }

  // Update payment status
  static async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, transactionId?: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/bookings/${id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus, transactionId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Update booking
  static async updateBooking(id: string, bookingData: Partial<Booking>): Promise<boolean> {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  }

  // Delete booking (soft delete)
  static async deleteBooking(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw new Error('Failed to delete booking');
    }
  }

  // Get booking statistics
  static async getBookingStatistics(): Promise<any> {
    try {
      const response = await fetch('/api/bookings/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch booking statistics');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      throw new Error('Failed to fetch booking statistics');
    }
  }

  // Get revenue analytics
  static async getRevenueAnalytics(): Promise<any> {
    try {
      const response = await fetch('/api/bookings/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch revenue analytics');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw new Error('Failed to fetch revenue analytics');
    }
  }


}
