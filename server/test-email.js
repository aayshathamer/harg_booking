const { sendBookingReceipt, testEmailConfig } = require('./emailService');

// Test data
const testBookingData = {
  bookingId: 'test-booking-123',
  customerName: 'John Doe',
  serviceTitle: 'Hargeisa City Tour',
  travelDate: '2024-12-25',
  numberOfPeople: 2,
  totalAmount: 150.00,
  paymentMethod: 'Credit Card',
  bookingDate: new Date()
};

async function testEmailFunctionality() {
  console.log('🧪 Testing Email Functionality...\n');
  
  // Test 1: Check email configuration
  console.log('1️⃣ Testing email configuration...');
  try {
    const configValid = await testEmailConfig();
    if (configValid) {
      console.log('✅ Email configuration is valid');
    } else {
      console.log('❌ Email configuration is invalid');
      console.log('⚠️ Please check your SMTP settings in .env file');
      return;
    }
  } catch (error) {
    console.log('❌ Error testing email configuration:', error.message);
    return;
  }
  
  // Test 2: Send test receipt email
  console.log('\n2️⃣ Sending test receipt email...');
  try {
    const result = await sendBookingReceipt(testBookingData);
    if (result.success) {
      console.log('✅ Test receipt email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📬 Sent to: ${testBookingData.customerEmail}`);
    } else {
      console.log('❌ Failed to send test receipt email:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending test receipt email:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
}

// Run the test
testEmailFunctionality().catch(console.error);
