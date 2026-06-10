import { Shona } from "../ShonaModel/user.shona.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};


export const signup = async (req, res) => {
  try {
    const { name, email, password, profilePic, bio } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // check existing user
    const existingUser = await Shona.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "shona already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await Shona.create({
      name,
      email,
      password: hashedPassword,
      profilePic:  req.body.profilePic || "" ,
      bio: bio || ""
    });

    // generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      token
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 
    const user = await Shona.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // 
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      token
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 
export const getMe = async (req, res) => {
  try {
    const user = await Shona.findById(req.user.id).select("-password");

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 
export const logout = async (req, res) => {
  try {
    const user = await Shona.findById(req.user.id);

    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();

    res.status(200).json({ msg: "Logged out successfully" });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const user = await Shona.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { name, bio, profilePic } = req.body;

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (profilePic) user.profilePic = profilePic;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      bio: updatedUser.bio
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
