import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, UserIcon, MailIcon, PhoneIcon, CalendarIcon, CheckCircleIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PayPalButton from "./PayPalButton";
import { PayPalOrderData } from "@/lib/paypalService";

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: string;
  specialRequests: string;
  paymentMethod: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  mobileMoneyNumber: string;
  transactionId: string;
  bankAccountNumber: string;
  bankName: string;
  paypalEmail: string;
  paypalTransactionId: string;
  calculatedTotal?: string;
}

interface BookingFormProps {
  serviceTitle: string;
  servicePrice?: string;
  serviceImage: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
}

const BookingForm = ({ serviceTitle, servicePrice, serviceImage, isOpen, onClose, onSubmit }: BookingFormProps) => {
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: "1",
    specialRequests: "",
    paymentMethod: "mobile_money",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    mobileMoneyNumber: "",
    transactionId: "",
    bankAccountNumber: "",
    bankName: "",
    paypalEmail: "",
    paypalTransactionId: ""
  });

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
    
    // Clear payment fields when payment method changes
    if (field === "paymentMethod") {
      setBookingForm(prev => ({
        ...prev,
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        mobileMoneyNumber: "",
        transactionId: "",
        bankAccountNumber: "",
        bankName: "",
        paypalEmail: "",
        paypalTransactionId: ""
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total amount based on price per person and number of guests
    const pricePerPerson = parseFloat(servicePrice || "0");
    const numberOfGuests = parseInt(bookingForm.guests);
    const totalAmount = (pricePerPerson * numberOfGuests).toFixed(2);
    
    // Create booking data for success modal
    const bookingData = {
      dealTitle: serviceTitle,
      dealId: `booking-${Date.now()}`,
      preferredDate: bookingForm.date,
      numberOfGuests: bookingForm.guests,
      totalAmount: totalAmount
    };
    
    setCreatedBooking(bookingData);
    setIsSuccessModalOpen(true);
    
    // Submit to parent component with calculated total
    onSubmit({ ...bookingForm, calculatedTotal: totalAmount } as BookingFormData);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setCreatedBooking(null);
    onClose();
    
    // Reset form
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      date: "",
      guests: "1",
      specialRequests: "",
      paymentMethod: "mobile_money",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      mobileMoneyNumber: "",
      transactionId: "",
      bankAccountNumber: "",
      bankName: "",
      paypalEmail: "",
      paypalTransactionId: ""
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{serviceImage}</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book {serviceTitle}</h2>
                <p className="text-gray-600">{servicePrice || 'Price not available'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            {bookingForm.paymentMethod === "paypal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paypalEmail" className="text-sm font-medium text-gray-700">
                    PayPal Email Address *
                  </Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    required
                    value={bookingForm.paypalEmail}
                    onChange={(e) => handleInputChange("paypalEmail", e.target.value)}
                    placeholder="Enter your PayPal email"
                    className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypalTransactionId" className="text-sm font-medium text-gray-700">
                    PayPal Transaction ID *
                  </Label>
                  <Input
                    id="paypalTransactionId"
                    type="text"
                    required
                    value={bookingForm.paypalTransactionId}
                    onChange={(e) => handleInputChange("paypalTransactionId", e.target.value)}
                    placeholder="Enter PayPal transaction ID"
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
              {bookingForm.paymentMethod === "paypal" && (
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>PayPal Email:</strong> Your PayPal account email address</p>
                  <p>• <strong>Transaction ID:</strong> PayPal transaction reference number</p>
                  <p>• <strong>Secure Payment:</strong> PayPal handles all payment processing securely</p>
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
                rows={3}
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg"
              />
            </div>

            {/* Price Summary */}
            {servicePrice && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">💰</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Price Summary</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per person:</span>
                    <span className="font-semibold text-gray-800">${parseFloat(servicePrice).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Number of guests:</span>
                    <span className="font-semibold text-gray-800">{bookingForm.guests}</span>
                  </div>
                  
                  <div className="border-t border-green-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${(parseFloat(servicePrice) * parseInt(bookingForm.guests)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    💡 Final amount may vary based on additional services or special requests
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="space-y-4 pt-4">
              {/* PayPal Button - Show when PayPal is selected */}
              {bookingForm.paymentMethod === 'paypal' && (
                <div className="space-y-2">
                  <PayPalButton
                    amount={parseFloat(bookingForm.calculatedTotal || "0")}
                    bookingData={{
                      bookingId: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                      serviceTitle: serviceTitle,
                      totalAmount: parseFloat(bookingForm.calculatedTotal || "0"),
                      customerEmail: bookingForm.email,
                      customerName: bookingForm.name
                    }}
                    onSuccess={(orderId) => {
                      console.log('PayPal payment successful:', orderId);
                      // The PayPal flow will handle the booking creation
                    }}
                    onError={(error) => {
                      console.error('PayPal payment error:', error);
                      alert(`PayPal payment failed: ${error}`);
                    }}
                    onCancel={() => {
                      console.log('PayPal payment cancelled');
                    }}
                    disabled={!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.date}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    You will be redirected to PayPal to complete your payment
                  </p>
                </div>
              )}

              {/* Regular Submit Button - Show for other payment methods */}
              {bookingForm.paymentMethod !== 'paypal' && (
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Confirm Booking
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal - Exact same as deals page */}
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
    </>
  );
};

export default BookingForm;
