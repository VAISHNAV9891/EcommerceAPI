import nodemailer from 'nodemailer';
import 'dotenv/config';



export const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 2525,
  secure: false,
  auth: {
    user: "apikey", 
    pass: process.env.SENDGRID_API_KEY,
  },
});


export const sendMailService = async (data, to, purpose) => {
  
  try{
    let subject, text, html;

  if(purpose === 'RESET_PASSWORD') {
    subject = "Password Reset Request";
    text = `Click here to reset your password: ${data}`;
    html = `<p>Click here to reset your password:</p><a href="${data}">${data}</a>`;
  } else if(purpose === 'EMAIL_VERIFY') {
    subject = "Email Verification";
    text = `Click here to verify your email: ${data}`;
    html = `<p>Click here to verify your email:</p><a href="${data}">${data}</a>`;
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

