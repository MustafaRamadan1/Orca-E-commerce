import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({

    title:{
        type:String,
        required:[true, 'Review Must has a title'],
        minLength:[3, 'Title must be at least 3 character']
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:[true,'Review must belong to a user']
    },
    product:{
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required:[true,'Review must belong to a product']
    },
    ratings:{
        type:Number,
        required:[true, 'Review must has a rating'],
        min:[1, 'Rating of Review must be at least 1'],
        max:[5, 'Rating of review must be max 5'],
    }
});


reviewSchema.index({user:1, product:1},{unique:true});

export default mongoose.model('Review', reviewSchema);