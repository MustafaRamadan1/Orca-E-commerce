import mongoose from "mongoose";
import slug from "slug";
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
        unique: true
    }
},{
    timestamps: true
});


categorySchema.pre('save', function(next){

    if(this.isNew || this.isModified('name')){
        this.slug =  slug(this.name, "_");
    }
    return next();
});

categorySchema.pre('findOneAndUpdate', function(next){

    const update = this.getUpdate();
    if(update.name){
        update.slug =  slug(update.name, "_");
    }

    return next();
})

categorySchema.methods.toJSON = function (){

    const category = this;
    const categoryObject = category.toObject();
    delete categoryObject.__v;
    delete  categoryObject.createdAt;
    delete categoryObject.updatedAt;
    return categoryObject;
}


export default mongoose.model('Category', categorySchema)