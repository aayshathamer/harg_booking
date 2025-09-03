# PayPal Integration Setup Guide

## Current Status
✅ PayPal integration code is complete and ready  
⚠️ PayPal credentials need to be configured  

## Quick Setup Steps

### 1. Get PayPal Developer Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Click "Create App"
4. Choose "Default Application" 
5. Select "Sandbox" for testing
6. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory with:

```env
# PayPal Configuration
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=your-actual-client-id-here
PAYPAL_CLIENT_SECRET=your-actual-client-secret-here
FRONTEND_URL=http://localhost:8083
```

### 3. Test Configuration

After setting up credentials, test the configuration:

```bash
curl http://localhost:3001/api/paypal/test-config
```

You should see:
```json
{
  "success": true,
  "configuration": {
    "environment": "sandbox",
    "clientId": "Set",
    "clientSecret": "Set", 
    "configured": true
  },
  "message": "PayPal is properly configured"
}
```

### 4. Test PayPal Payment Flow

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

2. Visit `http://localhost:8083`
3. Go to Services page
4. Book a service and select "PayPal" as payment method
5. Click the PayPal button to test the payment flow

## PayPal Sandbox Testing

For testing, use PayPal's sandbox accounts:
- **Buyer Account**: Use any sandbox buyer account from PayPal Developer Dashboard
- **Test Credit Cards**: PayPal provides test card numbers in their documentation

## Production Setup

For production:
1. Change `PAYPAL_ENVIRONMENT=live` in `.env`
2. Use your live PayPal application credentials
3. Update `FRONTEND_URL` to your production domain

## Troubleshooting

### Error: "PayPal credentials not configured"
- Make sure `.env` file exists in `server` directory
- Verify credentials are correct (not placeholder values)
- Restart the server after adding credentials

### Error: "Missing required fields for PayPal order"
- Check that all booking form fields are filled
- Verify the booking data is being passed correctly

### Error: "PayPal API Error"
- Check your PayPal Developer Dashboard for API errors
- Verify your app is approved and active
- Check rate limits and quotas

## Support

If you need help:
1. Check PayPal Developer Documentation
2. Verify your PayPal Developer account status
3. Test with PayPal's sandbox environment first
