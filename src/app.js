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
app.use(morgan("dev"));
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

/*const corsOptions = {
    origin: [/https?:\/\/(www\.)?orca-wear\.com$/], // Allow only orca-wear.com and www.orca-wear.com
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Required if your frontend needs to send cookies or use Authorization headers
};

app.use(cors(corsOptions));
*/

// app.use(cors({
// origin:/https?:\/\/(www\.)?orca-wear\.com$/,
// optionsSuccessStatus: 200,
// }))
app.use(cors());

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
import User from "./Db/models/user.model.js";

app.get(
  "/api/v1/analytics",
  isAuth,
  restrictTo("admin"),
  catchAsync(async (req, res, next) => {
    const userCount = await User.find({
      role: { $ne: "admin" },
    }).countDocuments();
    console.log("userCount", userCount);
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const categoryCount = await Category.countDocuments();
    const last10Orders = await Order.find()
      .sort("-createdAt")
      .limit(10)
      .populate("user");
    const top3Categories = await Category.find()
      .sort({ createdAt: -1 })
      .limit(3);
    const last10Categories = await Category.find().sort("-createdAt").limit(10);
    const productCountForLast10Categories = [];

    for (let category of last10Categories) {
      const productCountForCategory = (await Product.find({ category })).length;

      productCountForLast10Categories.push({
        id: category.name,
        value: productCountForCategory,
        label: category.name,
      });
    }

    const users = await User.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          users: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: {
            day: "$_id.day",
            month: "$_id.month",
            formatted: {
              $concat: [
                { $toString: "$_id.day" },
                "/",
                { $toString: "$_id.month" },
              ],
            },
          },
          users: 1,
        },
      },
      {
        $unwind: "$users",
      },
      {
        $sort: { "users.createdAt": -1 },
      },
      {
        $group: {
          _id: "$_id",
          users: { $push: "$users" },
        },
      },
      {
        $sort: {
          "_id.month": -1,
          "_id.day": -1,
        },
      },
      {
        $project: {
          _id: "$_id.formatted",
          month: "$_id.month",
          day: "$_id.day",
          users: 1,
        },
      },
      {
        $unwind: "$users",
      },
      {
        $sort: {
          month: 1,
          day: 1,
        },
      },
      {
        $limit: 30,
      },
      {
        $group: {
          _id: {
            formatted: "$_id",
            month: "$month",
            day: "$day",
          },
          users: { $push: "$users" },
        },
      },
      {
        $sort: {
          "_id.month": 1,
          "_id.day": 1,
        },
      },
      {
        $project: {
          _id: "$_id.formatted",
          users: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      userCount,
      productCount,
      orderCount,
      categoryCount,
      last10Orders,
      top3Categories,
      productCountForLast10Categories,
      users,
    });
  })
);

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
