import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const verifyTokenAdmin = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) {
        res.status(401);
      }
      if (userData.role === "admin") {
        req.user = userData;
        next();
      } else {
        res.status(401).json("no token");
      }
    });
  } else {
    res.status(403).json("Unauthorized");
  }
});

export default verifyTokenAdmin;
