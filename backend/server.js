require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const servicesRoutes = require('./routes/services');
const offeringsRoutes = require('./routes/offerings');
const providerRoutes = require('./routes/provider');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('query parser', 'extended');


let apiVersion = "v1";
let apiRoute = "/api/" + apiVersion;

// Routes
app.get('/health', (req, res) => res.json({ ok: true }));
app.use(apiRoute + "/auth", authRoutes);
app.use(apiRoute + "/profile", profileRoutes);
app.use(apiRoute + "/services", servicesRoutes);
app.use(apiRoute + "/offerings", offeringsRoutes);
app.use(apiRoute + "/provider", providerRoutes);
app.use(apiRoute + "/cart", cartRoutes);
app.use(apiRoute + "/orders", orderRoutes);
app.use(apiRoute + "/payments", paymentRoutes);
app.use(apiRoute + "/admin", adminRoutes);

//Error Handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
