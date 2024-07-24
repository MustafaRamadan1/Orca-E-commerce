import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Review from "../Db/models/review.model.js";
import Product from "../Db/models/product.model.js";
import mongoose from "mongoose";
import ApiFeature from "../utils/ApiFeature.js";

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
          ratingQuantity: 1,
        },
      },
    ]);

    if (updatedRating.length > 0) {
      const { ratingAverage, ratingQuantity } = updatedRating[0];
      await Product.findByIdAndUpdate(
        productId,
        { ratingAverage, ratingQuantity },
        { new: true, runValidators: true }
      );
    } else {
      await Product.findByIdAndUpdate(
        productId,
        { ratingAverage: 0, ratingQuantity: 0 },
        { new: true, runValidators: true }
      );
    }
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

  await updateProductRating(product);

  res.status(201).json({
    status: "success",
    data: newReview,
  });
});

export const getAllReviews = catchAsync(async (req, res, next) => {

  const totalDocumentCounts = await Review.countDocuments();

  let reviews = Review.find().populate({
    path: "user",
    select: "-__v -createdAt -updatedAt",
  });

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");

    reviews = reviews.sort(sortBy);
  } else {
    reviews = reviews.sort("-createdAt");
  }

  const limit = req.query.limit * 1 || 3;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  if (skip >= totalDocumentCounts) {
    reviews = new Promise((resolve) => {
      resolve([]);
    });
  } else {
    reviews = reviews.skip(skip).limit(limit);
  }

  reviews = await reviews;

  res.status(200).json({
    status: "success",
    numPages: Math.ceil(reviews.length / limit),
    data: reviews,
  });
});

export const getReviewById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id).populate({
    path: "user",
    select: "-__v -createdAt -updatedAt",
  });

  if (!review) return next(new AppError(`Couldn't Find Review`, 400));

  res.status(200).json({
    status: "success",
    data: review,
  });
});

export const getUserReviews = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const limit = req.query.limit * 1 || 5;

  const userReviewsLength = (await Order.Review({ user: userId })).length;

  let userReviews =  Review.find({ user: userId }).populate({
    path: "user",
    select: "-__v -createdAt -updatedAt",
  });

  if (req.query.sort) {
    const sortBy = req.query.sorts.split(",").join(" ");

    userReviews = userReviews.sort(sortBy);
  } else {
    userReviews = userReviews.sort("-createdAt");
  }

  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  if (skip >= userReviewsLength) {
    userReviews = new Promise((resolve) => {
      resolve([]);
    });
  } else {
    userReviews = userReviews.skip(skip).limit(limit);
  }

  userReviews = await userReviews;
  res.status(200).json({
    status: "success",
    result:userReviews.length,
    numPages:Math.ceil(userReviews.length/limit),
    data: userReviews,
  });
});

export const updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { title, ratings } = req.body;

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { title, ratings },
    { new: true, runValidators: true }
  ).populate({
    path: "user",
    select: "-__v -createdAt -updatedAt",
  });

  if (!updatedReview) return next(new AppError(`Couldn't Update Review`, 400));

  await updateProductRating(updatedReview.product);

  res.status(200).json({
    status: "success",
    data: updatedReview,
  });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedReview = await Review.findByIdAndDelete(id);

  if (!deletedReview) return next(new AppError(`Couldn't Delete Review`, 400));

  await updateProductRating(deletedReview.product);

  res.status(204).json({
    status: "success",
    message: "Review Deleted Successfully",
  });
});



export const getAllReviewsForProduct = catchAsync(async (req, res ,next)=>{

  const{productId} = req.params;

  let productReviews =  Review.find({product:productId}).populate({
    path: "user",
    select: "-__v -createdAt -updatedAt",
  });


  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");

    productReviews = productReviews.sort(sortBy);
  } else {
    productReviews = productReviews.sort("-createdAt");
  }

  const totalDocumentCounts = (await Review.find({product:productId})).length;
  const limit = req.query.limit * 1 || 3;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  if (skip >= totalDocumentCounts) {
    productReviews = new Promise((resolve) => {
      resolve([]);
    });
  } else {
    productReviews = productReviews.skip(skip).limit(limit);
  }

  productReviews = await productReviews;



  res.status(200).json({
    status: "success",
    result:productReviews.length,
    numPages:Math.ceil(totalDocumentCounts / limit),
    data: productReviews
  })
})




export const getAllReviewsAdmin = catchAsync(async (req, res ,next)=>{

  const limit = req.query.limit  * 1 || 5;

  const totalDocumentCounts = await Review.countDocuments();


  const apiFeature = new ApiFeature(Review.find(),req.query).sort().limitFields().pagination();

  const getAllReviews = await apiFeature.query.populate({
    path: "user",
    select: "-__v -createdAt -updatedAt",
  });

  if(getAllReviews.length === 0) return next(new AppError(`No Reviews Found`, 404));

  res.status(200).json({
    status:'success',
    result:getAllReviews.length,
    numPages:Math.ceil(totalDocumentCounts / limit),
    data:getAllReviews
  })
})