import mongoose from 'mongoose';

const wishListSchema = new mongoose.Schema({

    user:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required:[true, 'WishList must belong to a user']
    },
    items:[{
        type: mongoose.Types.ObjectId,
        ref:'Product',
        required:[true, 'Wishlist must has products']
    }]
},{
    timestamps:true
});


export default mongoose.model('WishList', wishListSchema)