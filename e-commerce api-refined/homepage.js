const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();          //this is used to custom find .env file   &  "require('dotenv').config();"  {} this metthod can also be used }

connectDB();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes'));

// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
