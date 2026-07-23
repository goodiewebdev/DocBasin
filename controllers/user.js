require("dotenv").config();
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sanitize = require("../utils/sanitize.js");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL;
const toEmailAddress = process.env.ToEmailAddress;

const signupUser = async (req, res) => {
  const { password } = req.body;
  const name = sanitize(req.body.name || "");
  const email = sanitize(req.body.email || "").toLowerCase();

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
    });

    await newUser.save();
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

const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 90000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    const sendVerificationEmail = async () => {
      try {
        const response = await resend.emails.send({
          from: fromEmail,
          to: [toEmailAddress],
          subject: "Test Verification",
          html: `<strong>Verification OTP:</strong> ${otp}`,
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

    await sendVerificationEmail();
    return res.status(200).json({
      success: true,
      message: "Verification OTP sent Email successfully",
    });
  } catch (error) {
    console.error("Error sending verification OTP:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.userId;

  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      console.log(
        "OTP mismatch:",
        !user.verifyOtp === "",
        user.verifyOtp !== otp,
      );
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 90000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

    await user.save();

    const sendVerificationEmail = async () => {
      try {
        const response = await resend.emails.send({
          from: fromEmail,
          to: [toEmailAddress],
          subject: "Test Verification",
          html: `<strong>Verification OTP:</strong> ${otp}`,
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

    await sendVerificationEmail();
    return res
      .status(200)
      .json({ success: true, message: "Password reset OTP sent successfully" });
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: error.message });
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
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
};
