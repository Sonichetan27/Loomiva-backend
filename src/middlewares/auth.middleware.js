import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Authorization header check
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, admin not found",
      });
    }

    req.admin = admin; // attach admin to request
    next();

  } catch (error) {
    console.log("AUTH ERROR:", error);
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};