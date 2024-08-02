const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    phone: { type: String },
    password: { type: String },
    userRegisterDate: { type: Date },
    lastLoginDate: { type: Date },
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
