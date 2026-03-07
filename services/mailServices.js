import nodemailer from 'nodemailer';
import 'dotenv/config';



// export const transporter = nodemailer.createTransport({
//   host: "smtp.sendgrid.net",
//   port: 2525,
//   secure: false,
//   auth: {
//     user: "apikey", 
//     pass: process.env.SENDGRID_API_KEY,
//   },
// });


export const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


export const sendMailService = async (data, to, purpose) => {
  
  try{
    let subject, text, html;

  if(purpose === 'RESET_PASSWORD') {
   
    const resetLink = data; 

    subject = "🔒 Password Reset Request - Nexus E-Commerce";

   
    text = `Hello,\n\nWe received a request to reset the password for your Nexus E-Commerce account.\n\nYou can securely set a new password by clicking the link below:\n\n${resetLink}\n\nFor your security, this link is only valid for 15 minutes.\n\nIf you did not request a password reset, please safely ignore this email. Your account remains secure.\n\nRegards,\nNexus E-Commerce Security Team`;

    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
        
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
          <h2 style="color: #333333; margin: 0;">Nexus E-Commerce</h2>
        </div>

        <div style="padding: 20px 0; text-align: center;">
          <h3 style="color: #1a73e8; margin-top: 0; font-size: 24px;">Password Reset Request 🔒</h3>
          <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align: left;">
            Hello,
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align: left;">
            We received a request to reset the password for your account. If you made this request, please click the button below to securely set a new password.
          </p>
          
          <div style="margin: 35px 0;">
            <a href="${resetLink}" style="background-color: #1a73e8; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(26, 115, 232, 0.2);">
              Reset Password
            </a>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; text-align: left;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong> This link is only valid for <strong>15 minutes</strong>. If you did not request this change, you can safely ignore this email. Your password will remain completely unchanged.
            </p>
          </div>

          <p style="color: #777777; font-size: 14px; margin-top: 20px; text-align: left;">
            <em>If the button above doesn't work, copy and paste this URL directly into your browser:</em><br><br>
            <a href="${resetLink}" style="color: #1a73e8; word-break: break-all;">${resetLink}</a>
          </p>
        </div>

        <div style="padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            This is an automated security message from Nexus E-Commerce. Please do not reply to this email.
          </p>
        </div>
        
      </div>
    `;
  } else if(purpose === 'EMAIL_VERIFY') {
    // Assuming 'data' contains your verification link
    const verificationLink = data; 

    subject = "🚀 Welcome to Nexus E-Commerce! Please Verify Your Email";


    text = `Hello!\n\nWelcome to Nexus E-Commerce. We're thrilled to have you on board!\n\nPlease verify your email address to activate your account by clicking the link below:\n\n${verificationLink}\n\nFor your security, this link will expire in 24 hours.\n\nIf you did not create an account with us, please safely ignore this email.\n\nHappy Shopping,\nNexus E-Commerce Team`;


    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
        
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
          <h2 style="color: #333333; margin: 0;">Nexus E-Commerce</h2>
        </div>

        <div style="padding: 20px 0; text-align: center;">
          <h3 style="color: #4CAF50; margin-top: 0; font-size: 24px;">Welcome Aboard! 🎉</h3>
          <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align: left;">
            Hello,
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align: left;">
            Thank you for joining Nexus E-Commerce! To get started and unlock all features, we just need to quickly verify your email address.
          </p>
          
          <div style="margin: 35px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(76, 175, 80, 0.2);">
              Verify My Email
            </a>
          </div>

          <p style="color: #777777; font-size: 14px; margin-top: 20px; text-align: left;">
            <em>Note: This verification link will expire in 24 hours. If the button above doesn't work, copy and paste this URL directly into your browser:</em><br><br>
            <a href="${verificationLink}" style="color: #1a73e8; word-break: break-all;">${verificationLink}</a>
          </p>
        </div>

        <div style="padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            If you didn't create an account with Nexus E-Commerce, you can safely ignore this email.
          </p>
        </div>
        
      </div>
    `;
  } else if(purpose === 'TWO_FACTOR_AUTH'){
    subject = "Your Two-Factor Authentication Code";
    text = `Your Two-Factor Authentication (2FA) code is: ${data}\n\nPlease use this code to complete your login. This code is valid for 5 minutes.\n\nIf you did not request this code, please secure your account immediately.`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
        <h2 style="color: #333; text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Login Verification</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">You are attempting to log in to your account. Please use the following Two-Factor Authentication (2FA) code to complete your login process:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #4A90E2; letter-spacing: 5px; padding: 15px 25px; background-color: #F4F6F8; border-radius: 8px; border: 1px dashed #4A90E2;">
            ${data}
          </span>
        </div>
        
        <p style="font-size: 15px; color: #555;">This code is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
        
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 25px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.5;">
          If you did not initiate this login request, your password may be compromised. Please ignore this email and change your password immediately.
        </p>
      </div>
    `;
  }else if (purpose === 'SECURE_ACCOUNT') {
 

 subject = '🚨 Security Alert: Your Password Was Changed';
  
  
  text = `Hello,\n\nYour account password was recently changed.\n\nIf you made this change, you can safely ignore this email.\n\nHowever, if you did NOT make this change, your account is at risk. Please click the link below immediately to lock your account, log out of all devices, and secure your data:\n\n${data}\n\nFor your security, this recovery link will expire in 15 minutes.\n\nRegards,\nNexus E-Commerce Security Team`;

  
  html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
      
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <h2 style="color: #333333; margin: 0;">Nexus E-Commerce</h2>
      </div>

      <div style="padding: 20px 0;">
        <h3 style="color: #D32F2F; margin-top: 0;">🚨 Security Alert: Password Changed</h3>
        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
          Hello,
        </p>
        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
          We are writing to let you know that the password for your account was recently changed. 
        </p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-size: 15px;">
            <strong>✅ If this was you:</strong> You can safely ignore this email. No further action is required.
          </p>
        </div>

        <div style="background-color: #FFF3F3; padding: 15px; border-left: 4px solid #D32F2F; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-size: 15px;">
            <strong>❌ If you did NOT change your password:</strong> Your account may be compromised. Click the button below immediately to freeze your account and log out of all active devices.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data}" style="background-color: #D32F2F; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
            Secure My Account Now
          </a>
        </div>

        <p style="color: #777777; font-size: 14px; margin-top: 20px;">
          <em>Note: For your security, this emergency link will expire in 15 minutes. If the button doesn't work, copy and paste this URL into your browser:</em><br>
          <a href="${data}" style="color: #1a73e8; word-break: break-all;">${data}</a>
        </p>
      </div>

      <div style="padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          This is an automated security message from Nexus E-Commerce. Please do not reply to this email.
        </p>
      </div>
      
    </div>
  `;
}

  const info = await transporter.sendMail({
    from: process.env.SENDGRID_FROM,
    to : to,
    subject,
    text,
    html
  });


  return true;
  }catch(error){
    console.error("There's some error sending email !", error.message);
    return false;
  }
  
  
};

