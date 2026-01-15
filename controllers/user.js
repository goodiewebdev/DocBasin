require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
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
      { expiresIn: "23h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: token,
    });
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
      return res.status(403).json({ message: "Not authorized to get all users" });
    }
    const allUsers = await User.find({});
    res.status(200).json({ allUsers });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to get this user" });
    }

    const user = await User.findById(req.params.id);
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
    if (name) updateData.name = name;
    if (email) updateData.email = email;

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

module.exports = {
  signupUser,
  loginUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getLoggedInUser,
  updateUser,
};
