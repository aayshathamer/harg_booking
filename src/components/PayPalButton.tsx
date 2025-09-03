import React from 'react';
import { Button } from '@/components/ui/button';
import { PayPalService, PayPalButtonProps } from '@/lib/paypalService';
import { CreditCard, Loader2 } from 'lucide-react';

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  bookingData,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await PayPalService.createOrder(bookingData);
      
      if (result.success && result.approvalUrl) {
        // Store booking data in session storage for after payment
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        sessionStorage.setItem('paypalOrderId', result.orderId || '');
        
        // Redirect to PayPal
        PayPalService.redirectToPayPal(result.approvalUrl);
      } else {
        throw new Error(result.error || 'Failed to create PayPal order');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayPalPayment}
      disabled={disabled || isProcessing}
      className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5 mr-2" />
          Pay with PayPal - ${PayPalService.formatAmount(amount)}
        </>
      )}
    </Button>
  );
};

export default PayPalButton;
