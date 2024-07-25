import mongoose from "mongoose";


const cookieCartSchema = new mongoose.Schema({

    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cookie Cart Must belongs to a User']
    },
    cartItems:{
        type:Array,
        required:[true, 'Cookie Cart Must has a cart']
    },
    wishListItems:{
        type:Array,
        required:[true, 'Cookie Cart Must has a cart']
    }

});


cookieCartSchema.index({user:1, cartItems:1}, {unique: true});

export default mongoose.model('CookieCart', cookieCartSchema)