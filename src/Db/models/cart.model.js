import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cart Must belongs to a User']
    },
    totalPrice:{
        type: Number
    }
});

export default mongoose.model('Cart', cartSchema);