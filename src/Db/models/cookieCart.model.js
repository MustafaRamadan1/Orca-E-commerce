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
    }

});


export default mongoose.model('CookieCart', cookieCartSchema)