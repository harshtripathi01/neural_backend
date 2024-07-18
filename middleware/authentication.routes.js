const jwt = require("jsonwebtoken");
const config = require("../config/config");

const authenticateRoutes = (req, res, next) => {
  // Check if the request method is POST, PUT, or DELETE
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const token = req.header("Authorization");

    // Exclude authentication for specific routes
    const nonAuthRoutes = ["/user/createSignup", "/user/forgotPassword", "/user/changePassword", "/user/verifyOTP", "/user/loginVerifyOTP", "/user/resendOtpEmail", "/user/resendOtpMobile", "/product/getAllProduct" , "/admin/signup", "/admin/login", "/product/getAllProductByCategory" ];
    if (nonAuthRoutes.includes(req.path)) {
      return next();
    }

    // If the token is missing, return an unauthorized response
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    // Verify the token, and block access if it's invalid
    jwt.verify(token, config.secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: err, success: false });
      }

      // If the token is valid, store the user information in the request object
      req.user = user;

      next();
    });
  } else {
    // For GET requests and any other method, allow access without token verification
    next();
  }
};

module.exports = authenticateRoutes;
