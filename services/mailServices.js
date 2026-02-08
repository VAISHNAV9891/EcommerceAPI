import nodemailer from 'nodemailer';
import 'dotenv/config';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendMailService = async (link, to, purpose) => {
  let subject, text, html;
  console.log(process.env.MAIL_USER);
  console.log(process.env.MAIL_PASS);
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
    from: process.env.MAIL_USER,
    to : to,
    subject,
    text,
    html
  });

  console.log("Message sent:", info.messageId);
};

