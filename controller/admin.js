const { request, response } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const Admin = require("../model/admin.js");
const config = require("../config/config");
const usersconfig = require("../utils/user.js");
const logger = require("../logger");
const LOG_MSG = require("../config/LOG_MSG");
const SUCCESS_MESSAGE = require("../config/SUCCESS_MESSAGE.js");
const ERROR_MSG = require("../config/ERROR_MSG.js");

const signup = async (req, res) => {
  try {
    const { firstName,lastName,email, password, phone } = req.body;

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Email already exists", success: false });
    }
    // Generate a salt (a random value)
    const saltRounds = 10;
    const adminId = usersconfig.generateUserId();

    const otp = usersconfig.generateOTP();
    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const otpGeneratedAt = new Date();

    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpGeneratedAt,
      adminId,
    });

    const savedAdmin = await newAdmin.save();

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      admin: savedAdmin,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the user with the provided email exists
//     const admin = await Admin.findOne({ email });

//     if (!admin) {
//       return res
//         .status(401)
//         .json({ message: "Authentication failed", success: false });
//     }

//     // Compare the provided password with the hashed password in the database
//     const passwordMatch = await bcrypt.compare(password, admin.password);

//     if (!passwordMatch) {
//       return res
//         .status(401)
//         .json({ message: "Authentication failed", success: false });
//     }

//     // Create a JWT token for the authenticated user
//     const token = usersconfig.generateAdminToken();
//     const decodedToken = jwt.decode(token);

//     return res
//       .status(200)
//       .json({
//         message: "Authentication successful",
//         success: true,
//         token,
//         admin: admin,
//       });
//   } catch (error) {
//     console.error("Error:", error.message);
//     return res
//       .status(500)
//       .json({ message: "Internal server error", success: false });
//   }
// };

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user with the provided email exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Authentication failed", success: false });
    }

    // Check if the account is activated
    if (!admin.account_activated) {
      return res
        .status(401)
        .json({ message: "Please activate your account", success: false });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Authentication failed", success: false });
    }

    // Create a JWT token for the authenticated user
    const token = usersconfig.generateAdminToken(admin._id);
    const decodedToken = jwt.decode(token);
    console.log(decodedToken);

    return res
      .status(200)
      .json({
        message: "Authentication successful",
        success: true,
        token,
        admin: admin,
      });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const createAdmin = async (request, response) => {
  try {
    const adminData = request.body;

    const admin = await Admin({
      ...adminData,
    }).save();

    if (!admin) {
      return response.json({
        message: "not found",
        success: false,
        statuscode: 404,
      });
    }
    return response.json({
      message: "success",
      success: true,
      data: admin,
      statuscode: 200,
    });
  } catch (error) {
    return response
      .json({ message: error, success: false, statuscode: 500 })
      .status(500);
  }
};

const getAdmin = async (request, response) => {
  try {
    const admin = await Admin.find({
      _id: new ObjectId(request.params.id),
    }).lean();

    if (!admin) {
      return response.json({ message: "admin not found" });
    }

    return response.json({ data: admin });
  } catch (error) {
    return response
      .json({ message: error, success: false, statuscode: 500 })
      .status(500);
  }
};

const getAllAdmin = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    const skip = (page - 1) * limit;

    const adminData = await Admin.find().skip(skip).limit(limit);

    const totalAdmins = await Admin.countDocuments();

    return response.json({ data: adminData, totalAdmins });
  } catch (error) {
    console.error("Error:", error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const updateAdmin = async (request, response) => {
  try {
    const admin = await Admin.findById(request.params.id);

    if (!admin) {
      return response.json({
        message: "admin not found",
        success: false,
        statuscode: 404,
      });
    }

    Object.assign(admin, request.body);

    const updatedAdmin = await admin.save();

    return response.json({
      message: "success",
      success: true,
      data: updatedAdmin,
      statuscode: 200,
    });
  } catch (error) {
    return response
      .json({ message: error, success: false, statuscode: 500 })
      .status(500);
  }
};

const deleteAdmin = async (request, response) => {
  try {
    const admin = await Admin.find({
      _id: new ObjectId(request.params.id),
    }).lean();

    if (!admin || admin.length === 0) {
      return response.json({
        message: "admin not found",
        success: false,
        statuscode: 404,
      });
    }

    await Admin.deleteOne({ _id: new ObjectId(request.params.id) });

    return response.json({
      message: "deleted successful",
      success: true,
      data: admin,
      statuscode: 200,
    });
  } catch (error) {
    return response
      .json({ message: error, success: false, statuscode: 500 })
      .status(500);
  }
};

const verifiedWithEmail = async (req, res) => {
  try {
    const { otp, adminId, verify_type } = req.body;
    const admin = await Admin.findOne({ adminId: adminId });
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    // // Check if the admin account is already activated
    // if (admin.account_activated) {
    //   return res.status(400).json({ message: "Admin is already activated", success: false });
    // }

    if (verify_type === "signup") {
      // Verify OTP for signup process
      const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds
      if (admin.otp === otp) {
        const otpTimestamp = admin.otpGeneratedAt.getTime(); // Get the OTP generation time in milliseconds
        const currentTimestamp = new Date().getTime(); // Get the current time in milliseconds

        if (currentTimestamp - otpTimestamp > otpExpirationTime) {
          // OTP has expired
          return res.status(400).json({
            message: "OTP has expired",
            success: false,
          });
        }
        // OTP is valid and not expired
        admin.account_activated = true;
        await admin.save();
        return res.status(200).json({
          message: "Account verified and activated successfully",
          success: true,
          admin: admin,
        });
      } else {
        return res
          .status(400)
          .json({ message: "Invalid OTP or Admin ID", success: false });
      }
    } else if (verify_type === "resetpassword") {
      // Verify OTP for password reset process

      const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds
      if (admin.otp === otp) {
        const otpTimestamp = admin.otpGeneratedAt.getTime(); // Get the OTP generation time in milliseconds
        const currentTimestamp = new Date().getTime(); // Get the current time in milliseconds

        if (currentTimestamp - otpTimestamp > otpExpirationTime) {
          // OTP has expired
          return res.status(400).json({
            message: "OTP has expired",
            success: false,
          });
        }

        // OTP is valid and not expired
        admin.change_password = true;

        await admin.save();
        return res.status(200).json({
          message: "Reset password OTP verified",
          success: true,
          admin: admin,
        });
      } else {
        return res
          .status(400)
          .json({ message: "Invalid OTP or Admin ID", success: false });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Invalid verify type", success: false });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    // Check if admin exists
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    // Generate OTP
    const otp = usersconfig.generateOTP();
    const otpGeneratedAt = new Date();

    // Update admin's OTP and OTP generation timestamp
    admin.otp = otp;
    admin.otpGeneratedAt = otpGeneratedAt;
    await admin.save();

    // Send OTP to admin's email
    const mail_body = mailer_template.forgetPassword(admin);
    const mail_subject = mailer_template.forgetSubject();
    sendemail(email, mail_subject, mail_body);

    return res
      .status(200)
      .json({
        message: "OTP sent to the admin's email",
        success: true,
        admin: admin,
      });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const changePassword = async (req, res) => {
  try {
    const { adminId, newPassword, confirmPassword } = req.body;

    // Find the admin by adminId
    const admin = await Admin.findOne({ adminId });

    if (!admin.change_password) {
      return res
        .status(401)
        .json({ message: "Please Verify Your otp first", success: false });
    }

    // Check if the admin exists
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    // Check if the new password matches the confirmation password
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({
          message: "New password and confirm password do not match",
          success: false,
        });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update admin's password
    admin.password = hashedNewPassword;
    // Save the updated admin
    await admin.save();

    return res
      .status(200)
      .json({ message: "Password changed successfully", success: true });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const resendOtpEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the admin by adminId
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    // Generate a new OTP
    const otp = usersconfig.generateOTP();

    // Update the admin's OTP and OTP generation time in the database
    admin.otp = otp;
    admin.otpGeneratedAt = new Date(); // Update the OTP generation time
    await admin.save();
    const user = admin;
    // Create the email content for resetting OTP
    const mail_body = mailer_template.resendOtpBody(user);
    const mail_subject = mailer_template.resendOtpSubject();

    // Send the new OTP to the admin via email
    sendemail(user.email, mail_subject, mail_body);

    return res
      .status(200)
      .json({ message: "OTP reset successfully", success: true, user: user });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  createAdmin,
  getAdmin,
  getAllAdmin,
  updateAdmin,
  deleteAdmin,
  signup,
  login,
  verifiedWithEmail,
  forgotPassword,
  changePassword,
  resendOtpEmail,
};
