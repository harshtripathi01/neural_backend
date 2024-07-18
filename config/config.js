module.exports = {
    dbUrl: process.env.DB_URL || "mongodb://localhost:27017/talencrud",
    appPort: process.env.APP_PORT || 9005,
    secretKey: 'talencrud',
    RAZORPAY_ID_KEY:"rzp_live_FXHxWz6v1BkDyx",
    RAZORPAY_SECRET_KEY:"7DDORxTVlYlZ9yzORGi0zJBO",
    signupSecretKey:'0f446fe9549981e2a2fade5a7f03e81665e442bc97d6a4997f3fd6530b9724d1'
    // Add more configuration variables as needed
  };