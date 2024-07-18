import mongoose from 'mongoose';
import { validate } from 'uuid';
import validator from 'validator';
const contactUsSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true, 'name is Required'],
        trim:true,
        minLength:[3, 'name must be at least 3 character']
    },
    email:{
        type:String,
        required:[true,'email is Required'],
        validate:[validator.isEmail, 'Please Provide a valid Email'],
        trim:true
    },
    message:{
        type:String,
        required:[true, 'message is Required'],
        trim:true,
    }
});


export default mongoose.model('ContactUs', contactUsSchema);