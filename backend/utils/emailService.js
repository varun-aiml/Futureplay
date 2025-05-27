const SibApiV3Sdk = require('@getbrevo/brevo');

// Configure Brevo API client
const configureBrevoClient = () => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  return apiInstance;
};

// Send OTP email
const sendOTPEmail = async (options) => {
  try {
    const apiInstance = configureBrevoClient();
    
    // Create email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = 'Your Verification Code for ServeUp';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e53e3e;">ServeUp</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
          <h2 style="margin-top: 0;">Hello ${options.name},</h2>
          <p>Thank you for registering with ServeUp. To complete your registration, please use the following verification code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 30px; background-color: #e53e3e; color: white; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
              ${options.otp}
            </div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ServeUp. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // Set sender
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'ServeUp',
      email: process.env.EMAIL_FROM
    };
    
    // Set recipient
    sendSmtpEmail.to = [{
      email: options.email,
      name: options.name
    }];
    
    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendOTPEmail
};