const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firstName:{type:String},
    lastName:{type:String},
    email: { type: String, unique: true },
    phone: { type: String },
    password: { type: String },
    is_active: { type: Boolean, default: true },
    adminId: {type:String},
    account_activated: {type: Boolean, default: false},
    otpGeneratedAt: {type: Date},
    otp:{type:String},
    change_password: {type:Boolean, default: false},
  },
  { timestamps: true }
);

const admin = mongoose.model("Admin", adminSchema);

module.exports = admin;
