require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
    dbUrl: process.env.DB_URL || "mongodb://localhost:27017/neural",
    appPort: process.env.APP_PORT || 3000,
    secretKey: 'neural',
    RAZORPAY_ID_KEY:"rzp_live_FXHxWz6v1BkDyx",
    RAZORPAY_SECRET_KEY:"7DDORxTVlYlZ9yzORGi0zJBO",
    signupSecretKey:'0f446fe9549981e2a2fade5a7f03e81665e442bc97d6a4997f3fd6530b9724d1'
    // Add more configuration variables as needed
  };