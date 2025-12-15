const jwt = require("jsonwebtoken");

// Optional authentication middleware - doesn't fail if no token
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (err) {
    // If token is invalid, just continue without user
    next();
  }
};

