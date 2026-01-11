require("dotenv").config();
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require('./routes/user.js');
const contactListRoutes = require('./routes/contactlist.js');
const createContact = require('./routes/contact.js')

app.use(cors());



mongoose
.connect('mongodb://127.0.0.1:27017/docBasinBackend')
.then(() => console.log("Server Has Started"))
.catch((err) => console.log("Error connecting to MongoDB", err))


app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/contactlist', contactListRoutes);
app.use('/api/contact', createContact);



app.listen(7000, () => {
  console.log("Server is running on port 7000");
});