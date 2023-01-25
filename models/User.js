const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "Please provide first name"],
    maxlength: 50,
    minlength: 3,
  },
  last_name: {
    type: String,
    maxlength: 50,
    minlength: 3,
  },
  user_name: {
    type: String,
    required: [true, "Please provide user name"],
    maxlength: 50,
    minlength: 3,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  age: {
    type: Number,
    required: [true, "Please provide age"],
    integer: true,
    min: 5,
    max: 150,
  },
  contact_number: {
    type: String,
    required: [true, "Please provide contact number"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  saved_posts: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
  followers: [{ type: String }],
  following: [{ type: String }],
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, user_name: this.user_name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
