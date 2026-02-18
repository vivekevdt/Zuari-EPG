import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: "vivek.kumar@adventz.com",
        pass: "Welcome@1234",
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
});

const sendWelcomeEmail = async (user, plainPassword) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: 'Welcome to Zuari HR Chatbot - Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                    <h2 style="color: #003366;">Welcome to Zuari HR Chatbot!</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your account has been successfully created. You can now access the HR Chatbot portal.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
                        <h3 style="margin-top: 0; color: #495057;">Your Login Credentials</h3>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${plainPassword}</p>
                        <p style="margin: 5px 0;"><strong>Entity:</strong> ${user.entity}</p>
                        <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role}</p>
                    </div>

                    <p>Please login and change your password immediately for security purposes.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6c757d;">This is an automated message. Please do not reply to this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // We return null but catch/log error so user creation is not rolled back just because email failed
        return null;
    }
};

export default {
    sendWelcomeEmail
};
