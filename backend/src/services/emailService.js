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

        const isSuperAdmin = user.roles && user.roles.includes('superAdmin');

        // Note: It's better not to send plaintext passwords in an automated email if possible, 
        // however since this is the only way for the super admin to receive their initial auto-generated password
        // we'll include it here. In a production app it's better to send a secure setup link.
        const passwordLine = (isSuperAdmin && user.temporaryPassword) 
            ? `<p style="margin: 5px 0;"><strong>Initial Password:</strong> <code style="background:#e9ecef;padding:2px 6px;border-radius:4px">${user.temporaryPassword}</code></p>` 
            : '';

        const loginInstructions = isSuperAdmin 
            ? `<p>Please log in using your email and the initial password provided above at the Super Admin portal.</p>
               <p style="text-align: center; margin: 30px 0;">
                   <a href="${APP_URL}/superadmin/login" style="background-color: #3B82F6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Super Admin Portal</a>
               </p>
               <p style="text-align: center; margin-bottom: 30px; font-size: 14px;">
                   Or visit: <a href="${APP_URL}/superadmin/login" style="color: #1A3673;">${APP_URL}/superadmin/login</a>
               </p>`
            : `<p>You can securely log in using your company Microsoft account via Single Sign-On (SSO).</p>
               <p style="text-align: center; margin: 30px 0;">
                   <a href="${APP_URL}" style="background-color: #3B82F6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log In to AskHR</a>
               </p>
               <p style="text-align: center; margin-bottom: 30px; font-size: 14px;">
                   Or visit: <a href="${APP_URL}" style="color: #1A3673;">${APP_URL}</a>
               </p>`;

        const mailOptions = {
            from: config.SMTP_FROM,
            to: user.email,
            subject: 'Welcome to AskHR - Your Access is Ready',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                            <tr>
                                <td align="center" valign="middle" style="background-color:#1A3673; border-radius:8px; width:40px; height:40px;">
                                    <img src="https://api.iconify.design/lucide/message-square.svg?color=white" alt="AskHR" width="22" height="22" style="display:block; margin:0 auto;" />
                                </td>
                                <td align="left" valign="middle" style="padding-left: 10px;">
                                    <span style="font-size: 26px; font-weight: bold; color: #1A3673; font-family:Arial,sans-serif; letter-spacing: -0.5px;">AskHR</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <h2 style="color: #1A3673; margin-top: 0;">Welcome aboard!</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your account has been successfully set up, and you now have access to the AskHR portal.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
                        <h3 style="margin-top: 0; color: #495057; font-size: 16px;">Account Details</h3>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 5px 0;"><strong>Entity:</strong> ${entityDisplay}</p>
                        <p style="margin: 5px 0;"><strong>Role:</strong> ${rolesDisplay}</p>
                        ${passwordLine}
                    </div>

                    ${loginInstructions}
                    
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
