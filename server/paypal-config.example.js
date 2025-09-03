// PayPal Configuration Example
// Copy this file to .env and update with your actual PayPal credentials


/*
To get your PayPal credentials:

1. Go to https://developer.paypal.com/
2. Log in with your PayPal account
3. Create a new application
4. Choose "Sandbox" for testing or "Live" for production
5. Copy the Client ID and Client Secret
6. Update the .env file with your credentials

For webhooks:
1. In your PayPal Developer Dashboard
2. Go to your application settings
3. Add webhook URL: https://yourdomain.com/api/paypal/webhook
4. Select events: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED
5. Copy the Webhook ID to your .env file

Testing:
- Use PayPal sandbox accounts for testing
- Create test accounts at https://developer.paypal.com/developer/accounts/
- Use test credit card numbers provided by PayPal
*/
