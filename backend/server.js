require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('query parser', 'extended');


let apiVersion = "v1";
let apiRoute = "/api/" + apiVersion;

// Routes
app.use(apiRoute + "/auth", authRoutes);

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
