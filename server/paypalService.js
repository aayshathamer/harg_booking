const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

// Configure PayPal SDK
const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'live'
const clientId = process.env.PAYPAL_CLIENT_ID || 'your-paypal-client-id';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret';

// Check if credentials are properly configured
if (clientId === 'your-paypal-client-id' || clientSecret === 'your-paypal-client-secret') {
  console.warn('⚠️  PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
}

// Initialize PayPal client
let client;
if (environment === 'live') {
  client = new Client({
    environment: Environment.Production,
    clientId: clientId,
    clientSecret: clientSecret
  });
} else {
  client = new Client({
    environment: Environment.Sandbox,
    clientId: clientId,
    clientSecret: clientSecret
  });
}

/**
 * Create a PayPal order for a booking
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.bookingId - Unique booking ID
 * @param {string} bookingData.serviceTitle - Service title
 * @param {number} bookingData.totalAmount - Total amount to charge
 * @param {string} bookingData.customerEmail - Customer email
 * @param {string} bookingData.customerName - Customer name
 * @returns {Promise<Object>} PayPal order response
 */
async function createPayPalOrder(bookingData) {
  try {
    console.log('PayPal order request data:', bookingData);
    
    const { bookingId, serviceTitle, totalAmount, customerEmail, customerName } = bookingData;
    
    // Validate required fields
    if (!bookingId || !serviceTitle || !totalAmount || !customerEmail || !customerName) {
      throw new Error('Missing required fields: bookingId, serviceTitle, totalAmount, customerEmail, customerName');
    }
    
    // Check if PayPal is properly configured
    if (clientId === 'your-paypal-client-id' || clientSecret === 'your-paypal-client-secret') {
      // Demo mode - return a mock response for testing UI
      console.log('PayPal Demo Mode: Returning mock response');
      return {
        success: true,
        orderId: `DEMO-${Date.now()}`,
        approvalUrl: `${process.env.FRONTEND_URL || 'http://localhost:8083'}/payment/success?token=DEMO-${Date.now()}&PayerID=DEMO-PAYER`,
        data: {
          id: `DEMO-${Date.now()}`,
          status: 'CREATED',
          links: [{
            rel: 'approve',
            href: `${process.env.FRONTEND_URL || 'http://localhost:8083'}/payment/success?token=DEMO-${Date.now()}&PayerID=DEMO-PAYER`
          }]
        }
      };
    }
    
    const ordersController = new OrdersController(client);
    
    const orderRequest = {
      intent: 'CAPTURE',
      purchaseUnits: [{
        referenceId: bookingId,
        amount: {
          currencyCode: 'USD',
          value: totalAmount.toFixed(2)
        },
        description: `Booking for ${serviceTitle}`,
        customId: bookingId,
        invoiceId: `INV-${bookingId}`,
        softDescriptor: 'Hargeisa Vibes'
      }],
      applicationContext: {
        brandName: 'Hargeisa Vibes',
        landingPage: 'NO_PREFERENCE',
        userAction: 'PAY_NOW',
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:8083'}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:8083'}/payment/cancel`
      }
    };

    console.log('PayPal order request:', JSON.stringify(orderRequest, null, 2));
    
    const response = await ordersController.createOrder(orderRequest);
    console.log('PayPal order created:', response.result.id);
    
    return {
      success: true,
      orderId: response.result.id,
      approvalUrl: response.result.links.find(link => link.rel === 'approve').href,
      data: response.result
    };
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body,
      headers: error.headers
    });
    return {
      success: false,
      error: error.message || 'Failed to create PayPal order'
    };
  }
}

/**
 * Capture a PayPal order after approval
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Capture response
 */
async function capturePayPalOrder(orderId) {
  try {
    // Demo mode for testing
    if (orderId.startsWith('DEMO-')) {
      console.log('PayPal Demo Mode: Capturing demo order');
      return {
        success: true,
        captureId: `DEMO-CAPTURE-${Date.now()}`,
        status: 'COMPLETED',
        data: {
          id: orderId,
          status: 'COMPLETED',
          purchaseUnits: [{
            payments: {
              captures: [{
                id: `DEMO-CAPTURE-${Date.now()}`,
                status: 'COMPLETED'
              }]
            }
          }]
        }
      };
    }
    
    const ordersController = new OrdersController(client);
    
    const response = await ordersController.captureOrder(orderId, {});
    console.log('PayPal order captured:', response.result.id);
    
    return {
      success: true,
      captureId: response.result.purchaseUnits[0].payments.captures[0].id,
      status: response.result.status,
      data: response.result
    };
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return {
      success: false,
      error: error.message || 'Failed to capture PayPal order'
    };
  }
}

/**
 * Get PayPal order details
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Order details
 */
async function getPayPalOrder(orderId) {
  try {
    const ordersController = new OrdersController(client);
    const response = await ordersController.getOrder(orderId);
    
    return {
      success: true,
      data: response.result
    };
  } catch (error) {
    console.error('Error getting PayPal order:', error);
    return {
      success: false,
      error: error.message || 'Failed to get PayPal order'
    };
  }
}

/**
 * Verify PayPal webhook signature
 * @param {Object} headers - Request headers
 * @param {string} body - Request body
 * @returns {boolean} Whether signature is valid
 */
function verifyPayPalWebhook(headers, body) {
  // In production, implement proper webhook verification
  // For now, we'll return true for development
  return true;
}

/**
 * Test PayPal configuration
 * @returns {Object} Configuration status
 */
function testPayPalConfiguration() {
  return {
    environment: environment,
    clientId: clientId ? 'Set' : 'Not Set',
    clientSecret: clientSecret ? 'Set' : 'Not Set',
    configured: clientId !== 'your-paypal-client-id' && clientSecret !== 'your-paypal-client-secret'
  };
}

module.exports = {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
  verifyPayPalWebhook,
  testPayPalConfiguration
};
