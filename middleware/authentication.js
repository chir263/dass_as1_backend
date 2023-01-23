const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthenticatedError } = require("../errors");

const auth = async (req, res, next) => {
  // check header
  // console.log("checking authentication");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach the user to routes
    req.user = { userId: payload.userId, user_name: payload.user_name };
    // console.log("moving to request");

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

module.exports = auth;
