import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import FeedBack from "../Db/models/feedBack.model.js";

export const createFeedBack = catchAsync(async (req, res, next) => {
  const { name, email, message } = req.body;

  const feedBack = await FeedBack.create({ name, email, message });

  if (!feedBack) return next(new AppError(`Couldn't create new FeedBack`, 400));

  res.status(200).json({
    status: "success",
    data: feedBack,
  });
});

export const getAllFeedBacks = catchAsync(async (req, res, next) => {
  const AllFeedBacks = await FeedBack.find();

  const isEmpty = !AllFeedBacks || AllFeedBacks.length === 0;

  res.status(200).json({
    status: "success",
    data: isEmpty ? [] : AllFeedBacks,
  });
});

export const getFeedBack = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const feedBack = await FeedBack.findById(id);

  if (!feedBack) return next(new AppError(`Couldn't Get FeedBack`, 400));

  res.status(200).json({
    status: "success",
    data: feedBack,
  });
});
