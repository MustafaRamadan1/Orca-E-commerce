import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Review from "../Db/models/review.model.js";
import Product from "../Db/models/product.model.js";
import mongoose from "mongoose";

const updateProductRating = async (productId) => {
  try {
    const updatedRating = await Review.aggregate([
      {
        $match: { product: new mongoose.Types.ObjectId(productId) },
      },
      {
        $group: {
          _id: "product",
          ratingAverage: { $avg: "$ratings" },
          ratingQuantity: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          ratingAverage: { $round: ["$ratingAverage", 3] },
          ratingQuantity: 1
        }
      }
    ]);

    const { ratingAverage, ratingQuantity } = updatedRating[0];
   return await Product.findByIdAndUpdate(
      productId,
      { ratingAverage, ratingQuantity },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.log(error);
  }
};

export const createReview = catchAsync(async (req, res, next) => {
  const { title, user, product, ratings } = req.body;

  if (!title || !user || !product || !ratings)
    return next(new AppError(`Please Provide Required Fields`, 400));

  const newReview = await Review.create({ title, user, product, ratings });

  if (!newReview) return next(new AppError(` Couldn't Create New Review`, 400));

 await updateProductRating(product)

  res.status(201).json({
    status: "success",
    data: newReview,
  });
});

export const getAllReviews = catchAsync(async (req, res ,next)=>{

    const allReviews = await Review.find();

    if(!allReviews) return next(new AppError(`Couldn't Find Reviews`, 400));

    res.status(200).json({

        status:'success',
        data:allReviews
    })
})