const jwt = require("jsonwebtoken");
const config = require("../config/config");

const decodeToken = (req, res, next) => {
  const token = req.header("Authorization");
   
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, config.secretKey);
    
    req.currentUser = decoded.user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden", success: false });
  }
};

module.exports = decodeToken;
