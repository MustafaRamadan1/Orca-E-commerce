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
},{
    id:false,
    timestamps: true,
    toObject:{
        virtuals:true
    },
    toJSON:{
        virtuals:true
    }
});

cartSchema.index({user:1}, {unique: true});

cartSchema.virtual('items',{
    ref:'CartItem',
    localField:'_id',
    foreignField:'cart'
});

cartSchema.methods.toJSON = function (){

    const cart = this;
    const cartObject = cart.toObject();
    delete cartObject.createdAt;
    delete cartObject.updatedAt;
    delete cartObject.__v;

    return cartObject;
}

export default mongoose.model('Cart', cartSchema);