const bcrypt = require("bcrypt");
const User = require("../model/user.js");
const jwtconfig = require("../config/config")
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
const { ObjectId } = require("mongodb");
const usersconfig = require("../utils/user.js");
const passwordconfig = require("../utils/password.js");
const constant = require("../config/constant.js");
const mailer_template = require("../utils/mailer_template.js");
const sendemail = require("../utils/mailer.js");
const sendOTP = require("../utils/sms_sender.js");
const sms_template = require("../utils/sms_template.js");
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const Admin = require("../model/admin.js");
const { response } = require("express");
const saltRounds = 10; 
const Rating = require("../model/rating.js")

const resendOtpEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by userId
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Generate a new OTP
    const otp = usersconfig.generateOTP();

    // Update the user's OTP and OTP generation time in the database
    user.otp = otp;
    user.otpGeneratedAt = new Date(); // Update the OTP generation time
    await user.save();

    // Create the email content for resetting OTP
    const mail_body = mailer_template.resendOtpBody(user);
    const mail_subject = mailer_template.resendOtpSubject();

    // Send the new OTP to the user via email
    sendemail(user.email, mail_subject, mail_body);

    return res.status(200).json({ message: "OTP reset successfully", success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

const resendOtpMobile = async (req, res) => {
  const mobile_number = req.body.mobile_number;

  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ mobile_number });

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Generate a new OTP
    const otp = usersconfig.generateOTP();

    // Update the user's OTP in the database
    user.otp = otp;
    await user.save();

    // Create the email content for resending OTP
    const sms_body = sms_template.getResendOtpMessage(user);

    // Send the new OTP to the user via email
    sendOTP(mobile_number, sms_body,otp);

    return res.status(200).json({ message: "OTP resent successfully", success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
const signup = async (req, res) => {

  try {
    const login_type = req.body.login_type;
    let response = null; // Initialize response as null
    switch (login_type) {
      case constant.EMAIL:
        response = await signupWithEmail(req.body); // Await the signupWithEmail function
        break;
      case constant.MOBILE:
        response = await signupWithMobile(req.body);
        break;
      case constant.GOOGLE:
        response = await signupWithGoogle(req.body);
        break;
      case constant.FACEBOOK:
        response = await signupWithFacebook(req.body);
        break;
      default:
        return res.status(400).json({ message: "Undefined login_type", success: false });
    }
    // Check if response contains an error message
    if (response.error) {
      return res.status(400).json({ message: response.error, success: false });
    }
    // If everything is successful, return the response
    return res.status(201).json({ message: "User registered successfully", success: true, ...response });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

const signupWithGoogle = async (data) => {
  try {
    const { tokenId } = data;

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email} = payload;

    // Check if the user with the provided email already exists in the database
    let user = await User.findOne({ email });
    const user_id = usersconfig.generateUserId();

    // If user does not exist, create a new user
    if (!user) {
      const newUser = new User({
        email,
        account_activated: true,
        password: "googleauth-system",
        user_id                            // Google login automatically activates account
      });

      // Save the new user
      user = await newUser.save();

      // Generate a token for the new user
      const token = usersconfig.generateToken(user._id);

      // Send a welcome email (optional)
      const mail_body = mailer_template.loginBody(user);
      const mail_subject = mailer_template.loginSubject();
      sendemail(email, mail_subject, mail_body);

      // Return success response with token and user data
      return { token, savedUser:user, message: 'User registered and logged in successfully' };
    }

    // If user exists, generate a token for the existing user
    const token = usersconfig.generateToken(user._id);

    // Return success response with token and user data
    return { token,savedUser:user, message: 'User logged in successfully' };
  } catch (error) {
    console.error('Error:', error);
    return { error: 'Internal server error', success: false };
  }
};
const signupWithFacebook = async (data) => {
  try {
      const { accessToken, userFbID, userEmail } = data;

      // Fetch user data from Facebook using the provided access token and user ID
      const res = await fetch(
          `https://graph.facebook.com/v14.0/${userFbID}?fields=id,first_name,last_name,email&access_token=${accessToken}`
      );
      const json = await res.json();

      // Check if the user's Facebook ID matches the provided userFbID
      if (json.id === userFbID) {
          // Check if a user with the provided email already exists in the database
          let user = await User.findOne({ email: json.email });

          if (user) {
              // If the user exists, update their information
              user.firstName = json.first_name;
              user.email = json.email;
              user.facebookID = json.id;
              user.email_verified = true; // Assuming Facebook login automatically verifies email
              user.account_activated = true; // Assuming Facebook login automatically activates account
              await user.save();

              // Generate JWT token for the user
              const token = usersconfig.generateToken(user._id);

              // Send welcome email to the user
              const mail_body = mailer_template.loginBody(user);
              const mail_subject = mailer_template.loginSubject();
              sendemail(user.email, mail_subject, mail_body);

              // Return success response with token and user data
              return {
                  message: "User logged in successfully",
                  success: true,
                  code: 200,
                  token,
                  data: {
                      userId: user.user_id,
                      _id: user._id,
                      userEmail: user.email,
                      fullName: `${json.first_name} ${json.last_name}`,
                  },
              };
          } else {
            const user_id = usersconfig.generateUserId();

              // If the user does not exist, create a new user
              user = await User.create({
                  firstName: json.first_name,
                  email: json.email,
                  facebookID: json.id,
                  email_verified: true, // Assuming Facebook login automatically verifies email
                  account_activated: true, // Assuming Facebook login automatically activates account
                  password: "facebookauth-system",
                  user_id  // No password for Facebook login
              });

              // Generate JWT token for the new user
              const token = usersconfig.generateToken(user._id);

              // Send welcome email to the user
              const mail_body = mailer_template.welcomeEmail(user);
              const mail_subject = mailer_template.welcomeSubject();
              sendemail(user.email, mail_subject, mail_body);

              // Return success response with token and user data
              return {
                  message: "User registered and logged in successfully",
                  success: true,
                  code: 200,
                  token,
                  data: {
                      _id: user._id,
                      userEmail: user.email,
                      fullName: `${json.first_name} ${json.last_name}`,
                  },
              };
          }
      } else {
          // If the user's Facebook ID does not match the provided userFbID
          return {
              message: "You are not authorized!",
              success: false,
              code: 401,
          };
      }
  } catch (error) {
      // If an error occurs during the process
      console.log({ error });
      return {
          message: "Something went wrong!",
          success: false,
          code: 500,
          data: error,
      };
  }
};


const signupWithEmail = async (data) => {
  try {
    const { email, password, firstName, lastName, country, gender, dob, location, field_expertise, availability, mobile_number } = data; // Make sure to include the necessary fields

    if (!email) {
      return { error: "Email is required" };
    }

    // Check if a user with the provided email already exists in the database
    const existingUser = await User.findOne({ email }).populate('country');

    if (existingUser) {
      // If the user exists, update their OTP and check if the account is activated
      const otp = usersconfig.generateOTP();
      existingUser.otp = otp;
      existingUser.otpGeneratedAt = new Date();
      await existingUser.save();

      if (existingUser.account_activated === true) {
        // If the account is activated, return the new OTP and user
        try {
          const passwordMatch = await bcrypt.compare(password, existingUser.password);
          if (!passwordMatch) {
            return { message: 'Authentication failed', success: false };
          }
          // Continue with successful authentication logic
        } catch (error) {
          console.error('Error comparing passwords:', error);
          return { message: 'Please enter the correct password', success: false };
        }

        const token = usersconfig.generateToken(existingUser._id);
        const user = existingUser;
        const mail_body = mailer_template.loginBody(user);
        const mail_subject = mailer_template.loginSubject();
        sendemail(email, mail_subject, mail_body);

        return { user_id: existingUser.user_id, token, savedUser: existingUser, otp };
      } else {
        // If the account is not activated, delete the existing user and create a new one
        await User.deleteOne({ _id: existingUser._id }); // Remove the existing user

        // Create a new user
        const user_id = usersconfig.generateUserId();
        const hashedPassword = await passwordconfig.getEncryptPassword(password);
        const newUser = new User({
          user_id,
          firstName,
          lastName,
          email,
          password: hashedPassword,
          otp,
          otpGeneratedAt: new Date(),
          country,
          gender,
          dob,
          location,
          field_expertise,
          availability,
          mobile_number
        });

        // Save the new user
        const savedUser = await newUser.save();

        // Use the resendOTP function to send a new OTP to the newly created user
        const resendOtpResult = await resendOtpEmail(req, res, newUser); // Pass newUser to resendOtpEmail function
        if (resendOtpResult.success) {
          return { user_id: newUser.user_id, ...resendOtpResult, success: true };
        } else {
          return resendOtpResult; // Return the result from the resendOTP function
        }
      }
    } else {
      // If the user does not exist, proceed with signup
      const user_id = usersconfig.generateUserId();
      const otp = usersconfig.generateOTP();
      const otpGeneratedAt = new Date();
      const hashedPassword = await passwordconfig.getEncryptPassword(password);

      const newUser = new User({
        user_id,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        otp,
        otpGeneratedAt,
        country,
        gender,
        dob,
        location,
        field_expertise,
        availability,
        mobile_number
      });

      const mail_body = mailer_template.signUpBody(newUser);
      const mail_subject = mailer_template.signUpSubject();
      sendemail(email, mail_subject, mail_body);

      const savedUser = await newUser.save();

      // Return the new OTP, user, and success message
      const token = usersconfig.generateToken(newUser._id);
      const detoken = jwt.decode(token);
      return { user_id, detoken, token, savedUser, otp, message: "User registered successfully", success: true };
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: "Internal server error", success: false };
  }
};



const signupWithMobile = async (data) => {
  try {
    const { mobile_number } = data; // Make sure to include the 'mobile_number' field

    if (!mobile_number) {
      return { error: "Mobile number is required" };
    }

    // Check if a user with the provided mobile number already exists in the database
    const existingUser = await User.findOne({ mobile_number });

    if (existingUser) {
      // If the user exists, update their OTP and check if the account is activated
      const otp = usersconfig.generateOTP();
      existingUser.otp = otp;
      await existingUser.save();

      if (existingUser.account_activated === true) {
        // If the account is activated, return the new OTP and user
        const token = usersconfig.generateToken(existingUser._id);
        const user = existingUser;

        // Send SMS with the new OTP
        const sms_body = sms_template.getLoginMessage(user);
        sendOTP(mobile_number, sms_body);

        return { user_id: existingUser.user_id, token, savedUser: existingUser, otp };
      } else {
        // If the account is not activated, use the resendOTP function to send a new OTP to the existing user
        const resendOtpResult = await resendOtpMobile(existingUser);
        if (resendOtpResult.success) {
          return { user_id: existingUser.user_id, ...resendOtpResult, success: true };
        } else {
          return resendOtpResult; // Return the result from the resendOTP function
        }
      }
    } else {
      // If the user does not exist, proceed with signup
      const { firstName, lastName, mobile_number, password } = data;
      const user_id = usersconfig.generateUserId();
      const otp = usersconfig.generateOTP();

      // Use the password utility to hash the password
      const hashedPassword = await passwordconfig.getEncryptPassword(password);

      const newUser = new User({
        user_id,
        firstName,
        lastName,
        mobile_number,
        password: hashedPassword,
        otp,
      });

      // Send SMS with the new OTP
      const sms_body = sms_template.getSignupMessage(newUser);
      sendOTP(mobile_number, sms_body);

      const savedUser = await newUser.save();

      // Return the new OTP, user, and success message
      const token = usersconfig.generateToken(newUser._id);
      return { user_id, token, savedUser, otp, message: "User registered successfully", success: true };
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: "Internal server error", success: false };
  }
};

const verifyOTP = async (req, res) => {
  try {
    const otp_type = req.body.otp_type;
    let response = null; // Initialize response as null
    switch (otp_type) {
      case constant.EMAIL:
        response = await verifiedWithEmail(req.body); // Await the signupWithEmail function
        break;
      case constant.MOBILE:
        response = await verifiedWithMobile(req.body);
        break;
      case constant.LOGIN:
        response = await loginVerifyOTP(req.body);
        break;
      default:
        return res.status(400).json({ message: "Undefined verified_type", success: false });
    }
    // Check if response contains an error message
    if (response.error) {
      return res.status(400).json({ message: response.error, success: false });
    }
    // If everything is successful, return the response
    return res.status(201).json({ message: "token verified successfully", success: true, ...response });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }

};

const verifiedWithEmail = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.account_activated) {
      return res
        .status(400)
        .json({ message: "User is already activated", success: false });
    }

    if (user.otp === otp) {
      user.account_activated = true;  //account activate true when user enter correct otp
      user.email_verified = true; //account email_verified true when user verified email 
      await user.save();
      return res.status(200).json({
        message: "Account Verified And activated successfully  ",
        success: true,
        user: user,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid OTP or User ID", success: false });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const verifiedWithMobile = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.account_activated) {
      return res
        .status(400)
        .json({ message: "User is already activated", success: false });
    }

    if (user.otp === otp) {
      user.account_activated = true;  //account activate true when user enter correct otp
      user.mobile_number_verified = true; //account mobile_verified true when user verified phonenumber 
      await user.save();
      return res.status(200).json({
        message: "Account Verified And activated successfully  ",
        success: true,
        user: user,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid OTP or User ID", success: false });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const loginVerifyOTP = async (req, res) => {

  try {

    const { otp, userId, verify_type } = req.body;
    const user = await User.findOne({ user_id: userId });
    console.log("user",user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (verify_type === "signup") {
      // Verify OTP for signup process
      const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds
      if (user.otp === otp) {
        const otpTimestamp = user.otpGeneratedAt.getTime(); // Get the OTP generation time in milliseconds
        const currentTimestamp = new Date().getTime(); // Get the current time in milliseconds
      
        if (currentTimestamp - otpTimestamp > otpExpirationTime) {
          // OTP has expired
          return res.status(400).json({
            message: "OTP has expired",
            success: false,
          });
        }
      
        // OTP is valid and not expired
        user.account_activated = true;
        await user.save();
        // After successful OTP verification, create a new token
        const token = usersconfig.generateToken(user._id);
        return res.status(200).json({
          message: "Account login successfully",
          success: true,
          token,
          savedUser: user,
        });
      } else {
        return res.status(400).json({
          message: "Invalid OTP or User ID",
          success: false,
        });
      }
    } else 
    
       if (verify_type === "resetpassword") {
      // Verify OTP for password reset process
      const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds

      if (user.otp === otp) {
        const otpTimestamp = user.otpGeneratedAt.getTime(); // Get the OTP generation time in milliseconds
        const currentTimestamp = new Date().getTime(); // Get the current time in milliseconds
           console.log(currentTimestamp);
        if (currentTimestamp - otpTimestamp > otpExpirationTime) {
          // OTP has expired

          return res.status(400).json({
            message: "OTP has expired",
            success: false,
          });
        }
      
        // OTP is valid and not expired
        user.change_password = true;
        await user.save();
        // After successful OTP verification, create a new token
        //const token = usersconfig.generateToken(user._id);
        return res.status(200).json({
          message: "reset password otp verify...",
          success: true,
          savedUser: user,
        });
      } else {
        return res.status(400).json({
          message: "Invalid OTP or User ID",
          success: false,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
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

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Generate OTP
    const otp =  usersconfig.generateOTP(); // Implement your OTP generation function here
    const otpGeneratedAt = new Date();

    // Update user's OTP
    user.otp = otp;
    user.otpGeneratedAt = otpGeneratedAt;
    await user.save();

    // Send OTP to user's email
    const mail_body = mailer_template.forgetPassword(user);
    const mail_subject = mailer_template.forgetSubject();
    sendemail(email, mail_subject, mail_body);


    return res.status(200).json({ message: "OTP sent to the user's email", success: true , user: user});
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};


const changePassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    // Find the user by userId
    const user = await User.findOne({ user_id: userId });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check if the user is allowed to change the password
    if (!user.change_password) {
      return res.status(403).json({ message: "User is not allowed to change password", success: false });
    }

    // Check if the new password matches the confirmation password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match", success: false });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    user.password = hashedNewPassword;
    // Save the updated user
    await user.save();

    return res.status(200).json({ message: "Password changed successfully", success: true });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};



const updateProfile = async (req, res) => {
  try {
    const {token, newProfileData } = req.body;
    const user_id = usersconfig.decodeToken(token);
    await User.findByIdAndUpdate(user_id, newProfileData);

    return res
      .status(200)
      .json({ message: "Profile updated successfully", success: true });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};






  
const getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find ratings where the user is the expert
    const ratings = await Rating.find({ expert: userId }).populate('client');

    return res.json({
      data: {
        user,
        ratings
      },
      message: "User profile",
      success: true,
      statuscode: 200
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: error.message, success: false, statuscode: 500 });
  }
};
const updateUser = async (request, response) => {
  try {
    const user = await User.findById(request.params.id); // Adjust 'location' to match your schema
    console.log("user",user);
    if (!user) {
      return response.json({
        message: "user not found",
        success: false,
        statuscode: 404,
        user: user
      });
    }

    Object.assign(user, request.body);

    const updatedUser = await user.save();
    const populatedUser = await User.findById(updatedUser._id); // Populate 'location' after saving

    return response.json({
      message: "success",
      success: true,
      data: populatedUser,
      statuscode: 200,
    });
  } catch (error) {
    console.log("error", error.message);

    return response
      .json({ message: error.message, success: false, statuscode: 500 })
      .status(500);
  }
};


const getAllUser = async (request, response) => {
  try {
      const page = parseInt(request.query.page) || 1;
      const limit = parseInt(request.query.limit) || 10;
      const skip = (page - 1) * limit;

      const user = await User.find()
          .skip(skip)
          .limit(limit);

      const totalusers = await User.countDocuments();

 

      return response.json({
          data: user,
          totalusers: totalusers,
          statuscode:200,
          message:"all user data"
      });

  } catch (error) {
      console.error(error);
      return response.status(500).send('Internal Server Error');
  }
};

const searchUser = async (request, response) => {
  try {
    const query = request.query.q; // Get the search query from request query parameters

    // Search for users based on partial matches in firstName, email, and mobile_number fields
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } }, // Case-insensitive search for firstName
        { email: { $regex: query, $options: 'i' } }, // Case-insensitive search for email
        { mobile_number: { $regex: query, $options: 'i' } }, // Case-insensitive search for mobile_number
      ],
    }).lean();

    return response.json({ data: users });
  } catch (error) {
    console.log("error", error.message);

    return response
      .json({ message: error, success: false, statuscode: 500 })
      .status(500);
  }
};
const deleteUser = async (request, response) => {
  try {
    const user = await User.find({
      _id: new ObjectId(request.params.id),
    }).lean();

    if (!user || user.length === 0) {
      return response.json({
        message: "user not found",
        success: false,
        statuscode: 404,
      });
    }

    await User.deleteOne({ _id: new ObjectId(request.params.id) });

    return response.json({
      message: "deleted succsfull",
      success: true,
      data: user,
      statuscode: 200,
    });
  } catch (error) {
    console.log("error", error.message);

    return response
      .json({ message: error, success: false, statuscode: 500 })
      .status(500);
  }
};

module.exports = {
  signup,
  resendOtpEmail,
  verifyOTP,
  updateProfile,
  changePassword,
  forgotPassword,
  loginVerifyOTP,
  resendOtpMobile,
  getUser,
  updateUser,
  getAllUser,
  searchUser,
  deleteUser
};
