import { ref } from 'joi';
import mongoose from 'mongoose';


const paymentSchema = new mongoose.Schema({
   
    intention_id:{
        type:String,
        required:[true,'Payment intention id is required']
    },
    user:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required:[true, 'Payment must belong to a user']
    },
    cartItems:[{
        product:{
            type:mongoose.Types.ObjectId,
            ref:'Product',
            required:[true, 'Cart Item must has a product']
        },
        quantity:{
            type:Number,
            required:[true, 'Cart Item must has a quantity']
        }
    }],
    
});


export default mongoose.model('Payment', paymentSchema)