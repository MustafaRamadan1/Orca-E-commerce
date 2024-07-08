import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cart Must belongs to a User']
    },
    totalPrice:{
        type: Number,
        default: 0
    }
});

cartSchema.index({user:1, id:1}, {unique: true});

cartSchema.methods.toJSON = function (){

    const cart = this;
    const cartObject = cart.toObject();

    delete cartObject.__v;

    return cartObject;
}

export default mongoose.model('Cart', cartSchema);