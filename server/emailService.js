const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const createReceiptEmail = (bookingData) => {
  const {
    bookingId,
    customerName,
    serviceTitle,
    travelDate,
    numberOfPeople,
    totalAmount,
    paymentMethod,
    bookingDate
  } = bookingData;

  const formattedTravelDate = new Date(travelDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedBookingDate = new Date(bookingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    subject: `🎉 Booking Confirmation - ${serviceTitle}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .tagline {
            font-size: 16px;
            opacity: 0.9;
          }
          .booking-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-label {
            font-weight: 600;
            color: #495057;
          }
          .detail-value {
            color: #212529;
          }
          .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #d4edda;
            border-radius: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
          }
          .contact-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🌟 Hargeisa Vibes</div>
          <div class="tagline">Explore the Beauty of Hargeisa</div>
        </div>
        
        <div class="content">
          <h1 style="color: #28a745; text-align: center;">✅ Booking Confirmed!</h1>
          
          <p>Dear <strong>${customerName}</strong>,</p>
          
          <p>Thank you for choosing Hargeisa Vibes! Your booking has been confirmed and we're excited to help you explore the beautiful city of Hargeisa.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #495057;">📋 Booking Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value"><strong>${bookingId}</strong></span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${serviceTitle}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Travel Date:</span>
              <span class="detail-value">${formattedTravelDate}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Number of People:</span>
              <span class="detail-value">${numberOfPeople}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${paymentMethod}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Booking Date:</span>
              <span class="detail-value">${formattedBookingDate}</span>
            </div>
          </div>
          
          <div class="total-amount">
            💰 Total Amount: $${totalAmount.toFixed(2)}
          </div>
          
          <div class="contact-info">
            <h4 style="margin-top: 0; color: #1976d2;">📞 Need Help?</h4>
            <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us:</p>
            <p><strong>Email:</strong> support@hargeisavibes.com</p>
            <p><strong>Phone:</strong> +252 XX XXX XXXX</p>
            <p><strong>WhatsApp:</strong> +252 XX XXX XXXX</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:8080" class="button">Visit Our Website</a>
          </div>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring a valid ID for verification</li>
            <li>Payment is due upon arrival (if not already paid)</li>
            <li>Cancellations must be made 24 hours in advance</li>
          </ul>
          
          <p>We look forward to providing you with an unforgettable experience in Hargeisa!</p>
          
          <p>Best regards,<br>
          <strong>The Hargeisa Vibes Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>&copy; 2024 Hargeisa Vibes. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  };
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Hargeisa Vibes" <${emailConfig.auth.user}>`,
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send booking receipt
const sendBookingReceipt = async (bookingData) => {
  try {
    const emailContent = createReceiptEmail(bookingData);
    const result = await sendEmail(bookingData.customerEmail, emailContent.subject, emailContent.html);
    
    if (result.success) {
      console.log(`📧 Receipt email sent to ${bookingData.customerEmail}`);
      return result;
    } else {
      console.error(`❌ Failed to send receipt email to ${bookingData.customerEmail}:`, result.error);
      return result;
    }
  } catch (error) {
    console.error('❌ Error in sendBookingReceipt:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration is invalid:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBookingReceipt,
  testEmailConfig,
  createReceiptEmail
};
