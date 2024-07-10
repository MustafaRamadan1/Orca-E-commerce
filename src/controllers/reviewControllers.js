import AppError from '../utils/AppError.js';
import {catchAsync} from '../utils/catchAsync.js';
import Review from '../Db/models/review.model.js';
import mongoose from 'mongoose';


const updateProductWithRating = async (productId)=>{

    const reviews = await Review.aggregate([
        {
            $match: {product: new mongoose.Types.ObjectId(productId)}
        },{
            $group: {
                _id:'product',
                ratingAverage: {$avg: '$ratings'},
                ratingQuantity : {$sum: 1}
            }
        }
    ]);

    return reviews;
}


export const createReview =  catchAsync(async (req, res ,next)=>{

    const {title, user, product, ratings} = req.body;

    if(!title || !user || !product || !ratings) return next(new AppError(`Please Provide Required Fields`, 400));


    const newReview = await Review.create({title, user, product, ratings});

    if(!newReview) return next( new AppError(` Couldn't Create New Review`, 400));

    res.status(201).json({
        status:'success',
        data: newReview
    })

})

export const getStuff = catchAsync(async (req, res, next)=>{

    const {product} = req.params;

    const data =  await updateProductWithRating(product);
    console.log(data)
    res.status(200).json({
        status:'success',
        data
    })
})