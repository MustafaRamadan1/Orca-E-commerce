import mongoose from "mongoose";
import slug from "slug";
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

subCategorySchema.pre('save', function(next){

    if(this.isNew || this.isModified('name')){

        this.slug = slug(this.slug, '_')
    }
});

subCategorySchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.name) {
      update.slug = slug(update.name, '_');
    }
    next();
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