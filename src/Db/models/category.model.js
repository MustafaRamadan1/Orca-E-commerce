import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
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
    }
},{
    timestamps: true
});


categorySchema.methods.toJSON = function (){

    const category = this;
    const categoryObject = category.toObject();
    delete categoryObject.__v;
    delete  categoryObject.createdAt;
    delete categoryObject.updatedAt;
    return categoryObject;
}


export default mongoose.model('Category', categorySchema)