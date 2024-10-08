import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Order from "../Db/models/order.model.js";
import ApiFeature from "../utils/ApiFeature.js";
import logger from "../utils/logger.js";

export const getAllOrders = catchAsync(async (req, res, next) => {
  let orders = Order.find().populate({
    path: "user",
    select:
      "-id -otpCode  -otpExpired -passwordChangedAt -createdAt -updatedAt",
  });

  if (orders.length === 0) {
    logger.error(`No Documents in the order models`);
    return next(new AppError(`No Documents in the order models`, 404));
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");

    orders = orders.sort(sortBy);
  } else {
    orders = orders.sort("-createdAt");
  }

  const limit = req.query.limit * 1 || 5;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  const totalDocumentCounts = await Order.countDocuments();

  if (skip >= totalDocumentCounts) {
    orders = new Promise((resolve) => {
      resolve([]);
    });
  } else {
    orders = orders.skip(skip).limit(limit);
  }

  orders = await orders;

  logger.info(`Fetched ${orders.length} Orders`);
  res.status(200).json({
    status: "success",
    length: orders.length,
    numPages: Math.ceil(totalDocumentCounts / limit),
    data: orders,
  });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate({
    path: "user",
    select:
      "-id -otpCode  -otpExpired -passwordChangedAt -createdAt -updatedAt",
  });

  if (!order) {
    logger.error(`No Order with this ID`, {
      orderId: id,
    });
    return next(new AppError(`No Order with this ID`, 404));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});

export const getUserOrders = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const limit = req.query.limit * 1 || 5;

  const userOrdersLength = (await Order.find({ user: id })).length;

  let userOrders = Order.find({ user: id }).populate({
    path: "user",
    select:
      "-id -otpCode  -otpExpired -passwordChangedAt -createdAt -updatedAt",
  });

  if (req.query.sort) {
    const sortBy = req.query.sorts.split(",").join(" ");

    userOrders = userOrders.sort(sortBy);
  } else {
    userOrders = userOrders.sort("-createdAt");
  }

  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  if (skip >= userOrdersLength) {
    userOrders = new Promise((resolve) => {
      resolve([]);
    });
  } else {
    userOrders = userOrders.skip(skip).limit(limit);
  }

  userOrders = await userOrders;

  logger.info(`Get User with ID ${id} Orders`, {
    userId: id,
    orderLength: userOrders.length,
  });
  res.status(200).json({
    status: "success",
    result: userOrders.length,
    numPages: Math.ceil(userOrdersLength / limit),
    data: userOrders,
  });
});

export const updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { orderStatus } = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { orderStatus },
    { new: true, runValidators: true }
  );

  if (!updatedOrder) {
    logger.error(`No order with this id`);
    return next(new AppError(`No order with this id`), 400);
  }

  logger.info(`Order with Id ${id} UpdatedSuccessfully`, {
    orderId: id,
    orderStatus,
  });

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

/**
 * USER CAN CANCEL THE ORDER IF THE ORDER STATUS IS DELIVERING
 *  else HE CAN'T CANCEL
 * ADMIN WILL BE NOTIFIED THAT THE ORDER IS CANCELLED WITH "CANCELLED STATUS"
 * USER CAN REFUND IF THE ORDER IS ALREADY DELIVERED
 * ADMIN SHOULD UPDATE THE ORDER STATUS TO "REFUND"
 */
