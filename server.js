require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 7000;
const mongodb_url = process.env.MONGO_URI;

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
}));

const userRoutes = require("./routes/user.js");
const contactListRoutes = require("./routes/contactlist.js");
const contactRoutes = require("./routes/contact.js");

app.use("/api/users", userRoutes);
app.use("/api/contactlist", contactListRoutes);
app.use("/api/contact", contactRoutes);

mongoose
  .connect(mongodb_url)
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
