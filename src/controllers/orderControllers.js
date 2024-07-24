import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Order from "../Db/models/order.model.js";
import ApiFeature from "../utils/ApiFeature.js";

export const getAllOrders = catchAsync(async (req, res, next) => {
  let orders = Order.find()
    .populate({
      path: "items",
      populate: {
        path: "product",
      },
    })
    .populate({
      path: "user",
      select:
        "-id -otpCode  -otpExpired -passwordChangedAt -createdAt -updatedAt",
    });

  if (orders.length === 0)
    return next(new AppError(`No Documents in the order models`, 404));

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
  res.status(200).json({
    status: "success",
    length: orders.length,
    NumPages: Math.ceil(totalDocumentCounts / limit),
    data: orders,
  });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate({
      path: "items",
      populate: "product",
    })
    .populate({
      path: "user",
      select:
        "-id -otpCode  -otpExpired -passwordChangedAt -createdAt -updatedAt",
    });

  if (!order) return next(new AppError(`No Order with this ID`, 404));

  res.status(200).json({
    status: "success",
    data: order,
  });
});

export const getUserOrders = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const limit = req.query.limit * 1 || 5;

  const userOrdersLength = (await Order.find({ user: id })).length;

  let userOrders = Order.find({ user: id })
    .populate({
      path: "items",
      populate: "product",
    })
    .populate({
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
  
  res.status(200).json({
    status: "success",
    result: userOrders.length,
    numPages: Math.ceil(userOrdersLength / limit),
    data: userOrders
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

  if (!updatedOrder) return next(new AppError(`No order with this id`), 400);

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});
