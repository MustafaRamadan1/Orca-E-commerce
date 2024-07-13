import crypto from 'crypto'
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcrypt';
import Cart from './cart.model.js'
import generatorOTP from '../../utils/generateOTP.js';
//  name , email, password, role , photo 
const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: [true, 'name is Required'],
        trim: true, 
        minLength: [3, 'name must be at least 3 character']
    },
    email:{
        type: String, 
        required: [true, 'email is Required'],
        trim: true, 
        lowercase: true,
        unique: true,
        validate:[validator.isEmail, 'Please Provide a valid ']
    },
    password:{
        type: String,
        required: [true, 'Password is Required'],
        trim: true,
        minLength:[8, 'password must be at least 8 character']
    },
    role:{
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Role must be user or admin'
        },
        default: 'user',
        
    },

    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    otpCode:String,
    otpExpired:Date,
    isActive:{
           type:Boolean,
           default:false 
    }

},{
    timestamps: true,
    toObject:{
        virtuals:true
    },
    toJSON:{
        virtuals:true
    }
});



userSchema.virtual('cart',{
    ref:'Cart',
    localField:'_id',
    foreignField:'user'
});

userSchema.pre('save', async function(next){

    if(this.isNew || this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
        return next();
    }

    return next();
});

userSchema.pre('save', function (next){
    if(this.isModified('password')){

        this.passwordChangedAt = Date.now() - 1000;
    }
    return next();

})

userSchema.post('save', async function(doc, next){

    const cart = await Cart.create({user:doc._id});
    next();

});





userSchema.methods.CheckPassword = async function(inputPassword){

    return await bcrypt.compare(inputPassword, this.password);
}


userSchema.methods.checkUpdatePasswordState = function(JWTIAT){

    if(this.passwordChangedAt){

        const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTIAT < changedAt;
    }

    return false;
};


userSchema.methods.createResetPasswordToken = function(){

    const token = crypto.randomBytes(32).toString('hex');
    console.log()
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return token;
}



userSchema.methods.createOTP = function(){
    const otp = generatorOTP()
    this.otpCode =  crypto.createHash('sha256').update(otp.toString()).digest('hex');
    this.otpExpired = Date.now() + 60 * 60 * 1000;
    return otp;
};
userSchema.methods.toJSON= function(){

    const user = this;
    const userObject = user.toObject();
    delete userObject.__v;
    delete userObject.password

    return userObject;

}
export default mongoose.model('User', userSchema);

