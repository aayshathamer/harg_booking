# Email Setup Guide for Hargeisa Vibes

This guide explains how to set up email functionality to send booking receipts to customers.

## Prerequisites

1. **Gmail Account** (recommended for testing)
2. **App Password** (not your regular Gmail password)

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification
4. Generate an App Password for "Mail"

## Step 2: Create .env File

Create a `.env` file in the `server/` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bbx1ftpsp8wy1mhy1m9c
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
CORS_ORIGIN=http://localhost:8080

# Email Configuration (for sending receipts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
```

## Step 3: Update Email Configuration

Replace the placeholder values in your `.env` file:

- `SMTP_USER`: Your Gmail address
- `SMTP_PASS`: Your 16-digit app password (not your regular password)

## Step 4: Test Email Configuration

Run the test script to verify everything works:

```bash
cd server
node test-email.js
```

## Step 5: Test the API

Test the email endpoint:

```bash
curl http://localhost:3001/api/test-email
```

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure you're using an App Password, not your regular password
   - Verify 2-Factor Authentication is enabled

2. **Connection Refused**
   - Check if your firewall/antivirus is blocking the connection
   - Verify the SMTP host and port are correct

3. **Email Not Sending**
   - Check the server logs for error messages
   - Verify the recipient email address is valid

### Testing

1. **Test Configuration**: `GET /api/test-email`
2. **Test Email Sending**: Use the test script `node test-email.js`
3. **Check Logs**: Monitor server console for email-related messages

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- Consider using a dedicated email service (SendGrid, Mailgun) for production
- App passwords are more secure than regular passwords

## Production Considerations

For production environments, consider:

1. **Email Service Providers**: SendGrid, Mailgun, AWS SES
2. **Rate Limiting**: Implement email sending limits
3. **Email Templates**: Store templates in a database or CMS
4. **Queue System**: Use Redis or similar for email queuing
5. **Monitoring**: Track email delivery rates and failures

## Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify your email configuration
3. Test with the provided test script
4. Ensure your email provider allows SMTP access
