const bcrypt = require("bcrypt");
const User = require("../model/user.js");
const config = require("../config/config.js");
const usersconfig = require("../utils/user.js");
const passwordconfig = require("../utils/password.js");
const constant = require("../config/constant.js");
const mailer_template = require("../utils/mailer_template.js");
const sendemail = require("../utils/mailer.js");
const sendOTP = require("../utils/sms_sender.js");
const sms_template = require("../utils/sms_template.js");
const user = require("../model/user.js");
// const PaymentDetails = require("../model/paymentDetails.js");
// const Address = require("../model/address.js");
const logger = require("../logger");
const { response } = require("express");
// const { findByIdAndUpdate } = require("../model/proposals.js");
const ERROR_MSG = require("../config/ERROR_MSG.js");
const crypto = require("crypto");
const { INVITE_STATUS } = require("../config/constant.js");
const SUCCESS_MESSAGE = require("../config/SUCCESS_MESSAGE.js");
const LOG_MSG = require("../config/LOG_MSG");
// const JobTitle = require("../model/jobTitle.js");
const slugify = require("slugify");
const saltRounds = 10;





const resendOtpEmail = async (req, res) => {
  const email = req.body.email;

  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: ERROR_MSG.USER.INVALID_USER, success: false });
    }

    // Generate a new OTP
    const otp = usersconfig.generateOTP();

    // Update the user's OTP in the database
    user.otp = otp;
    user.otpGeneratedAt = new Date(); // Set otpGeneratedAt to the current time
    await user.save();

    // Create the email content for resending OTP
    const mail_body = mailer_template.resendOtpBody(user, otp);
    const mail_subject = mailer_template.resendOtpSubject();

    // Send the new OTP to the user via email
    sendemail(email, mail_subject, mail_body);

    return res
      .status(200)
      .json({ message: SUCCESS_MESSAGE.USER.OTP_SUCCESSFUL, success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: error, success: false });
  }
};

const resendOtpMobile = async (req, res) => {
  const mobile_number = req.body.mobile_number;

  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ mobile_number });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Generate a new OTP
    const otp = usersconfig.generateOTP();

    // Update the user's OTP in the database
    user.otp = otp;
    await user.save();

    // Create the email content for resending OTP
    const sms_body = sms_template.getResendOtpMessage(user);

    // Send the new OTP to the user via email
    sendOTP(mobile_number, sms_body, otp);

    return res
      .status(200)
      .json({ message: "OTP resent successfully", success: true });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
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
        return res
          .status(400)
          .json({
            message: ERROR_MSG.USER.UNDEFINED_LOGIN_TYPE,
            success: false,
          });
    }

    // Check if response contains an error message
    if (response.error) {
      return res.status(400).json({ message: response.error, success: false });
    }

    // Determine the correct HTTP status code to return
    const statusCode = response.statuscode || 201; // Default to 201 Created if not specified

    // If everything is successful, return the response
    return res.status(statusCode).json({
      message: response.message || SUCCESS_MESSAGE.USER.USER_REGISTERED,
      success: response.success !== undefined ? response.success : true,
      ...response,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
  }
};


const login = async (req, res) => {
  try {
    const login_type = req.body.login_type;
    let response = null; // Initialize response as null
    switch (login_type) {
      case constant.EMAIL:
        response = await loginWithEmail(req.body); // Await the loginWithEmail function

        break;
      case constant.MOBILE:
        response = await loginWithMobile(req.body);
        break;
      case constant.GOOGLE:
        response = await loginWithGoogle(req.body);
        break;
      case constant.FACEBOOK:
        response = await loginWithFacebook(req.body);
        break;
      default:
        return res
          .status(400)
          .json({
            message: ERROR_MSG.USER.UNDEFINED_LOGIN_TYPE,
            success: false,
          });
    }
    // Check if response contains an error message
    if (response.error) {
      return res.status(400).json({ message: response.error, success: false });
    }
    // If everything is successful, return the response
    return res.status(201).json({
      message: SUCCESS_MESSAGE.USER.USER_REGISTERED_LOGIN,
      success: true,
      ...response,
    });
  } catch (error) {
    logger.error(LOG_MSG.USER.ERROR_401 + ": " + error);
    return res
      .status(401)
      .json({ message: ERROR_MSG.USER.ERROR_401, success: false });
  }
};

const loginWithEmail = async (data, response) => {
  try {
    const { email, password } = data || {}; // Make sure to include the 'email' field

    if (!email) {
      return response.status(400).json({ error: "Email is required" });
    }

    // Check if a user with the provided email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If the user exists, update their OTP and check if the account is activated
      const otp = usersconfig.generateOTP();
      existingUser.otp = otp;

      // Check if otpGeneratedAt exists, otherwise set it to null (for existing users)
      existingUser.otpGeneratedAt = existingUser.otpGeneratedAt || null;

      await existingUser.save();

      if (existingUser.account_activated == true) {
        try {
          const passwordMatch = await bcrypt.compare(
            password,
            existingUser.password
          );
          if (!passwordMatch) {
            return response
              .status(404)
              .json({
                message: ERROR_MSG.USER.INCORRECT_PASSWORD,
                success: false,
              });
          }
          // Continue with successful authentication logic
        } catch (error) {
          console.error("Error comparing passwords:", error);
          return response
            .status(500)
            .json({ message: "Internal server error", success: false });
        }
        // If the account is activated, return the new OTP and user
        const token = usersconfig.generateToken(existingUser._id);
        const user = existingUser;
        const otpGeneratedAt = new Date();
        existingUser.otpGeneratedAt = otpGeneratedAt;

        await existingUser.save();

        const mail_body = mailer_template.loginVerifyOtpBody(user);
        const mail_subject = mailer_template.loginVerifyOtpSubject();
        sendemail(email, mail_subject, mail_body);

        return {
          user_id: existingUser.user_id,
          existingUser,
          token,
          otp,
          message: "Login successful",
          otpGeneratedAt,
        };
      } else {
        // If the account is not activated
        return response
          .status(403)
          .json({ statuscode: 403, message: "Your account is not verified" });
      }
    } else {
      return response
        .status(404)
        .json({ statuscode: 404, message: "User not found" });
    }
  } catch (error) {
    logger.error(LOG_MSG.USER.ERROR_401 + ": " + error);
    return response
      .status(401)
      .json({ error: ERROR_MSG.USER.ERROR_401, success: false });
  }
};


const signupWithEmail = async (data) => {
  try {
    const {
      email,
      firstName,
      lastName,
      userType,
      parentCompany,
      professionalInfo,
      mobile_number,
      gst_verified
    } = data || {};

    if (!email) {
      return { error: "Email is required" };
    }

    // Check if a user with the provided email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.account_activated) {
        // If the existing user has not activated their account (OTP not verified), delete the existing user
        await existingUser.deleteOne();
      } else {
        // If account is activated, return message that user already exists
        return {
          message: "User already exists. Please login.",
          success: false,
          statuscode: 409,
        };
      }
    }

    let urlSlug; // Declare the urlSlug variable

    // Generate URL slug based on userType
    if (
      userType === "individual" ||
      userType === "agency_developer" ||
      userType === "agency"
    ) {
      // Generate initial URL slug based on first name and last name
      urlSlug = `${firstName}-${lastName}`;

      // Check if the URL slug already exists in the database
      let count = 1;
      let tempSlug = urlSlug;
      while (await User.findOne({ "entity.urlSlug": tempSlug })) {
        tempSlug = `${urlSlug}-${count}`; // Append a number to make it unique
        count++;
      }
      urlSlug = tempSlug;
    }
    console.log("Generated URL Slug:", urlSlug);

    // Proceed with signup
    const { password, country } = data;

    // Skip the parent company check if the userType is "agency"
    if (userType !== "agency" && userType !== "individual") {
      // Retrieve the parent company information
      const agency = await User.findById(parentCompany);
      if (!agency) {
        return { error: "Parent company not found" };
      }

      // Check if the email exists in the agency's resourceInfo array
      const resourceInfoIndex = agency.resourceInfo.findIndex(
        (resource) => resource.emailId === email
      );

      if (resourceInfoIndex !== -1) {
        // Remove the matching resourceInfo element
        agency.resourceInfo.splice(resourceInfoIndex, 1);
        await agency.save();
      }
    }

    const user_id = usersconfig.generateUserId();
    const otp = usersconfig.generateOTP();
    const otpGeneratedAt = new Date();

    // Use the password utility to hash the password
    const hashedPassword = await passwordconfig.getEncryptPassword(password);

    const newUser = new User({
      user_id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      userType,
      country,
      parentCompany,
      professionalInfo,
      status: "pending",
      "entity.urlSlug": urlSlug, // Assign the generated URL slug
      otpGeneratedAt,
      mobile_number,
      gst_verified
    });

    const mail_body = mailer_template.signUpBody(newUser);
    const mail_subject = mailer_template.signUpSubject();
    sendemail(email, mail_subject, mail_body);

    const savedUser = await newUser.save();

    // Return the new OTP, user, and success message
    const token = usersconfig.generateToken(newUser._id);
    return {
      user_id,
      token,
      savedUser,
      message: SUCCESS_MESSAGE.USER.SIGN_UP,
      success: true,
    };
  } catch (error) {
    console.error("Error during signup:", error);
    return { error: error.message, success: false };
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
        const token = usersconfig.generateToken();
        const user = existingUser;

        // Send SMS with the new OTP
        const sms_body = sms_template.getLoginMessage(user);
        sendOTP(mobile_number, sms_body);

        return {
          user_id: existingUser.user_id,
          token,
          savedUser: existingUser,
          otp,
        };
      } else {
        // If the account is not activated, use the resendOTP function to send a new OTP to the existing user
        const resendOtpResult = await resendOtpMobile(existingUser);
        if (resendOtpResult.success) {
          return {
            user_id: existingUser.user_id,
            ...resendOtpResult,
            success: true,
          };
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
      const token = usersconfig.generateToken();
      return {
        user_id,
        token,
        savedUser,
        otp,
        message: "User registered successfully",
        success: true,
      };
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
        return verifiedWithEmail(req, res); // Await the signupWithEmail function

        break;
      case constant.MOBILE:
        return verifiedWithMobile(req, res);
        break;
      case constant.LOGIN:
        return loginVerifyOTP(req, res);
        break;
      default:
        return res
          .status(400)
          .json({ message: "Undefined verified_type", success: false });
    }
    // Check if response contains an error message

    // If everything is successful, return the response
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
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
      user.account_activated = true;
      user.email_verified = true;
      await user.save();

      return res
        .status(201)
        .json({ message: "Token verified successfully", success: true, user });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid OTP or User ID", success: false });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
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
      user.account_activated = true; //account activate true when user enter correct otp
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
        // const otpTimestamp = user.otpGeneratedAt.getTime(); // Get the OTP generation time in milliseconds
        const otpTimestamp = user.otpGeneratedAt
          ? user.otpGeneratedAt.getTime()
          : null; // Get the OTP generation time in milliseconds
        const currentTimestamp = new Date().getTime(); // Get the current time in milliseconds

        //   if (otpTimestamp && (currentTimestamp - otpTimestamp <= otpExpirationTime)) {
        //   // OTP has expired
        //   return res.status(400).json({
        //     message: "OTP has expired",
        //     success: false,
        //   });
        // }

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
        const mail_body = mailer_template.loginBody(user);
        const mail_subject = mailer_template.loginSubject();
        sendemail(user.email, mail_subject, mail_body);

        // Extract only the necessary fields from the user object
        const {
          _id,
          currentStep,
          userType,
          firstName,
          lastName,
          status,
          entity: { urlSlug },
        } = user;

        return res.status(200).json({
          message: "Account login successfully",
          success: true,
          token,
          user: {
            _id,
            currentStep,
            userType,
            firstName,
            lastName,
            status,
            "entity.urlSlug": urlSlug,
          },
          // savedUser: user,
        });
      } else {
        return res.status(400).json({
          message: "Invalid OTP or User ID",
          success: false,
        });
      }
    } else if (verify_type === "resetpassword") {
      // Verify OTP for password reset process
      const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds

      if (user.otp === otp) {
        // const otpTimestamp = user.otpGeneratedAt.getTime(); // Get the OTP generation time in milliseconds
        const otpTimestamp = user.otpGeneratedAt
          ? user.otpGeneratedAt.getTime()
          : null; // Get the OTP generation time in milliseconds
        const currentTimestamp = new Date().getTime(); // Get the current time in milliseconds
        console.log(currentTimestamp);

        //   if (otpTimestamp && (currentTimestamp - otpTimestamp <= otpExpirationTime)) {
        //   // OTP has expired

        //   return res.status(400).json({
        //     message: "OTP has expired",
        //     success: false,
        //   });
        // }

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
          message: "reset password otp verified Successfully!",
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
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Generate OTP
    const otp = usersconfig.generateOTP(); // Implement your OTP generation function here
    const otpGeneratedAt = new Date();

    // Update user's OTP
    user.otp = otp;
    user.otpGeneratedAt = otpGeneratedAt;
    await user.save();

    // Send OTP to user's email
    const mail_body = mailer_template.forgetPassword(user);
    const mail_subject = mailer_template.forgetSubject();
    sendemail(email, mail_subject, mail_body);

    return res
      .status(200)
      .json({
        message: "OTP sent to the user's email",
        success: true,
        user: user,
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
    const { userId, newPassword, confirmPassword } = req.body;

    // Find the user by userId
    const user = await User.findOne({ user_id: userId });

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Check if the user is allowed to change the password
    if (!user.change_password) {
      return res
        .status(403)
        .json({
          message: "User is not allowed to change password",
          success: false,
        });
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

    // Update user's password
    user.password = hashedNewPassword;
    // Save the updated user
    await user.save();

    // Send OTP to user's email
    //  const mail_body = mailer_template.changePassword(user);
    //  const mail_subject = mailer_template.changeSubject();
    //  sendemail(email, mail_subject, mail_body);

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

const updateProfile = async (req, res) => {
  try {
    const { token, newProfileData } = req.body;
    const user_id = usersconfig.decodeToken(token);
    await User.findByIdAndUpdate(user_id, newProfileData);

    return res
      .status(200)
      .json({ message: "Profile updated successfully", success: true });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: error, success: false });
  }
};

const getAllUser = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    const skip = (page - 1) * limit;

    const userData = await User.find()
      .sort({ _id: -1 }) // Sort by ID in descending order
      .skip(skip)
      .limit(limit)
      .populate({
        path: "services",
        populate: [{ path: "category" }, { path: "services" }],
      });
    // .populate('services.category')
    // .populate('services.services');

    const totalUser = await User.countDocuments();

    return response.json({ data: userData, totalUser });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

const updateUser = async (request, response) => {
  try {
    const identifier = request.params.identifier;
    console.log("Identifier:", identifier);

    let user;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // Update user by Id
      user = await User.findById(identifier).populate([
        { path: "educationalInfo.degreeName" },
        { path: "portfolio.skillAndDeliverables" },
        { path: "charges.currency" },
        { path: "resourceInfo.designation" },
        { path: "skillInfo.skill" },
        { path: "services.category" },
        { path: "services.services" },
        { path: "professionalInfo.jobTitle" },
        { path: "country" },
      ]);
    } else {
      // Update user by Slug
      user = await User.findOne({ "entity.urlSlug": identifier }).populate([
        { path: "educationalInfo.degreeName" },
        { path: "portfolio.skillAndDeliverables" },
        { path: "charges.currency" },
        { path: "resourceInfo.designation" },
        { path: "skillInfo.skill" },
        { path: "services.category" },
        { path: "services.services" },
        { path: "professionalInfo.jobTitle" },
        { path: "country" },
      ]);
    }

    if (!user) {
      return response.status(404).json({
        message: ERROR_MSG.USER.INVALID_USER,
        success: false,
        statuscode: 404,
      });
    }

    // Update user fields
    Object.assign(user, request.body);

    // Update for payment
    if (request.body.bankAccountNumber) {
      if (user.paymentDetails) {
        // Update existing payment details
        Object.assign(user.paymentDetails, {
          bankAccountNumber: request.body.bankAccountNumber || "",
          confirmBankAccountNumber: request.body.bankAccountNumber || "",
          IFSCCode: request.body.IFSCCode || "",
          branchName: request.body.branchName || "",
          accountHolderName: request.body.accountHolderName || "",
        });
        await user.paymentDetails.save();
      } else {
        // Create new payment details
        const paymentDetails = {
          bankAccountNumber: request.body.bankAccountNumber || "",
          confirmBankAccountNumber: request.body.bankAccountNumber || "",
          IFSCCode: request.body.IFSCCode || "",
          branchName: request.body.branchName || "",
          accountHolderName: request.body.accountHolderName || "",
        };
        const newPaymentDetails = await PaymentDetails.create(paymentDetails);
        user.paymentDetails = newPaymentDetails._id;
      }
    }

    // Update for address
    if (request.body.houseNumber) {
      if (user.address) {
        // Update existing address
        Object.assign(user.address, {
          houseNumber: request.body.houseNumber || "",
          streetName: request.body.streetName || "",
          landmark: request.body.landmark || "",
          pinCode: request.body.pinCode || "",
          city: request.body.city || "",
          state: request.body.state || "",
        });
        await user.address.save();
      } else {
        // Create new address
        const addressDetails = {
          houseNumber: request.body.houseNumber || "",
          streetName: request.body.streetName || "",
          landmark: request.body.landmark || "",
          pinCode: request.body.pinCode || "",
          city: request.body.city || "",
          state: request.body.state || "",
        };
        const newAddress = await Address.create(addressDetails);
        user.address = newAddress._id;
      }
    }

    const updatedUser = await user.save();

    // Populate necessary fields again to include updated references
    await updatedUser.populate([
      { path: "educationalInfo.degreeName" },
      { path: "portfolio.skillAndDeliverables" },
      { path: "charges.currency" },
      { path: "resourceInfo.designation" },
      { path: "skillInfo.skill" },
      { path: "services.category" },
      { path: "services.services" },
      { path: "professionalInfo.jobTitle" },
      { path: "country" },
    ]);

    // Format dates before sending the response
    const formattedUser = {
      ...user.toObject(),
      dob: user.dob ? user.dob.toISOString().split("T")[0] : null,
      // Add more date fields here if necessary
    };

    return response.json({
      message: SUCCESS_MESSAGE.USER.UPDATE,
      success: true,
      data: formattedUser,
      statuscode: 200,
    });
  } catch (error) {
    return response
      .status(500)
      .json({ message: error.message, success: false, statuscode: 500 });
  }
};

const getUserById = async (request, response) => {
  try {
    const identifier = request.params.identifier;
    console.log("Identifier:", identifier);

    let user;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      //get user by Id
      user = await User.findById(identifier)
        .populate({
          path: "professionalInfo.jobTitle",
          model: "Designation",
        })
        .populate({
          path: "educationalInfo.degreeName",
          model: "Degree",
        })
        .populate({
          path: "portfolio.skillAndDeliverables",
          model: "Skills",
        })
        .populate({
          path: "charges.currency",
          model: "Currency",
        })
        .populate({
          path: "skillInfo.skill",
          model: "Skills",
        })
        .populate({
          path: "services.category",
          model: "ServiceCategory",
        })
        .populate({
          path: "services.services",
          model: "Services",
        })
        .populate({
          path: "resourceInfo.designation",
          model: "Designation",
        })
        .populate({
          path: "country",
          model: "Country",
        })
        .exec();
    } else {
      //get user by Slug
      user = await User.findOne({ "entity.urlSlug": identifier })
        .populate({
          path: "professionalInfo.jobTitle",
          model: "Designation",
        })
        .populate({
          path: "educationalInfo.degreeName",
          model: "Degree",
        })
        .populate({
          path: "portfolio.skillAndDeliverables",
          model: "Skills",
        })
        .populate({
          path: "charges.currency",
          model: "Currency",
        })
        .populate({
          path: "skillInfo.skill",
          model: "Skills",
        })
        .populate({
          path: "services.category",
          model: "ServiceCategory",
        })
        .populate({
          path: "services.services",
          model: "Services",
        })
        .populate({
          path: "resourceInfo.designation",
          model: "Designation",
        })
        .populate({
          path: "country",
          model: "Country",
        })
        .exec();
    }

    if (!user) {
      return response
        .status(404)
        .json({ message: ERROR_MSG.USER.INVALID_USER, success: false });
    }

    // Format dates before sending the response
    const formattedUser = {
      ...user.toObject(),
      dob: user.dob ? user.dob.toISOString().split("T")[0] : null,
      // Add more date fields here if necessary
    };

    return response
      .status(200)
      .json({
        message: SUCCESS_MESSAGE.USER.VIEW,
        success: true,
        data: formattedUser,
      });
  } catch (error) {
    console.error("Error:", error.message);
    return response
      .status(500)
      .json({ message: error.message, success: false });
  }
};


const searchUser = async (request, response) => {
  try {
    const searchTerm = request.query.search;

    if (!searchTerm || searchTerm.length < 2) {
      return response
        .status(400)
        .json({ message: "Search term must be at least 2 characters long" });
    }

    const regexSearchTerm = searchTerm
      .split("")
      .map((char) => `(?=.*${char})`)
      .join("");

    const userData = await User.find({
      firstName: { $regex: `^${regexSearchTerm}`, $options: "i" },
    });

    return response.json({ data: userData });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        message: ERROR_MSG.USER.INVALID_USER,
        success: false,
      });
    }
    res.status(200).json({
      message: SUCCESS_MESSAGE.USER.DELETE,
      success: true,
      data: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: error,
      success: false,
      error: error.message,
    });
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
  getAllUser,
  login,
  updateUser,
  getUserById,
  searchUser,
  deleteUser
};
