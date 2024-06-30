import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name:{
        type: String,
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
        type:String,
        required:[true, 'slug is Required'],
        unique: true
    },
    category:{
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required: [true, 'SubCategory Must has a parent Category']
    }
}, {
    timestamps: true
});


subCategorySchema.methods.toJSON = function (){

    const subCategory = this;
    const subCategoryObject = subCategory.toObject();
    delete subCategoryObject.__v;
    delete subCategoryObject.createdAt;
    delete subCategoryObject.updatedAt;
    return subCategoryObject;
}

export default mongoose.model('SubCategory', subCategorySchema)