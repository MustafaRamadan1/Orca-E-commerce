import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'name is Required'],
        trim: true, 
        minLength: [3, 'name must be at least 3 character']
    },
    description:{
        type: String,
        required: [true, 'description is Required'],
        trim: true,
    },
    slug:{
        type: String,
        required: [true, 'Product must has a slug'],
        unique: true
    },
    price: {
        type: Number, 
        required: [true, 'price is Required'],
        min:[1, 'price must be at least 1']
    },
    category:{
        type: mongoose.Types.ObjectId,
        ref: 'Category'
    },
    subCategory:{
        type: mongoose.Types.ObjectId,
        ref: 'SubCategory'
    }
},{
    timestamps: true
});

export default mongoose.model('Product', productSchema);