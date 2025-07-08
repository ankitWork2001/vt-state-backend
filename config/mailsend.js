import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config(); 

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'wittyvishnu6@gmail.com',
        pass: process.env.SMTP_PASS,
    },
         
});
export async function sendEmail(to, subject, message) {
    try {
        const mailOptions = {
            from: '"Witty Vishnu" <wittyvishnu6@gmail.com>', 
            to: to,
            subject: subject,
            html: `<p>${message}</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
