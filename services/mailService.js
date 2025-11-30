import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
});

export const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'p2pedusrilanka@gmail.com',
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  };
  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
};

export default transporter;
