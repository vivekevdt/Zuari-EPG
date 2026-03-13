import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import config from "../config/env.js";
import Entity from '../models/Entity.js';
dotenv.config();
const APP_URL = config.API_URL;



const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.office365.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: config.SMTP_FROM,
            pass: config.SMTP_PASSWORD
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });
};

const sendWelcomeEmail = async (user) => {
    try {
        let entityDisplay = 'N/A';
        if (user.entity) {
            if (user.entity.name) {
                entityDisplay = `${user.entity.name} (${user.entity.entityCode})`;
            } else {
                try {
                    const entityDoc = await Entity.findById(user.entity).select('name entityCode');
                    if (entityDoc) entityDisplay = `${entityDoc.name} (${entityDoc.entityCode})`;
                } catch (_) { entityDisplay = user.entity.toString(); }
            }
        }

        const rolesDisplay = (user.roles && user.roles.length > 0)
            ? user.roles.join(', ')
            : 'Employee';

        const mailOptions = {
            from: config.SMTP_FROM,
            to: user.email,
            subject: 'Welcome to AskHR - Your Access is Ready',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1A3673;">Welcome to AskHR!</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your account has been successfully set up, and you now have access to the AskHR portal.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
                        <h3 style="margin-top: 0; color: #495057; font-size: 16px;">Account Details</h3>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 5px 0;"><strong>Entity:</strong> ${entityDisplay}</p>
                        <p style="margin: 5px 0;"><strong>Role:</strong> ${rolesDisplay}</p>
                    </div>

                    <p>You can securely log in using your company Microsoft account via Single Sign-On (SSO).</p>

                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${APP_URL}" style="background-color: #3B82F6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log In to AskHR</a>
                    </p>
                    <p style="text-align: center; margin-bottom: 30px; font-size: 14px;">
                        Or visit: <a href="${APP_URL}" style="color: #1A3673;">${APP_URL}</a>
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6c757d;">This is an automated message. Please do not reply to this email.</p>
                </div>
            `
        };

        const transporter = getTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return null; // Return null so user creation isn't rolled back
    }
};

export default {
    sendWelcomeEmail
};
