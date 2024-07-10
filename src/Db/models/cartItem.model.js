import mongoose from 'mongoose';
const cartItemSchema = new mongoose.Schema({

    product:{
        type: mongoose.Types.ObjectId,
        ref:'Product',
        required:[true , 'Cart Item Must has a product']
    },
    cart:{
        type: mongoose.Types.ObjectId,
        ref:'Cart',
        required:[true , 'Cart Item must belongs to cart']
    },

    quantity:{
        type: Number,
        required:[true, 'Cart Item Must has a quantity']
    }
},{
    timestamps:true,
});


cartItemSchema.index({product:1, cart:1}, {unique: true});


export default mongoose.model('CartItem', cartItemSchema)