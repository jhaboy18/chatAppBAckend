import jwt from "jsonwebtoken";
import { Shona } from "../ShonaModel/user.shona.js";
import dotenv from 'dotenv'

export const shonaKoprotectkro = async (req, res, next) => {
  try {
    let token;


    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

   
    if (!token) {
      return res.status(401).json({ msg: "Not authorized, no token" });
    }

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    const user = await Shona.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token invalid" });
  }
};