import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Home, Receipt } from 'lucide-react';
import { PayPalService } from '@/lib/paypalService';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'processing'>('processing');
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const orderId = searchParams.get('token');
        const payerId = searchParams.get('PayerID');
        
        if (!orderId) {
          throw new Error('No order ID found in URL');
        }

        // Get pending booking data from session storage
        const pendingBooking = sessionStorage.getItem('pendingBooking');
        if (!pendingBooking) {
          throw new Error('No pending booking found');
        }

        const booking = JSON.parse(pendingBooking);
        setBookingData(booking);

        // Capture the PayPal order
        const captureResult = await PayPalService.captureOrder(orderId);
        
        if (captureResult.success) {
          // Create booking with PayPal payment details
          const bookingResponse = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...booking,
              paymentMethod: 'paypal',
              transactionId: captureResult.captureId,
              paymentStatus: 'paid',
              status: 'confirmed'
            }),
          });

          if (bookingResponse.ok) {
            setPaymentStatus('success');
            // Clear session storage
            sessionStorage.removeItem('pendingBooking');
            sessionStorage.removeItem('paypalOrderId');
          } else {
            throw new Error('Failed to create booking');
          }
        } else {
          throw new Error(captureResult.error || 'Failed to capture payment');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setError(error instanceof Error ? error.message : 'Payment processing failed');
        setPaymentStatus('error');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/');
  };

  const handleViewBookings = () => {
    navigate('/admin/bookings');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="space-y-2">
              <Button onClick={handleContinue} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Booking Confirmed</h3>
            {bookingData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{bookingData.serviceTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-600">${bookingData.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium">PayPal</span>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-gray-600">
            Your booking has been confirmed and payment processed successfully. 
            You will receive a confirmation email shortly.
          </p>
          
          <div className="space-y-2">
            <Button onClick={handleContinue} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
            <Button onClick={handleViewBookings} variant="outline" className="w-full">
              <Receipt className="w-4 h-4 mr-2" />
              View Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
