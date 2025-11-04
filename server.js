const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const connectToDb = require("./config/dbConnect");

const userRoutes = require("./routes/userRoute");
const orderRoutes = require("./routes/orderRoute");
const reviewRoutes = require("./routes/reviewRoute");
const productRoutes = require("./routes/productRoute");
const paymentRoutes = require("./routes/paymentRoute");
const wishlistRoutes = require("./routes/wishlistRoute");
const addToCartProductRoutes = require("./routes/addToCartRoute");
const adminsettingsRoutes = require("./routes/adminsettingsRoute");
const deliverystatusRoutes = require("./routes/deliverystatusRoute");

// express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors middleware
app.use(cors());

// api routes middlewares

// routes middlewares for users
app.use("/", userRoutes);

// routes middlewares for products
app.use("/", productRoutes);

// routes middlewares for  reviews
app.use("/", reviewRoutes);

// routes middlewares for wishlists
app.use("/", wishlistRoutes);

// routes middlewares for orders
app.use("/", orderRoutes);

// routes middlewares for payment
app.use("/", paymentRoutes);

// routes middlewares for deliverystatus
app.use("/", deliverystatusRoutes);

// routes middlewares for adminsettings
app.use("/", adminsettingsRoutes);

// routes middlewares for addToCart
app.use("/", addToCartProductRoutes);

connectToDb();

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
