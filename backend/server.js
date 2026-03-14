require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const errorHandler = require('./middleware/errorHandler');

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
app.use(apiRoute + "/services", servicesRoutes);

//Error Handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
