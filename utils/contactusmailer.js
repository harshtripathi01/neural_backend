const nodemailer = require('nodemailer');
const logger = require("../logger");

// Create a transporter using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'leadshubham2022@gmail.com',  // Use your PHP mailer's username
    pass: 'zkreujsodmnwxmat'            // Use your PHP mailer's password
  }
});

async function contactusMail(formData) {
  try {
    // Compose email details using data from the Mongoose model
    const mailOptions = {
      from: 'Lead shubham <leadshubham2020@gmail.com>',  // Use your desired "From" address
      to: 'saransh24@gmail.com',                        // Use your desired "To" address
      subject: 'New Partner Form Submission',
      html: `
        <h2>New Partner Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Contact:</strong> ${formData.contact}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Address:</strong> ${formData.subject}</p>
        <p><strong>Address:</strong> ${formData.message}</p>
        
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = contactusMail;
