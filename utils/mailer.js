const nodemailer = require('nodemailer');
const appSettings = require('../config/app_settings.js');
const logger = require("../logger");
 
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: appSettings.SMTP_EMAIL,  // Your Office 365 email address
        pass: appSettings.SMTP_PASSWORD  // Your Office 365 password
    }
});
 
async function sendMail(email, subject, mailBody) {
    try {
        const mailOptions = {
            from: appSettings.SMTP_EMAIL,  // Sender address
            to: email,  // List of recipients
            subject: subject,  // Subject line
            html: mailBody  // HTML body
        };
 
        const info = await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
 
module.exports = sendMail;