import morgan from "morgan";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors'
import xss from 'xss-clean';
import { catchAsync } from "./utils/catchAsync.js";
// create Express App

const app = express();


import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// set Template Engine 

app.set('view engine', 'pug');
app.set('views',`${__dirname}/views`);


app.use(express.static(`${__dirname}/public`,{ maxAge: '1d' }))

// global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(cors());
// app.use(cors({
//   origin: "https://your-frontend-domain.com",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));
// app.use(rateLimit({
//     windowMs: 60*60*1000,
//     max:100,
//     message: 'Too many requests from this IP, please try again in an hour'
// }));



import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import subCategoryRouter from "./routes/subCategoryRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from './routes/cartRoutes.js';
import cartItemsRouter from './routes/cartItemRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import FeedBackRouter from './routes/feedBackRoutes.js';
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middlewares/globalerrorHandler.js";

// App Routes

app.use("/api/v1", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subCategories", subCategoryRouter);
app.use("/api/v1/products", productRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/cartItems', cartItemsRouter);
app.use('/api/v1/payment',paymentRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders',orderRouter);
app.use('/api/v1/feedBacks',FeedBackRouter)


//  not found route for non exist routes

app.all("*", (req, res, next) => {
  return next(
    new AppError(
      `Not Found Page , No route with your ${req.originalUrl} URL`,
      404
    )
  );
});

app.use(globalErrorHandler);

export default app;
