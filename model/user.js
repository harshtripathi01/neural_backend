const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    
    firstName: { type: String },
    lastName: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    change_password:{type:Boolean, default: false},
    otpGeneratedAt: {type: Date},

    fullName: { type: String },
    user_id: { type: String },
    password: { type: String },
    otp: { type: String },
    login_type: { type: String },
    email_verified: { type: Boolean },
    mobile_number: { type: String },
    mobile_number_verified: { type: Boolean },
    account_activated: { type: Boolean, default: false },
    mobile_otp: { type: String },
    email_otp: { type: String },
    country: { type: String },
    zipCode:{type:String},
    gender: { type: String },
    dob: { type: Date },
    location:{type:String},
    field_expertise:{type:String},
    availability:{type:String}
   
     
  },

  { timestamps: true }
);

const user = mongoose.model("User", userSchema);

module.exports = user;
