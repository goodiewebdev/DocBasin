require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sanitize = require("../utils/sanitize.js");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL;
const toEmailAddress = process.env.ToEmailAddress;
const crypto = require("crypto");

const signupUser = async (req, res) => {
  const { password } = req.body;
  const name = sanitize(req.body.name || "");
  const email = sanitize(req.body.email || "").toLowerCase();
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const verificationURL = `https://docbasin.onrender.com/api/users/verify/${emailVerificationToken}`;

  const sendVerificationEmail = async (emailVerificationToken) => {
    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: [toEmailAddress],
        subject: "Test Verification",
        html: `<strong>Verification Link:</strong> ${verificationURL}`,
      });

      if (response.error) {
        console.error("Resend API Error:", response.error);
      } else {
        console.log("Resend Success! ID:", response.data.id);
      }
    } catch (err) {
      console.error("Network/Code Error:", err);
    }
  };

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      emailVerificationToken,
      isEmailVerified: false,
    });

    await newUser.save();
    await sendVerificationEmail(emailVerificationToken);
    res
      .status(201)
      .json({ message: "User created successfully", email: newUser.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = sanitize(req.body.email || "").toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Wrong password entered" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "23h" },
    );

    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to get all users" });
    }
    const allUsers = await User.find({});
    res.status(200).json({ allUsers });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format" });
  }

  try {
    console.log("token userId:", req.user.userId);
    console.log("param userId:", userId);
    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to get this user" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this user" });
    }

    const userToDelete = await User.findByIdAndDelete(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "Cannot find user" });
    }

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Sever error", err });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  try {
    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user" });
    }

    const updateData = {};

    if (name) updateData.name = sanitize(name);

    if (email) updateData.email = sanitize(email.toLowerCase());

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { verificationId } = req.params;

  try {
    const userMatch = await User.findOne({
      emailVerificationToken: verificationId,
    });
    if (!userMatch) {
      return res.status(400).json({ message: "Could not verify user" });
    }

    userMatch.isEmailVerified = true;
    userMatch.emailVerificationToken = undefined;
    await userMatch.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getLoggedInUser,
  updateUser,
  verifyEmail,
};
