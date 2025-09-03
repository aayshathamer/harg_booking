// PayPal Service for Frontend Integration
export interface PayPalOrderData {
  bookingId: string;
  serviceTitle: string;
  totalAmount: number;
  customerEmail: string;
  customerName: string;
}

export interface PayPalOrderResponse {
  success: boolean;
  orderId?: string;
  approvalUrl?: string;
  error?: string;
  message?: string;
}

export interface PayPalCaptureResponse {
  success: boolean;
  captureId?: string;
  status?: string;
  error?: string;
  message?: string;
}

export class PayPalService {
  private static baseUrl = '/api/paypal';

  /**
   * Create a PayPal order for booking
   */
  static async createOrder(orderData: PayPalOrderData): Promise<PayPalOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create PayPal order');
      }

      return result;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create PayPal order'
      };
    }
  }

  /**
   * Capture a PayPal order after approval
   */
  static async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture PayPal order');
      }

      return result;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture PayPal order'
      };
    }
  }

  /**
   * Get PayPal order details
   */
  static async getOrder(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/order/${orderId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get PayPal order');
      }

      return result;
    } catch (error) {
      console.error('Error getting PayPal order:', error);
      throw error;
    }
  }

  /**
   * Redirect to PayPal for payment approval
   */
  static redirectToPayPal(approvalUrl: string): void {
    window.location.href = approvalUrl;
  }

  /**
   * Handle PayPal payment success
   */
  static async handlePaymentSuccess(orderId: string, bookingData: any): Promise<boolean> {
    try {
      // Capture the order
      const captureResult = await this.captureOrder(orderId);
      
      if (captureResult.success) {
        // Update booking with PayPal transaction details
        const bookingResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookingData,
            paymentMethod: 'paypal',
            transactionId: captureResult.captureId,
            paymentStatus: 'paid',
            status: 'confirmed'
          }),
        });

        if (bookingResponse.ok) {
          console.log('Booking created successfully with PayPal payment');
          return true;
        } else {
          console.error('Failed to create booking after PayPal payment');
          return false;
        }
      } else {
        console.error('Failed to capture PayPal payment:', captureResult.error);
        return false;
      }
    } catch (error) {
      console.error('Error handling PayPal payment success:', error);
      return false;
    }
  }

  /**
   * Handle PayPal payment cancellation
   */
  static handlePaymentCancel(): void {
    console.log('PayPal payment was cancelled');
    // Redirect back to booking form or show cancellation message
    window.location.href = '/';
  }

  /**
   * Format amount for PayPal (ensure 2 decimal places)
   */
  static formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Validate PayPal email format
   */
  static isValidPayPalEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate PayPal transaction ID (for manual entry)
   */
  static generateTransactionId(): string {
    return `PP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

// PayPal Button Component Props
export interface PayPalButtonProps {
  amount: number;
  bookingData: PayPalOrderData;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
}

// PayPal Integration Hook
export const usePayPalPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (orderData: PayPalOrderData) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await PayPalService.createOrder(orderData);
      
      if (result.success && result.approvalUrl) {
        // Redirect to PayPal for approval
        PayPalService.redirectToPayPal(result.approvalUrl);
      } else {
        throw new Error(result.error || 'Failed to create PayPal order');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    error,
    clearError: () => setError(null)
  };
};

// Import useState for the hook
import { useState } from 'react';
