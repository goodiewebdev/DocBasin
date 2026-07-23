require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 7000;
const mongodb_url = process.env.MONGO_URI;

const allowedOrigins = [
  "http://localhost:5173",
  "https://docbasin-f.vercel.app",
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  if (req.path.startsWith("/api/f/submissions")) {
    return cors({
      origin: "*",
      methods: ["POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Accept"],
    })(req, res, next);
  }

  return cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })(req, res, next);
});

const userRoutes = require("./routes/user.js");
const formRoutes = require("./routes/form.js");
const submissionRoutes = require("./routes/submission.js");
const checkoutRoute = require("./routes/checkout.js");

app.use("/api/users", userRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/f/submissions", submissionRoutes);
app.use("/api/checkout", checkoutRoute);

// Health Check
app.get("/api/ping", (req, res) => res.status(200).send("OK"));

// Database Connection & Server Startup
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