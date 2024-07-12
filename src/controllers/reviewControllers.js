import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Review from "../Db/models/review.model.js";
import Product from "../Db/models/product.model.js";
import mongoose from "mongoose";
import ApiFeature from '../utils/ApiFeature.js';

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

    if(updatedRating.length > 0){
        const { ratingAverage, ratingQuantity } = updatedRating[0];
        await Product.findByIdAndUpdate(
          productId,
          { ratingAverage, ratingQuantity },
          { new: true, runValidators: true }
        );

    }else{
        await Product.findByIdAndUpdate(
            productId,
            { ratingAverage:0, ratingQuantity:0 },
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

 await updateProductRating(product)

  res.status(201).json({
    status: "success",
    data: newReview,
  });
});

export const getAllReviews = catchAsync(async (req, res ,next)=>{

    const totalDocumentsCount  = await Review.countDocuments();

    const apiFeature = new ApiFeature(Review.find(),req.query);

    const allReviews = await apiFeature.filter().sort().limitFields().pagination(totalDocumentsCount).query
    .populate({
        path:'user',
        select:' -__v -createdAt -updatedAt'
    })
    if(!allReviews) return next(new AppError(`Couldn't Find Reviews`, 400));

    res.status(200).json({

        status:'success',
        data:allReviews
    })
});


export const getReviewById = catchAsync(async (req, res, next)=>{

    const {id} = req.params;

    const review = await Review.findById(id).populate({
        path:'user',
        select:'-__v -createdAt -updatedAt'
    })

    if(!review) return next(new AppError(`Couldn't Find Review`, 400));

    res.status(200).json({
        status:'success',
        data:review
    })
});


export const getUserReviews = catchAsync(async (req, res ,next)=>{

    const {userId} = req.params;

    const userReviews = await Review.find({user:userId}).populate({
        path:'user',
        select:'-__v -createdAt -updatedAt'
    })

    if(userReviews.length === 0) return next(new AppError(`Couldn't Find Reviews For that user`, 400));

    res.status(200).json({
        status:'success',
        data:userReviews
    })
});


export const updateReview = catchAsync(async (req, res, next)=>{

    const {id} = req.params;

    const {title, ratings} = req.body;

    const updatedReview = await Review.findByIdAndUpdate(id, {title, ratings}, {new:true,runValidators:true})
    .populate({
        path:'user',
        select:'-__v -createdAt -updatedAt'
    })

    if(!updatedReview) return next(new AppError(`Couldn't Update Review`, 400));

    await updateProductRating(updatedReview.product);

    res.status(200).json({
        status:'success',
        data:updatedReview
    })
})


export const deleteReview = catchAsync(async (req, res, next)=>{

    const {id} = req.params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if(!deletedReview) return next(new AppError(`Couldn't Delete Review`, 400));

    await updateProductRating(deletedReview.product);

    res.status(204).json({
        status:'success',
        message:'Review Deleted Successfully'
    })
});

