require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const PORT = process.env.PORT || 7000;
const mongodb_url = process.env.MONGO_URI;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  }),
);

app.use(cors());

const userRoutes = require("./routes/user.js");
const contactListRoutes = require("./routes/contactlist.js");
const createContact = require("./routes/contact.js");

mongoose
  .connect(mongodb_url)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/contactlist", contactListRoutes);
app.use("/api/contact", createContact);

app.listen(7000, () => {
  console.log("Server is running on port 7000");
});
