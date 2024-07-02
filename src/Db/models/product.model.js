import mongoose from "mongoose";
import slug from 'slug'
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
        
    },
    price: {
        type: Number, 
        required: [true, 'price is Required'],
        min:[1, 'price must be at least 1']
    },
    category:{
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required:[true, 'Product must belong to a category']
    },
    subCategory:{
        type: mongoose.Types.ObjectId,
        ref: 'SubCategory'
    },
    quantity:{
        type: Number,
        default: 0,
        min: [0, 'Quantity can not be negative']
    },
    discount:{
        type:Number,
        default: 0.0,
    },
    images: [Object],
    size:{
        type: String,
        required: [true, 'size is Required'],
    },
    colors:[String]

},{
    timestamps: true,
    toJSON:{
        virtuals: true
    },
    toObject:{
        virtuals: true
    },
    id: false
});


productSchema.index({name: 1, size: 1}, {unique: true});
productSchema.virtual('productSalePrice').get(function (){
    return this.price - (this.price  * this.discount )
})

productSchema.pre('save', function(next){

    if(this.isNew || this.isModified('name')){
        this.slug =  slug(this.name, "_");
    }
    return next();
});

productSchema.pre('findOneAndUpdate', function(next){

    const update = this.getUpdate();

    if(update.name){
        this.slug =  slug(update.name, "_");
    }

    return next();
})



productSchema.methods.toJSON = function () {

    const product = this;
    const productObject = product.toObject();
    delete productObject.__v;
    delete productObject.createdAt;
    delete productObject.updatedAt; 
    return productObject;
}

export default mongoose.model('Product', productSchema);