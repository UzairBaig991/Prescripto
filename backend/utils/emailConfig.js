import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service (e.g., Gmail, SendGrid, etc.)
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const sendDoctorWelcomeEmail = async (doctorEmail, doctorName, password) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: doctorEmail,
        subject: 'Welcome to Our Platform - Doctor Account Created',
        html: `
            <h3>Hello Dr. ${doctorName},</h3>
            <p>Your doctor account has been successfully created on our platform.</p>
            <p><strong>Email:</strong> ${doctorEmail}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please log in to the platform and change your password for security purposes.</p>
            <p>Best regards,<br/>Your Platform Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${doctorEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        return false;
    }
};

export { sendDoctorWelcomeEmail };