import morgan from "morgan";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import xss from "xss-clean";
import expressWinston from "express-winston";
import { catchAsync } from "./utils/catchAsync.js";

// create Express App

const app = express();

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// set Template Engine

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

app.use(express.static(`${__dirname}/public`, { maxAge: "1d" }));

// global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use(rateLimit({
//     windowMs: 60*60*1000,
//     max:100,
//     message: 'Too many requests from this IP, please try again in an hour'
// }));

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) {
      return false;
    },
  })
);

import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import subCategoryRouter from "./routes/subCategoryRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import cartItemsRouter from "./routes/cartItemRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import FeedBackRouter from "./routes/feedBackRoutes.js";
import wishListRouter from "./routes/wishListRoutes.js";
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middlewares/globalerrorHandler.js";
import logger from "./utils/logger.js";

// App Routes

app.use("/api/v1", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subCategories", subCategoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/cartItems", cartItemsRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/feedBacks", FeedBackRouter);
app.use("/api/v1/wishlist", wishListRouter);

import isAuth from "./middlewares/authentication.js";
import restrictTo from "./middlewares/Authorization.js";
import Category from "./Db/models/category.model.js";
import Product from "./Db/models/product.model.js";
import Order from "./Db/models/order.model.js";
import User from './Db/models/user.model.js'

app.get(
  "/api/v1/analytics",
  isAuth,
  restrictTo("admin"),
  catchAsync(async (req, res, next) => {

    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const categoryCount = await Category.countDocuments();
    const last10Orders = await Order.find().sort('-createdAt').limit(10);
    const top3Categories = await Category.find().sort({ createdAt: -1 }).limit(3);
    const last10Categories = await Category.find().sort('-createdAt').limit(10);
    const productCountForLast10Categories = [];

    for(let category of last10Categories){
      const productCountForCategory = (await Product.find({category})).length;

      productCountForLast10Categories.push({
        category,
        productCountForCategory
      })
    }
    
    res.status(200).json({
      success: true,
      userCount,
      productCount,
      orderCount,
      categoryCount,
      last10Orders,
      top3Categories,
      productCountForLast10Categories
    });

  })
);


/*
top 3 categories
products number of last 10 categories
last 10 orders
number of all users
number of all orders
number of all products
number of all categories
*/
//  not found route for non exist routes

app.all("*", (req, res, next) => {
  logger.error(`Accessing Not Found Route , ${req.originalUrl}`);
  return next(
    new AppError(
      `Not Found Page , No route with your ${req.originalUrl} URL`,
      404
    )
  );
});

app.use(globalErrorHandler);

export default app;
