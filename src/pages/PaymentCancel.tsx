import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, ArrowLeft } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-orange-600">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">No Payment Processed</h3>
            <p className="text-gray-600">
              Your PayPal payment was cancelled. No charges have been made to your account.
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>What happened?</strong><br />
              You chose to cancel the payment process or there was an issue with the payment.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleTryAgain} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleReturnHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;
