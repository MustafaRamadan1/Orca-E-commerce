import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Order from "../Db/models/order.model.js";
import ApiFeature from "../utils/ApiFeature.js";

export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate({
      path: "items",
      populate: {
        path: "product",
        select:
          " -category -subCategory -images -description -colors -slug -ratingAverage -ratingQuantity",
      },
    })
    .populate({
      path: "user",
      select:
        "-id -otpCode  -otpExpired -passwordChangedAt -createdAt -updatedAt",
    });

  if (orders.length === 0)
    return next(new AppError(`No Documents in the order models`, 404));

  res.status(200).json({
    status: "success",
    length: orders.length,
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

  const userOrders = await Order.find({ user: id });

  if (!userOrders) return next(new AppError(`No Orders for that user`, 400));

  res.status(200).json({
    status: "success",
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

  if (!updatedOrder) return next(new AppError(`No order with this id`), 400);

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});
