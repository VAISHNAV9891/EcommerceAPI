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


export const sendMailService = async (link, to, purpose) => {
  
  try{
    let subject, text, html;

  if(purpose === 'RESET_PASSWORD') {
    subject = "Password Reset Request";
    text = `Click here to reset your password: ${link}`;
    html = `<p>Click here to reset your password:</p><a href="${link}">${link}</a>`;
  } else if(purpose === 'EMAIL_VERIFY') {
    subject = "Email Verification";
    text = `Click here to verify your email: ${link}`;
    html = `<p>Click here to verify your email:</p><a href="${link}">${link}</a>`;
  }

  const info = await transporter.sendMail({
    from: process.env.SENDGRID_FROM,
    to : to,
    subject,
    text,
    html
  });


  console.log("Mail sent:", info.messageId);
  return true;
  }catch(error){
    console.error("There's some error sending email !", error.message);
    return false;
  }
  
  
};

