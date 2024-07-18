const nodemailer = require('nodemailer');
const logger = require("../logger");

// Create a transporter using the default SMTP transport with provided credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',  // Use the provided Gmail username
    pass: ''   // Use the provided Gmail password
  }
});

async function vacanciesMail(formData) {
  try {
    // Compose email details using data from the Mongoose model
    const mailOptions = {
      from: '',  // Use the provided "From" address
      // to: 'shdfchomeloans@gmail.com, info@shubham.co, lead.shubham@gmail.com, shubham@mailbox.cratiocrm.com, harshit.mehrotra@shubham.co',   // Use the provided "To" address recruitment@shubham.co
      to: '',
      
      
      subject: 'New Vacancies Form Submission',
      html: `
        <h2>New Vacancies Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Contact:</strong> ${formData.phoneNumber}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Current Designation:</strong> ${formData.currentCompany}</p>
        <p><strong>Current CTC:</strong> ${formData.linkedin}</p>
        <p><strong>Current Location:</strong> ${formData.portfolioLink}</p>
        <p><strong>Resume:</strong> ${formData.resume}</p>
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = vacanciesMail;
